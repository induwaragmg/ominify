"""
SQLAlchemy ORM model for Message entity.
"""

import uuid
from datetime import datetime, UTC
from typing import Any, List, Dict, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, Index, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import UUID as CommonUUID

from app.database.session import Base

if TYPE_CHECKING:
    from app.models.conversation import Conversation


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        CommonUUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        CommonUUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    # Stored as JSON structure (uses JSONB on PostgreSQL, JSON on SQLite)
    content: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Many-to-1 relationship with Conversation
    conversation: Mapped["Conversation"] = relationship(
        "Conversation",
        back_populates="messages",
    )

    __table_args__ = (
        Index("idx_messages_conversation_created", "conversation_id", "created_at"),
    )
