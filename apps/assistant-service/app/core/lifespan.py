"""
FastAPI application lifespan event handler for startup config validation and shutdown procedures.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.core.logging import setup_logging

logger = logging.getLogger("assistant-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for managing application startup validation and shutdown events.
    Fails fast if critical configuration is missing.
    """
    # ── Startup Phase ──────────────────────────────────────────────────────────
    setup_logging()
    logger.info("Starting %s v%s [ENV: %s]", settings.PROJECT_NAME, settings.VERSION, settings.ENV)

    # Validate mandatory startup configuration (fails fast on invalid config)
    settings.validate_config()
    logger.info("Configuration validation succeeded.")

    yield

    # ── Shutdown Phase ─────────────────────────────────────────────────────────
    logger.info("Shutting down %s...", settings.PROJECT_NAME)
