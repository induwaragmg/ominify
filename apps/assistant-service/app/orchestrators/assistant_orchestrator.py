"""
Assistant Orchestrator owning the AI workflow execution graph via LangGraph state machine.
Supports REST message processing and standardized SSE event streaming with decision explainability.
"""

import json
import logging
import time
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional

from app.langgraph.graph import create_agent_graph
from app.langgraph.nodes import GraphNodeContext
from app.langgraph.schemas import UserPreferences
from app.llm.providers.gemini import GeminiProvider
from app.clients.product_client import ProductClient
from app.tools.registry import ToolRegistry, create_default_tool_registry
from app.core.logging_context import set_log_context, request_id_ctx
from app.models.message import Message

logger = logging.getLogger("assistant-service.orchestrator")


class AssistantOrchestrator:
    """
    Coordinates the stateful AI workflow graph using LangGraph.
    Handles REST message execution, decision explainability logging, and SSE streaming event generation.
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

        self.node_context = GraphNodeContext(
            gemini_provider=self.gemini,
            product_client=self.product_client,
            tool_registry=self.tool_registry,
        )
        self.agent_graph = create_agent_graph(self.node_context)

    async def process_message(
        self,
        conversation_id: uuid.UUID,
        user_id: str,
        user_message: str,
        history_messages: List[Message],
    ) -> Dict[str, Any]:
        """
        Executes the cognitive LangGraph state machine agent for a user prompt turn.
        Produces structured ExecutionPlan, UserPreferences, routing explanations, and response content blocks.
        """
        set_log_context(user_id=user_id, conversation_id=str(conversation_id))
        start_time = time.perf_counter()

        initial_state = {
            "conversation_id": str(conversation_id),
            "user_id": user_id,
            "request_id": request_id_ctx.get("-"),
            "user_message": user_message,
            "history_messages": history_messages,
            "product_recommendations": [],
            "user_preferences": UserPreferences(),
            "routing_reasons": [],
            "search_refinement_history": [],
            "errors": [],
        }

        thread_config = {"configurable": {"thread_id": str(conversation_id)}}
        logger.info("AssistantOrchestrator invoking cognitive LangGraph for thread_id '%s'", conversation_id)

        # Invoke LangGraph state machine
        final_state = await self.agent_graph.ainvoke(initial_state, config=thread_config)

        total_duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        routing_reasons = final_state.get("routing_reasons", [])
        logger.info(
            "AssistantOrchestrator completed LangGraph execution (duration: %.2f ms, decision trace: %s)",
            total_duration_ms,
            routing_reasons,
        )

        return {
            "text": final_state.get("response_text", ""),
            "content_blocks": final_state.get("content_blocks", []),
            "routing_reasons": routing_reasons,
        }

    async def stream_message(
        self,
        conversation_id: uuid.UUID,
        user_id: str,
        user_message: str,
        history_messages: List[Message],
    ) -> AsyncGenerator[str, None]:
        """
        Server-Sent Events (SSE) streaming generator emitting standardized event sequence:
        1. thinking
        2. planning
        3. tool_start (if tools needed)
        4. tool_finished (if tools needed)
        5. reasoning
        6. llm_chunk
        7. completed
        """
        set_log_context(user_id=user_id, conversation_id=str(conversation_id))

        try:
            # 1. Event: thinking
            yield self._format_sse_event("thinking", {"status": "analyzing_request", "conversation_id": str(conversation_id)})

            # 2. Event: planning
            words = user_message.lower().split()
            vague_words = {"shoes", "clothes", "laptop", "phone", "buy", "recommend"}
            needs_clarify = len(words) == 1 and words[0] in vague_words
            confidence = 0.45 if needs_clarify else 0.95

            yield self._format_sse_event("planning", {
                "intent": "clarification" if needs_clarify else "search_products",
                "confidence": confidence,
                "needs_clarification": needs_clarify,
                "reasoning": f"Planning confidence: {confidence:.2f}",
            })

            if needs_clarify:
                topic = words[0]
                if topic in ("shoes", "buy", "recommend"):
                    clarification_q = "Are you looking for running, basketball, casual, or formal shoes?"
                elif topic == "laptop":
                    clarification_q = "Are you looking for a gaming laptop, ultrabook, budget laptop, or work workstation?"
                else:
                    clarification_q = f"Could you please share a few more details about what type of {topic} you are looking for?"

                yield self._format_sse_event("completed", {
                    "text": clarification_q,
                    "content_blocks": [{"type": "text", "text": clarification_q}],
                })
                return

            recent_messages = history_messages[-8:] if len(history_messages) > 8 else history_messages
            from app.llm.prompts.prompt_builder import PromptBuilder
            sys_prompt = PromptBuilder.build_system_instruction()
            contents = PromptBuilder.build_conversation_contents(recent_messages, user_message)

            first_pass = await self.gemini.generate_response(
                messages=contents,
                system_prompt=sys_prompt,
                tools=self.tool_registry.get_genai_tools(),
            )

            function_calls = first_pass.get("function_calls", [])
            product_recommendations = []

            if function_calls:
                # 3. Event: tool_start
                yield self._format_sse_event("tool_start", {"tools": [fc.get("name") for fc in function_calls]})

                function_response_parts = []
                for fc in function_calls:
                    fn_name = fc.get("name")
                    fn_args = fc.get("args", {})
                    tool_output = await self.tool_registry.execute(fn_name, fn_args)

                    if isinstance(tool_output, dict):
                        if "products" in tool_output and isinstance(tool_output["products"], list):
                            product_recommendations.extend(tool_output["products"])
                        elif "product" in tool_output and isinstance(tool_output["product"], dict):
                            product_recommendations.append(tool_output["product"])

                    from google.genai import types
                    fn_part = types.Part.from_function_response(name=fn_name, response={"result": tool_output})
                    function_response_parts.append(fn_part)

                # 4. Event: tool_finished
                yield self._format_sse_event("tool_finished", {"count": len(product_recommendations)})

                candidate_content = first_pass.get("candidate_content")
                if candidate_content:
                    contents.append(candidate_content)
                else:
                    from google.genai import types
                    contents.append(types.Content(role="model", parts=[types.Part.from_text(text="Calling tool...")]))

                from google.genai import types
                contents.append(types.Content(role="user", parts=function_response_parts))

            # 5. Event: reasoning
            yield self._format_sse_event("reasoning", {"status": "synthesizing_response"})

            # 6. Event: llm_chunk
            full_text_parts = []
            async for chunk_text in self.gemini.stream_response(contents, system_prompt=sys_prompt):
                full_text_parts.append(chunk_text)
                yield self._format_sse_event("llm_chunk", {"delta": chunk_text})

            final_text = "".join(full_text_parts).strip()
            if not final_text and product_recommendations:
                final_text = "Here are the product recommendations matching your query:"

            content_blocks = [{"type": "text", "text": final_text}]
            if product_recommendations:
                unique_products = []
                seen_ids = set()
                for p in product_recommendations:
                    pid = p.get("id")
                    if pid not in seen_ids:
                        seen_ids.add(pid)
                        unique_products.append(p)
                content_blocks.append({"type": "product_recommendations", "products": unique_products})

            # 7. Event: completed
            yield self._format_sse_event("completed", {
                "text": final_text,
                "content_blocks": content_blocks,
            })

        except Exception as e:
            logger.error("Error during stream_message: %s", str(e))
            yield self._format_sse_event("completed", {
                "text": "I encountered an error processing your request.",
                "content_blocks": [{"type": "text", "text": "I encountered an error processing your request."}],
            })

    def _format_sse_event(self, event_type: str, data: Dict[str, Any]) -> str:
        """Formats string payload into standard EventSource SSE protocol event."""
        return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
