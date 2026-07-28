"""
Assistant Orchestrator owning the AI workflow execution graph using ToolRegistry and native google-genai function calling.
Features total orchestration metrics, tool execution timing, contextual logging, and exception handling.
"""

import logging
import time
import uuid
from typing import Any, Dict, List, Optional
from google.genai import types

from app.llm.providers.gemini import GeminiProvider
from app.llm.prompts.prompt_builder import PromptBuilder
from app.clients.product_client import ProductClient
from app.tools.registry import ToolRegistry, create_default_tool_registry
from app.core.logging_context import set_log_context
from app.models.message import Message

logger = logging.getLogger("assistant-service.orchestrator")


class AssistantOrchestrator:
    """
    Coordinates the native AI workflow execution graph:
    ToolRegistry -> PromptBuilder -> GeminiProvider -> Tool Execution -> FunctionResponse Appending -> Final Response Synthesis.
    Fully decoupled from individual tool classes via ToolRegistry.
    """

    def __init__(
        self,
        gemini_provider: Optional[GeminiProvider] = None,
        product_client: Optional[ProductClient] = None,
        tool_registry: Optional[ToolRegistry] = None,
    ):
        self.gemini = gemini_provider or GeminiProvider()
        self.product_client = product_client or ProductClient()
        self.tool_registry = tool_registry or create_default_tool_registry(self.product_client)

    async def process_message(
        self,
        conversation_id: uuid.UUID,
        user_id: str,
        user_message: str,
        history_messages: List[Message],
    ) -> Dict[str, Any]:
        """
        Executes the official google-genai native function calling workflow:
        User -> Gemini -> FunctionCall -> Tool Execution -> FunctionResponse -> Gemini -> Final Response.
        Measures total orchestration time and logs detailed execution metrics.
        """
        set_log_context(user_id=user_id, conversation_id=str(conversation_id))
        orch_start_time = time.perf_counter()

        system_instruction = PromptBuilder.build_system_instruction()
        contents = PromptBuilder.build_conversation_contents(history_messages, user_message)
        genai_tools = self.tool_registry.get_genai_tools()

        logger.info(
            "Orchestrator started processing message (prompt_version: %s, model: %s, history: %d turns)",
            PromptBuilder.PROMPT_VERSION,
            self.gemini.model_name,
            len(history_messages),
        )

        product_recommendations: List[Dict[str, Any]] = []
        final_text = ""
        max_iterations = 5
        iteration = 0

        while iteration < max_iterations:
            iteration += 1

            # Request completion from Gemini
            logger.info("Orchestrator pass %d: querying Gemini model '%s'", iteration, self.gemini.model_name)
            response_payload = await self.gemini.generate_response(
                messages=contents,
                system_prompt=system_instruction,
                tools=genai_tools,
            )

            function_calls = response_payload.get("function_calls", [])
            candidate_content = response_payload.get("candidate_content")
            response_text = response_payload.get("text", "")

            # If Gemini requested function call(s)
            if function_calls:
                logger.info("Orchestrator pass %d: Gemini requested %d function call(s)", iteration, len(function_calls))

                function_response_parts = []

                # Execute every requested function call via ToolRegistry
                for fc in function_calls:
                    fn_name = fc.get("name")
                    fn_args = fc.get("args", {})

                    tool_start_time = time.perf_counter()
                    logger.info("Tool selected: '%s' with args %s", fn_name, fn_args)

                    # Execute tool dynamically via ToolRegistry
                    tool_output = await self.tool_registry.execute(fn_name, fn_args)
                    tool_duration_ms = round((time.perf_counter() - tool_start_time) * 1000, 2)

                    logger.info("Tool execution finished: '%s' (duration: %.2f ms, status: %s)",
                                fn_name, tool_duration_ms, tool_output.get("status", "unknown"))

                    # Extract products for rich UI cards
                    if isinstance(tool_output, dict):
                        if "products" in tool_output and isinstance(tool_output["products"], list):
                            product_recommendations.extend(tool_output["products"])
                        elif "product" in tool_output and isinstance(tool_output["product"], dict):
                            product_recommendations.append(tool_output["product"])

                    # Create native FunctionResponse part
                    fn_part = types.Part.from_function_response(
                        name=fn_name,
                        response={"result": tool_output},
                    )
                    function_response_parts.append(fn_part)

                # Append candidate model turn (containing FunctionCall) into conversation contents
                if candidate_content:
                    contents.append(candidate_content)
                else:
                    contents.append(
                        types.Content(
                            role="model",
                            parts=[types.Part.from_text(text=response_text or "Calling function...")],
                        )
                    )

                # Append user turn with native FunctionResponse parts into conversation contents
                contents.append(
                    types.Content(
                        role="user",
                        parts=function_response_parts,
                    )
                )

                # Loop to send FunctionResponse parts back to Gemini for second completion pass
                continue

            # No further function calls requested by Gemini -> completion reached
            final_text = response_text
            break

        # Fallback search if Gemini is unconfigured or in offline test mode
        if not final_text and not product_recommendations and self._should_auto_trigger_search(user_message):
            tool_start_time = time.perf_counter()
            logger.info("Offline fallback keyword search triggered for query: '%s'", user_message)
            search_res = await self.tool_registry.execute("search_products", {"query": user_message, "limit": 5})
            tool_duration_ms = round((time.perf_counter() - tool_start_time) * 1000, 2)
            logger.info("Offline fallback search duration: %.2f ms", tool_duration_ms)

            if isinstance(search_res, dict) and "products" in search_res:
                product_recommendations.extend(search_res.get("products", []))
                final_text = f"Here are relevant products found for '{user_message}':"

        # Ensure fallback text if text is empty but product recommendations exist
        if not final_text and product_recommendations:
            final_text = "Here are the product recommendations matching your query:"

        # Clean fallback text if still empty
        if not final_text:
            final_text = "I am your Ominify AI Shopping Assistant. How can I help you find products today?"

        # Assemble final content blocks list for client
        content_blocks = [{"type": "text", "text": final_text}]
        if product_recommendations:
            # Deduplicate product recommendations by ID
            unique_products = []
            seen_ids = set()
            for p in product_recommendations:
                pid = p.get("id")
                if pid not in seen_ids:
                    seen_ids.add(pid)
                    unique_products.append(p)

            content_blocks.append({
                "type": "product_recommendations",
                "products": unique_products,
            })

        total_orch_duration_ms = round((time.perf_counter() - orch_start_time) * 1000, 2)
        logger.info(
            "Orchestration completed successfully (total_duration: %.2f ms, products_found: %d)",
            total_orch_duration_ms,
            len(product_recommendations),
        )

        return {
            "text": final_text,
            "content_blocks": content_blocks,
        }

    def _should_auto_trigger_search(self, query: str) -> bool:
        """Determines if query contains explicit shopping search keywords when LLM is offline."""
        q = query.lower()
        keywords = ["search", "find", "looking for", "recommend", "buy", "shoes", "shirt", "pants", "laptop", "phone"]
        return any(kw in q for kw in keywords)

    async def stream_message(
        self,
        conversation_id: uuid.UUID,
        user_id: str,
        user_message: str,
    ):
        """Streaming response boundary (Phase 4)."""
        raise NotImplementedError("Streaming is scheduled for Phase 4.")
