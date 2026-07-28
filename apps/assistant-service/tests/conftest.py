"""
Pytest configuration fixtures setting up SQLite test database.
"""

import os
# Override DATABASE_URL for pytest execution before app imports
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_assistant.db"
os.environ["ENV"] = "development"

import pytest
import asyncio
from app.database.session import engine, Base, AsyncSessionLocal
import app.models  # noqa: F401


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create test database tables synchronously at the start of the test session."""
    async def create_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(create_tables())
    yield
    async def drop_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

    asyncio.run(drop_tables())
