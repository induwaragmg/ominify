"""
SQLAlchemy repository implementation for Conversation data operations.
"""

import uuid
from datetime import datetime, UTC
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.conversation import Conversation


class ConversationRepository:
    """
    Encapsulates all database operations for Conversation entities.
    Strictly handles database query execution with zero business logic.
    """

    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def create(self, user_id: str, title: Optional[str] = None) -> Conversation:
        """Create and persist a new conversation thread."""
        conversation = Conversation(
            user_id=user_id,
            title=title or "New Conversation",
        )
        self.db_session.add(conversation)
        await self.db_session.commit()
        await self.db_session.refresh(conversation)
        return conversation

    async def get_by_id(self, conversation_id: uuid.UUID, user_id: str) -> Optional[Conversation]:
        """Fetch a single conversation by ID matching user_id."""
        stmt = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_raw_by_id(self, conversation_id: uuid.UUID) -> Optional[Conversation]:
        """Fetch a conversation by ID regardless of user ownership (for authorization checks)."""
        stmt = select(Conversation).where(Conversation.id == conversation_id)
        result = await self.db_session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: str, limit: int = 20, offset: int = 0) -> List[Conversation]:
        """Fetch paginated conversations belonging to user_id, ordered by updated_at desc."""
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db_session.execute(stmt)
        return list(result.scalars().all())

    async def update_timestamp(self, conversation_id: uuid.UUID) -> None:
        """Touch updated_at timestamp when a new message is added."""
        conversation = await self.get_raw_by_id(conversation_id)
        if conversation:
            conversation.updated_at = datetime.now(UTC)
            await self.db_session.commit()

    async def delete(self, conversation_id: uuid.UUID, user_id: str) -> bool:
        """Delete a conversation thread by ID for user_id. Cascade deletes messages automatically."""
        conversation = await self.get_by_id(conversation_id, user_id)
        if not conversation:
            return False

        await self.db_session.delete(conversation)
        await self.db_session.commit()
        return True
