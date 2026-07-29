"""
Pydantic schemas for standardized API error responses.
"""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Standardized API error response schema."""
    code: str = Field(description="Machine-readable error code")
    message: str = Field(description="Human-readable error explanation")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Optional diagnostic details")
