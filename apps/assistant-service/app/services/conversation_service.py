"""
Business logic service implementation for Conversation management.
"""

import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from app.repositories.conversation_repository import ConversationRepository
from app.models.conversation import Conversation


class ConversationService:
    """
    Coordinates business rules, access validation, and storage for conversations.
    """

    def __init__(self, conversation_repo: ConversationRepository):
        self.conversation_repo = conversation_repo

    async def create_conversation(self, user_id: str, title: Optional[str] = None) -> Conversation:
        """
        Creates a new conversation thread for the authenticated user.
        Generates default title if none provided.
        """
        default_title = title.strip() if title and title.strip() else "New Conversation"
        return await self.conversation_repo.create(user_id=user_id, title=default_title)

    async def get_conversation(self, conversation_id: uuid.UUID, user_id: str) -> Conversation:
        """
        Retrieves a conversation thread by ID for the authenticated user.
        Raises HTTP 404 if not found, HTTP 403 if thread belongs to another user.
        """
        # First check raw existence to distinguish 404 vs 403 authorization boundary
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

        return raw_conversation

    async def list_conversations(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Conversation]:
        """
        Lists all conversation threads owned by the authenticated user.
        """
        return await self.conversation_repo.list_by_user(user_id=user_id, limit=limit, offset=offset)

    async def delete_conversation(self, conversation_id: uuid.UUID, user_id: str) -> bool:
        """
        Deletes a conversation thread and its associated message history.
        """
        # Validate existence & ownership before deletion
        await self.get_conversation(conversation_id, user_id)
        return await self.conversation_repo.delete(conversation_id, user_id)
