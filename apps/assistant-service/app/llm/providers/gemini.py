"""
Google Gemini LLM provider implementation using official google-genai SDK.
Features latency tracking, token usage metrics logging, and domain exception handling.
"""

import logging
import time
from typing import Any, List, Dict, Optional
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.llm.providers.base import LLMProvider
from app.core.config import settings
from app.core.exceptions import LLMUnavailableError

logger = logging.getLogger("assistant-service.llm")


class GeminiProvider(LLMProvider):
    """
    Official Google Gemini provider implementation using google-genai SDK.
    Handles client initialization, model completion, native tool definition registration,
    structured function call extraction, latency metrics, token usage tracking, and error handling.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
    ):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL

        self.client = None
        if self.api_key and self.api_key.strip():
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Gemini Client initialized with model: %s", self.model_name)
            except Exception as e:
                logger.warning("Failed to initialize Gemini Client: %s", str(e))
        else:
            logger.warning("GEMINI_API_KEY is not set. Offline fallback mode active.")

    async def generate_response(
        self,
        messages: List[types.Content],
        system_prompt: Optional[str] = None,
        tools: Optional[List[types.Tool]] = None,
    ) -> Dict[str, Any]:
        """
        Generate completion from Gemini API.
        Returns dictionary containing:
          - text: Response text string
          - function_calls: List of structured function call dicts requested by Gemini
          - candidate_content: The candidate model Content object (containing FunctionCall parts)
          - latency_ms: API request duration in milliseconds
          - token_usage: Token usage counts (prompt, candidate, total)
          - raw_response: Raw SDK response object
        """
        if not self.client:
            logger.info("GEMINI_API_KEY not configured. Returning offline fallback response.")
            return {
                "text": "I am your Ominify AI Shopping Assistant! I can help you search products, compare specifications, find recommendations, and answer shopping questions.",
                "function_calls": [],
                "candidate_content": None,
                "latency_ms": 0.0,
                "token_usage": {},
                "raw_response": None,
            }

        start_time = time.perf_counter()
        logger.info("Gemini request started (model: %s, turns: %d, tools: %s)",
                    self.model_name, len(messages), bool(tools))

        try:
            config_kwargs: Dict[str, Any] = {}
            if system_prompt:
                config_kwargs["system_instruction"] = system_prompt

            if tools:
                config_kwargs["tools"] = tools

            config = types.GenerateContentConfig(**config_kwargs) if config_kwargs else None

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=messages,
                config=config,
            )

            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

            # Extract token usage metrics if available from Gemini response
            token_usage = {}
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                um = response.usage_metadata
                token_usage = {
                    "prompt_token_count": getattr(um, "prompt_token_count", 0),
                    "candidates_token_count": getattr(um, "candidates_token_count", 0),
                    "total_token_count": getattr(um, "total_token_count", 0),
                }

            function_calls = []
            if hasattr(response, "function_calls") and response.function_calls:
                for fc in response.function_calls:
                    function_calls.append({
                        "name": fc.name,
                        "args": dict(fc.args) if hasattr(fc, "args") and fc.args else {},
                    })
                    logger.info("Gemini requested native FunctionCall: '%s' with args %s", fc.name, fc.args)

            response_text = response.text if hasattr(response, "text") and response.text else ""

            candidate_content = None
            if response.candidates and len(response.candidates) > 0:
                candidate_content = response.candidates[0].content

            logger.info("Gemini request finished (model: %s, latency: %.2f ms, tokens: %s, function_calls: %d)",
                        self.model_name, latency_ms, token_usage, len(function_calls))

            return {
                "text": response_text,
                "function_calls": function_calls,
                "candidate_content": candidate_content,
                "latency_ms": latency_ms,
                "token_usage": token_usage,
                "raw_response": response,
            }

        except APIError as e:
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error("Gemini API error (%s) for model '%s' (latency: %.2f ms): %s",
                         e.code, self.model_name, latency_ms, e.message)
            return {
                "text": f"I encountered an API error while processing your shopping request: {e.message}",
                "function_calls": [],
                "candidate_content": None,
                "latency_ms": latency_ms,
                "token_usage": {},
                "raw_response": None,
            }
        except Exception as e:
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error("Unexpected error in GeminiProvider for model '%s' (latency: %.2f ms): %s",
                         self.model_name, latency_ms, str(e))
            return {
                "text": "I am currently unable to reach the AI model service. Please try again in a moment.",
                "function_calls": [],
                "candidate_content": None,
                "latency_ms": latency_ms,
                "token_usage": {},
                "raw_response": None,
            }

    async def stream_response(
        self,
        messages: List[Any],
        system_prompt: Optional[str] = None,
        tools: Optional[List[types.Tool]] = None,
    ):
        """Placeholder for SSE streaming in Phase 4."""
        raise NotImplementedError("Streaming is scheduled for Phase 4.")
