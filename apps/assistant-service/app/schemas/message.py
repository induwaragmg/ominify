"""
Pydantic v2 schemas for Message requests and responses.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Union
from pydantic import BaseModel, ConfigDict, Field, field_validator


class MessageCreate(BaseModel):
    """Payload schema for creating/sending a new message."""
    role: str = Field(
        default="user",
        pattern="^(user|assistant|system)$",
        description="Role of the message author (user, assistant, system)",
    )
    content: Union[str, List[Dict[str, Any]]] = Field(
        description="Message content text string or array of content blocks",
    )

    @field_validator("content")
    @classmethod
    def validate_content_not_empty(cls, v: Union[str, List[Dict[str, Any]]]) -> Union[str, List[Dict[str, Any]]]:
        if isinstance(v, str):
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Message content text cannot be empty")
            if len(trimmed) > 10000:
                raise ValueError("Message content exceeds maximum allowed length (10,000 characters)")
        elif isinstance(v, list):
            if len(v) == 0:
                raise ValueError("Message content blocks array cannot be empty")
        return v


class MessageResponse(BaseModel):
    """Response schema representing a single message."""
    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str
    content: List[Dict[str, Any]]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageListResponse(BaseModel):
    """Response schema representing a list of messages inside a conversation."""
    messages: List[MessageResponse]
    total: int
