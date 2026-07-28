"""
Pydantic schemas for health check endpoint.
"""

from datetime import datetime, UTC
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str = Field(default="healthy", description="Application health status")
    version: str = Field(description="Application version")
    environment: str = Field(description="Active runtime environment")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC), description="UTC timestamp of response")
