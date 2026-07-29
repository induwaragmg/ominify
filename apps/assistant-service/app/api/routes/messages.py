"""
REST API routes for Message management and Server-Sent Events (SSE) streaming.
"""

import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.message import (
    MessageCreate,
    MessageResponse,
    MessageListResponse,
)
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.services.message_service import MessageService

router = APIRouter()


def get_message_service(db: AsyncSession = Depends(get_db)) -> MessageService:
    msg_repo = MessageRepository(db)
    conv_repo = ConversationRepository(db)
    return MessageService(msg_repo, conv_repo)


@router.post(
    "",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send / Store Message",
    description="Stores a message within the conversation thread after validating user ownership.",
)
async def create_message(
    conversation_id: uuid.UUID,
    payload: MessageCreate,
    current_user: CurrentUser = Depends(get_current_user),
    service: MessageService = Depends(get_message_service),
) -> MessageResponse:
    message = await service.create_message(
        conversation_id=conversation_id,
        user_id=current_user.user_id,
        role=payload.role,
        content=payload.content,
    )
    return MessageResponse.model_validate(message)


@router.post(
    "/stream",
    summary="Stream AI Assistant Response (SSE)",
    description="Streams Server-Sent Events (text/event-stream) for thinking, tool execution, and native LLM chunks.",
)
async def create_message_stream(
    conversation_id: uuid.UUID,
    payload: MessageCreate,
    current_user: CurrentUser = Depends(get_current_user),
    service: MessageService = Depends(get_message_service),
) -> StreamingResponse:
    user_text = payload.content if isinstance(payload.content, str) else str(payload.content)
    generator = service.create_message_stream(
        conversation_id=conversation_id,
        user_id=current_user.user_id,
        user_message_text=user_text,
    )
    return StreamingResponse(generator, media_type="text/event-stream")


@router.get(
    "",
    response_model=MessageListResponse,
    summary="List Conversation Messages",
    description="Fetches message history for a specific conversation thread. Validates user ownership.",
)
async def list_messages(
    conversation_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    service: MessageService = Depends(get_message_service),
) -> MessageListResponse:
    messages = await service.list_messages(
        conversation_id=conversation_id,
        user_id=current_user.user_id,
    )
    items = [MessageResponse.model_validate(m) for m in messages]
    return MessageListResponse(messages=items, total=len(items))
