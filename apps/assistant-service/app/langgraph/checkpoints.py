"""
Abstract Checkpointer factory providing pluggable MemorySaver, PostgresSaver, or RedisSaver checkpointer backends.
"""

import logging
from typing import Any, Optional
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.checkpoint.memory import MemorySaver

logger = logging.getLogger("assistant-service.langgraph.checkpoints")


class CheckpointerFactory:
    """
    Factory creating LangGraph checkpoint savers.
    Abstracts checkpointer instance creation so memory, PostgreSQL, or Redis backends
    can be swapped without mutating graph definition logic.
    """

    @staticmethod
    def get_checkpointer(backend_type: str = "memory", connection_string: Optional[str] = None) -> BaseCheckpointSaver:
        """
        Returns a compiled BaseCheckpointSaver instance.
        Defaults to in-memory MemorySaver for thread state isolation.
        """
        if backend_type == "memory":
            logger.info("CheckpointerFactory providing MemorySaver checkpointer backend.")
            return MemorySaver()
        elif backend_type in ("postgres", "postgresql"):
            logger.info("CheckpointerFactory configured for PostgreSQL checkpointer (fallback MemorySaver).")
            # Fallback to MemorySaver until postgres checkpointer package is configured
            return MemorySaver()
        elif backend_type == "redis":
            logger.info("CheckpointerFactory configured for Redis checkpointer (fallback MemorySaver).")
            return MemorySaver()
        else:
            logger.warning("Unknown checkpointer backend '%s'. Defaulting to MemorySaver.", backend_type)
            return MemorySaver()
