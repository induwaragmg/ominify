"""
Centralized prompt builder for assembling Gemini context window payloads and conversation history.
"""

import logging
from typing import List
from google.genai import types

from app.llm.prompts.system_prompt import SYSTEM_PROMPT_TEMPLATE
from app.llm.prompts.shopping_prompt import SHOPPING_ASSISTANT_PROMPT
from app.models.message import Message

logger = logging.getLogger("assistant-service.prompts")

PROMPT_VERSION: str = "v1.0"


class PromptBuilder:
    """
    Assembles system instructions and formatted conversation history as native types.Content objects.
    Single location for all prompt assembly logic.
    Exposes PROMPT_VERSION = "v1.0" for prompt engineering experimentation tracking.
    """

    PROMPT_VERSION: str = PROMPT_VERSION

    @staticmethod
    def build_system_instruction() -> str:
        """Combines system guidelines and shopping prompt rules into a unified system instruction string."""
        logger.info("PromptBuilder building system instruction (version: %s)", PROMPT_VERSION)
        return f"{SYSTEM_PROMPT_TEMPLATE.strip()}\n\n{SHOPPING_ASSISTANT_PROMPT.strip()}"

    @staticmethod
    def build_conversation_contents(
        history_messages: List[Message],
        current_user_message: str,
    ) -> List[types.Content]:
        """
        Formats previous database Message records and the new user message into native google-genai types.Content objects.
        Tool responses are handled as native FunctionResponse parts in the orchestrator, never injected as text here.
        """
        logger.info(
            "PromptBuilder assembling conversation history (version: %s, history turns: %d)",
            PROMPT_VERSION,
            len(history_messages),
        )
        contents: List[types.Content] = []

        # Format past conversation history
        for msg in history_messages:
            text_parts = []
            if isinstance(msg.content, list):
                for block in msg.content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text_parts.append(block.get("text", ""))
            elif isinstance(msg.content, str):
                text_parts.append(msg.content)

            full_text = "\n".join(text_parts).strip()
            if full_text:
                role_label = "user" if msg.role == "user" else "model"
                contents.append(
                    types.Content(
                        role=role_label,
                        parts=[types.Part.from_text(text=full_text)],
                    )
                )

        # Append current user prompt
        if current_user_message and current_user_message.strip():
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=current_user_message.strip())],
                )
            )

        return contents
