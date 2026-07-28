"""
Pydantic schemas for authenticated user context.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class CurrentUser(BaseModel):
    """Schema representing the currently authenticated user in the request context."""
    user_id: str = Field(description="Unique user identifier (e.g. Clerk user ID)")
    email: Optional[str] = Field(default=None, description="User primary email address")
    roles: List[str] = Field(default_factory=list, description="User access roles")
