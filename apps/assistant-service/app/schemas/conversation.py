"""
Pydantic v2 schemas for Conversation requests and responses.
"""

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ConversationCreate(BaseModel):
    """Payload schema for creating a new conversation."""
    title: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Optional title for the conversation thread",
    )


class ConversationResponse(BaseModel):
    """Response schema representing a conversation thread."""
    id: uuid.UUID
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationListResponse(BaseModel):
    """Response schema representing a list of conversation threads."""
    conversations: List[ConversationResponse]
    total: int
