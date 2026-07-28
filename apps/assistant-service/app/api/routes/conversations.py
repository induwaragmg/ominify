"""
REST API routes for Conversation management.
"""

import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.schemas.auth import CurrentUser
from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
    ConversationListResponse,
)
from app.repositories.conversation_repository import ConversationRepository
from app.services.conversation_service import ConversationService

router = APIRouter()


def get_conversation_service(db: AsyncSession = Depends(get_db)) -> ConversationService:
    repo = ConversationRepository(db)
    return ConversationService(repo)


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Conversation",
    description="Creates a new conversation thread for the authenticated user.",
)
async def create_conversation(
    payload: ConversationCreate = ConversationCreate(),
    current_user: CurrentUser = Depends(get_current_user),
    service: ConversationService = Depends(get_conversation_service),
) -> ConversationResponse:
    conversation = await service.create_conversation(
        user_id=current_user.user_id,
        title=payload.title,
    )
    return ConversationResponse.model_validate(conversation)


@router.get(
    "",
    response_model=ConversationListResponse,
    summary="List Conversations",
    description="Fetches a paginated list of active conversation threads owned by the user.",
)
async def list_conversations(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: CurrentUser = Depends(get_current_user),
    service: ConversationService = Depends(get_conversation_service),
) -> ConversationListResponse:
    conversations = await service.list_conversations(
        user_id=current_user.user_id,
        limit=limit,
        offset=offset,
    )
    items = [ConversationResponse.model_validate(c) for c in conversations]
    return ConversationListResponse(conversations=items, total=len(items))


@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
    summary="Get Conversation Details",
    description="Retrieves a single conversation thread by ID. Validates user ownership.",
)
async def get_conversation(
    conversation_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    service: ConversationService = Depends(get_conversation_service),
) -> ConversationResponse:
    conversation = await service.get_conversation(
        conversation_id=conversation_id,
        user_id=current_user.user_id,
    )
    return ConversationResponse.model_validate(conversation)


@router.delete(
    "/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Conversation",
    description="Deletes a conversation thread and all its stored messages.",
)
async def delete_conversation(
    conversation_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    service: ConversationService = Depends(get_conversation_service),
):
    await service.delete_conversation(
        conversation_id=conversation_id,
        user_id=current_user.user_id,
    )
    return None
