"""
Centralized logging configuration for the assistant service.
"""

import logging
import sys
from app.core.config import settings
from app.core.logging_context import ContextInjectingFilter


def setup_logging() -> None:
    """Configures application-wide logging format, filters, and log levels."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.addFilter(ContextInjectingFilter())

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d - %(message)s",
        handlers=[stream_handler],
        force=True,
    )

    # Quiet external verbose loggers
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("asyncio").setLevel(logging.WARNING)

    logger = logging.getLogger("assistant-service")
    logger.info("Logging initialized with level: %s", logging.getLevelName(log_level))
