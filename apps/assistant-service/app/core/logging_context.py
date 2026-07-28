"""
Contextvars and logging filter for injecting request_id, user_id, and conversation_id into all service logs.
"""

import contextvars
import logging
import uuid
from typing import Optional

# Context variables for per-request tracing
request_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="-")
user_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar("user_id", default="-")
conversation_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar("conversation_id", default="-")


def set_log_context(
    request_id: Optional[str] = None,
    user_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
) -> None:
    """Sets context variables for current async task log tracing."""
    if request_id is not None:
        request_id_ctx.set(request_id)
    if user_id is not None:
        user_id_ctx.set(user_id)
    if conversation_id is not None:
        conversation_id_ctx.set(str(conversation_id))


def get_log_context_str() -> str:
    """Returns formatted tracing header prefix [request_id=...] [user_id=...] [conversation_id=...]."""
    req_id = request_id_ctx.get("-")
    u_id = user_id_ctx.get("-")
    c_id = conversation_id_ctx.get("-")
    return f"[request_id={req_id}] [user_id={u_id}] [conversation_id={c_id}]"


class ContextInjectingFilter(logging.Filter):
    """
    Logging filter that automatically injects [request_id=...] [user_id=...] [conversation_id=...]
    into log record prefixes.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        ctx_prefix = get_log_context_str()
        if not hasattr(record, "ctx_injected"):
            record.msg = f"{ctx_prefix} {record.msg}"
            record.ctx_injected = True
        return True
