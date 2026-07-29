"""
Health check route endpoint.
"""

from datetime import datetime, UTC
from fastapi import APIRouter
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Returns application health status, version, environment, and timestamp.",
)
async def health_check() -> HealthResponse:
    """Returns application health status."""
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENV,
        timestamp=datetime.now(UTC),
    )
