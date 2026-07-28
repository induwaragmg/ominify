"""
SQLAlchemy repository implementation for Message data operations.
"""

import uuid
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.message import Message


class MessageRepository:
    """
    Encapsulates all database operations for Message entities.
    Strictly handles database query execution with zero business logic.
    """

    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def create(
        self,
        conversation_id: uuid.UUID,
        role: str,
        content: List[Dict[str, Any]],
    ) -> Message:
        """Persist a message entry inside a conversation."""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )
        self.db_session.add(message)
        await self.db_session.commit()
        await self.db_session.refresh(message)
        return message

    async def list_by_conversation(self, conversation_id: uuid.UUID) -> List[Message]:
        """Fetch all messages for a specific conversation ID ordered by creation time."""
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        result = await self.db_session.execute(stmt)
        return list(result.scalars().all())
