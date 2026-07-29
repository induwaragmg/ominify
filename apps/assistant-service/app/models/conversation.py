"""
SQLAlchemy ORM model for Conversation entity.
"""

import uuid
from datetime import datetime, UTC
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import UUID as CommonUUID

from app.database.session import Base

if TYPE_CHECKING:
    from app.models.message import Message


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        CommonUUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="New Conversation",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    # 1-to-many relationship with Message
    messages: Mapped[List["Message"]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="Message.created_at.asc()",
    )

    __table_args__ = (
        Index("idx_conversations_user_updated", "user_id", "updated_at"),
    )
