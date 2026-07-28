"""
Abstract base class interface for Large Language Model (LLM) providers.
"""

from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator, List, Dict, Optional


class LLMProvider(ABC):
    """
    Abstract interface for LLM provider integrations (e.g. Gemini, OpenAI, Ollama).
    """

    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> Any:
        """Generate a complete completion response from the model."""
        pass

    @abstractmethod
    async def stream_response(
        self,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> AsyncGenerator[Any, None]:
        """Stream completion response chunks from the model."""
        pass
