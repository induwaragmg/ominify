"""
Preference-extracting conversation summarizer separating dialogue narrative from long-term UserPreferences.
"""

import logging
import re
from typing import Dict, List, Optional, Tuple, Any
from app.models.message import Message
from app.langgraph.schemas import UserPreferences

logger = logging.getLogger("assistant-service.summarizer")

MAX_UNSUMMARIZED_MESSAGES = 8


class ConversationSummarizer:
    """
    Summarizes older conversation turns while extracting structured UserPreferences
    (budget, brand, color, size, purpose, gender, negative preferences).
    """

    @staticmethod
    def extract_user_preferences(
        history_messages: List[Message],
        existing_prefs: Optional[UserPreferences] = None,
    ) -> UserPreferences:
        """
        Parses user messages across history to extract structured shopping preferences.
        """
        prefs_data = existing_prefs.model_dump() if existing_prefs else UserPreferences().model_dump()

        for msg in history_messages:
            if msg.role != "user":
                continue

            text_parts = []
            if isinstance(msg.content, list):
                for block in msg.content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text_parts.append(block.get("text", ""))
            elif isinstance(msg.content, str):
                text_parts.append(msg.content)

            full_text = " ".join(text_parts).strip()
            lower = full_text.lower()

            # Budget extraction
            budget_match = re.search(r"under\s+\$?(\d+)|budget\s+(?:is\s+)?\$?(\d+)", lower)
            if budget_match:
                val = budget_match.group(1) or budget_match.group(2)
                prefs_data["budget"] = f"under ${val}"

            # Brand extraction
            for b in ["nike", "adidas", "puma", "apple", "samsung", "sony", "dell", "hp", "lenovo"]:
                if b in lower:
                    prefs_data["brand"] = b.capitalize()

            # Color extraction
            for c in ["black", "white", "red", "blue", "green", "grey", "silver", "gold"]:
                if f" {c} " in f" {lower} ":
                    prefs_data["color"] = c.capitalize()

            # Purpose extraction
            if "running" in lower:
                prefs_data["purpose"] = "Running"
            elif "basketball" in lower:
                prefs_data["purpose"] = "Basketball"
            elif "formal" in lower or "dress" in lower:
                prefs_data["purpose"] = "Formal"
            elif "casual" in lower:
                prefs_data["purpose"] = "Casual"
            elif "gaming" in lower:
                prefs_data["purpose"] = "Gaming"

            # Gender target
            if "women" in lower or "female" in lower:
                prefs_data["gender"] = "Women"
            elif "men" in lower or "male" in lower:
                prefs_data["gender"] = "Men"

            # Negative preferences
            if "not" in lower or "don't want" in lower or "no " in lower:
                prefs_data["negative_preferences"].append(full_text)

        return UserPreferences(**prefs_data)

    @staticmethod
    def partition_and_summarize(
        history_messages: List[Message],
        existing_summary: str = "",
        existing_prefs: Optional[UserPreferences] = None,
    ) -> Tuple[List[Message], str, UserPreferences]:
        """
        Partitions history into older messages to summarize and recent messages to preserve intact.
        Returns (recent_messages, dialogue_summary, extracted_user_preferences).
        """
        extracted_prefs = ConversationSummarizer.extract_user_preferences(history_messages, existing_prefs)

        if len(history_messages) <= MAX_UNSUMMARIZED_MESSAGES:
            return history_messages, existing_summary, extracted_prefs

        cutoff_index = len(history_messages) - MAX_UNSUMMARIZED_MESSAGES
        older_messages = history_messages[:cutoff_index]
        recent_messages = history_messages[cutoff_index:]

        summary_lines = []
        if existing_summary:
            summary_lines.append(f"Previous Dialogue Summary: {existing_summary}")

        for msg in older_messages:
            role_label = "User" if msg.role == "user" else "Assistant"
            text_parts = []
            if isinstance(msg.content, list):
                for block in msg.content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text_parts.append(block.get("text", ""))
            elif isinstance(msg.content, str):
                text_parts.append(msg.content)

            full_text = " ".join(text_parts).strip()
            if full_text:
                summary_lines.append(f"{role_label}: {full_text[:120]}")

        updated_summary = " | ".join(summary_lines)
        logger.info(
            "ConversationSummarizer summarized %d turns (summary len: %d, extracted prefs: %s)",
            len(older_messages),
            len(updated_summary),
            extracted_prefs.model_dump(exclude_none=True),
        )

        return recent_messages, updated_summary, extracted_prefs
