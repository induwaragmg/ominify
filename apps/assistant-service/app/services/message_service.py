"""
Business logic service implementation for Message management and AI response orchestration.
"""

import json
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional, Union
from fastapi import HTTPException, status
from app.repositories.message_repository import MessageRepository
from app.repositories.conversation_repository import ConversationRepository
from app.models.message import Message
from app.orchestrators.assistant_orchestrator import AssistantOrchestrator


class MessageService:
    """
    Coordinates business rules, ownership validation, content formatting, message persistence,
    and AI orchestrator invocation.
    """

    def __init__(
        self,
        message_repo: MessageRepository,
        conversation_repo: ConversationRepository,
        orchestrator: Optional[AssistantOrchestrator] = None,
    ):
        self.message_repo = message_repo
        self.conversation_repo = conversation_repo
        self.orchestrator = orchestrator or AssistantOrchestrator()

    async def create_message(
        self,
        conversation_id: uuid.UUID,
        user_id: str,
        role: str,
        content: Union[str, List[Dict[str, Any]]],
    ) -> Message:
        """
        Validates conversation ownership, persists user message, triggers AI orchestrator,
        stores assistant response, and returns the resulting assistant message.
        """
        # Validate conversation exists and belongs to user_id
        raw_conversation = await self.conversation_repo.get_raw_by_id(conversation_id)
        if not raw_conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation '{conversation_id}' not found",
            )

        if raw_conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Conversation belongs to another user",
            )

        # Standardize content blocks
        if isinstance(content, str):
            trimmed = content.strip()
            if not trimmed:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Message content text cannot be empty",
                )
            content_blocks = [{"type": "text", "text": trimmed}]
        elif isinstance(content, list):
            if len(content) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Message content blocks array cannot be empty",
                )
            content_blocks = content
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid message content payload",
            )

        # Fetch history before adding current message
        history_messages = await self.message_repo.list_by_conversation(conversation_id)

        # Persist user message entry
        user_msg = await self.message_repo.create(
            conversation_id=conversation_id,
            role=role,
            content=content_blocks,
        )

        # Auto-generate conversation title from first user message if current title is default
        if raw_conversation.title == "New Conversation" and role == "user" and isinstance(content, str):
            new_title = content.strip()[:30]
            if len(content.strip()) > 30:
                new_title += "..."
            raw_conversation.title = new_title
            await self.conversation_repo.db_session.commit()

        # If role is user, invoke AssistantOrchestrator to generate and persist AI reply
        if role == "user":
            user_text = content if isinstance(content, str) else str(content)
            ai_result = await self.orchestrator.process_message(
                conversation_id=conversation_id,
                user_id=user_id,
                user_message=user_text,
                history_messages=history_messages,
            )

            assistant_msg = await self.message_repo.create(
                conversation_id=conversation_id,
                role="assistant",
                content=ai_result["content_blocks"],
            )

            # Touch conversation updated_at timestamp
            await self.conversation_repo.update_timestamp(conversation_id)
            return assistant_msg

        # Touch conversation updated_at timestamp for non-user posts
        await self.conversation_repo.update_timestamp(conversation_id)
        return user_msg

    async def create_message_stream(
        self,
        conversation_id: uuid.UUID,
        user_id: str,
        user_message_text: str,
    ) -> AsyncGenerator[str, None]:
        """
        Streams SSE events from AI orchestrator and persists the final assistant message upon completion.
        """
        raw_conversation = await self.conversation_repo.get_raw_by_id(conversation_id)
        if not raw_conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation '{conversation_id}' not found",
            )

        if raw_conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Conversation belongs to another user",
            )

        history_messages = await self.message_repo.list_by_conversation(conversation_id)

        # Persist user message entry
        await self.message_repo.create(
            conversation_id=conversation_id,
            role="user",
            content=[{"type": "text", "text": user_message_text.strip()}],
        )

        final_content_blocks = []

        async for sse_event in self.orchestrator.stream_message(
            conversation_id=conversation_id,
            user_id=user_id,
            user_message=user_message_text,
            history_messages=history_messages,
        ):
            if "event: completed" in sse_event:
                try:
                    data_str = sse_event.split("data: ")[1].strip()
                    payload = json.loads(data_str)
                    final_content_blocks = payload.get("content_blocks", [])
                except Exception:
                    pass

            yield sse_event

        if final_content_blocks:
            await self.message_repo.create(
                conversation_id=conversation_id,
                role="assistant",
                content=final_content_blocks,
            )
            await self.conversation_repo.update_timestamp(conversation_id)

    async def list_messages(
        self,
        conversation_id: uuid.UUID,
        user_id: str,
    ) -> List[Message]:
        """
        Lists all messages for a conversation ID after validating user ownership.
        """
        raw_conversation = await self.conversation_repo.get_raw_by_id(conversation_id)
        if not raw_conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation '{conversation_id}' not found",
            )

        if raw_conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Conversation belongs to another user",
            )

        return await self.message_repo.list_by_conversation(conversation_id)
