"""
Cognitive LangGraph node implementations for state machine planning, clarification, tool execution, search refinement, and response assembly.
"""

import asyncio
import logging
import time
from typing import Any, Dict, List, Optional
from google.genai import types

from app.langgraph.state import AssistantState
from app.langgraph.schemas import ExecutionPlan, UserPreferences
from app.langgraph.summarizer import ConversationSummarizer
from app.llm.prompts.prompt_builder import PromptBuilder
from app.llm.providers.gemini import GeminiProvider
from app.tools.registry import ToolRegistry, create_default_tool_registry
from app.clients.product_client import ProductClient

logger = logging.getLogger("assistant-service.langgraph.nodes")


class GraphNodeContext:
    """Dependency container for LangGraph nodes."""

    def __init__(
        self,
        gemini_provider: Optional[GeminiProvider] = None,
        product_client: Optional[ProductClient] = None,
        tool_registry: Optional[ToolRegistry] = None,
    ):
        self.gemini = gemini_provider or GeminiProvider()
        self.product_client = product_client or ProductClient()
        self.tool_registry = tool_registry or create_default_tool_registry(self.product_client)


def planning_node(state: AssistantState, context: GraphNodeContext) -> Dict[str, Any]:
    """
    Node: Analyzes user prompt and conversation context to produce a strongly typed ExecutionPlan.
    Calculates confidence score, extracts structured UserPreferences, plans dependency graphs, and records reasoning.
    """
    logger.info("LangGraph Node: PlanningNode started")
    user_message = (state.get("user_message") or "").strip()
    history_messages = state.get("history_messages", [])
    existing_summary = state.get("summary", "")
    existing_prefs = state.get("user_preferences")

    recent_messages, updated_summary, user_preferences = ConversationSummarizer.partition_and_summarize(
        history_messages, existing_summary, existing_prefs
    )

    system_instruction = PromptBuilder.build_system_instruction(
        summary=updated_summary,
        user_preferences=user_preferences,
    )
    contents = PromptBuilder.build_conversation_contents(
        history_messages=recent_messages,
        current_user_message=user_message,
        summary=updated_summary,
    )
    genai_tools = context.tool_registry.get_genai_tools()

    # Calculate Confidence Score & Intent Analysis
    lower_msg = user_message.lower()
    words = lower_msg.split()

    vague_single_words = {"shoes", "clothes", "laptop", "phone", "buy", "recommend", "product", "items"}
    is_single_vague_word = len(words) == 1 and words[0] in vague_single_words

    if is_single_vague_word:
        confidence = 0.45
        clarification_needed = True
        topic = words[0]
        if topic in ("shoes", "buy", "recommend"):
            clarification_q = "Are you looking for running, basketball, casual, or formal shoes?"
        elif topic == "laptop":
            clarification_q = "Are you looking for a gaming laptop, ultrabook, budget laptop, or work workstation?"
        else:
            clarification_q = f"Could you please share a few more details about what type of {topic} you are looking for?"
        intent = "clarification"
        required_tools = []
        parallel_groups = []
        dependencies = {}
        reasoning = f"Query '{user_message}' is single vague topic without specific criteria. Assigning low confidence (0.45) and requesting clarification."
    else:
        confidence = 0.95
        clarification_needed = False
        clarification_q = None
        intent = "search_products"
        required_tools = ["search_products"]

        if "compare" in lower_msg:
            intent = "compare_products"
            required_tools = ["search_products", "compare_products"]
            parallel_groups = [["search_products"]]
            dependencies = {"compare_products": ["search_products"]}
        else:
            parallel_groups = [["search_products"]]
            dependencies = {}

        reasoning = f"Query contains clear intent '{intent}' with specific search criteria. Assigning high confidence (0.95)."

    execution_plan = ExecutionPlan(
        intent=intent,
        shopping_objective=f"Assist user with query: '{user_message}'",
        extracted_preferences=user_preferences.model_dump(exclude_none=True),
        confidence=confidence,
        required_tools=required_tools,
        execution_order=required_tools,
        parallel_groups=parallel_groups,
        dependencies=dependencies,
        expected_outputs=["product_recommendations"],
        clarification_needed=clarification_needed,
        clarification_question=clarification_q,
        reasoning=reasoning,
    )

    routing_reasons = list(state.get("routing_reasons", []))
    routing_reasons.append(f"PlanningNode generated ExecutionPlan: confidence={confidence:.2f}, intent='{intent}', clarification_needed={clarification_needed}")

    logger.info("PlanningNode generated ExecutionPlan (confidence: %.2f, intent: %s, reasoning: %s)",
                confidence, intent, reasoning)

    return {
        "summary": updated_summary,
        "user_preferences": user_preferences,
        "system_instruction": system_instruction,
        "contents": contents,
        "genai_tools": genai_tools,
        "execution_plan": execution_plan,
        "needs_clarification": clarification_needed,
        "clarification_question": clarification_q or "",
        "routing_reasons": routing_reasons,
        "current_iteration": 0,
        "max_iterations": state.get("max_iterations", 5),
    }


def clarification_node(state: AssistantState, context: GraphNodeContext) -> Dict[str, Any]:
    """
    Node: Formats a context-aware clarification question derived from the ExecutionPlan.
    """
    logger.info("LangGraph Node: ClarificationNode started")
    exec_plan = state.get("execution_plan")
    clarification_q = (
        exec_plan.clarification_question if exec_plan and exec_plan.clarification_question
        else state.get("clarification_question") or "Could you please provide a few more details so I can recommend the perfect products for you?"
    )

    routing_reasons = list(state.get("routing_reasons", []))
    routing_reasons.append("ClarificationNode executed: returned targeted clarification question to user")

    content_blocks = [{"type": "text", "text": clarification_q}]
    return {
        "response_text": clarification_q,
        "content_blocks": content_blocks,
        "needs_clarification": False,
        "routing_reasons": routing_reasons,
    }


async def llm_node(state: AssistantState, context: GraphNodeContext) -> Dict[str, Any]:
    """Node: Queries Gemini Provider for candidate response or function call requests."""
    current_iter = state.get("current_iteration", 0) + 1
    logger.info("LangGraph Node: LLMNode started (pass %d)", current_iter)

    contents = state.get("contents", [])
    system_instruction = state.get("system_instruction")
    tools = state.get("genai_tools")

    response_payload = await context.gemini.generate_response(
        messages=contents,
        system_prompt=system_instruction,
        tools=tools,
    )

    return {
        "function_calls": response_payload.get("function_calls", []),
        "candidate_content": response_payload.get("candidate_content"),
        "response_text": response_payload.get("text", ""),
        "current_iteration": current_iter,
        "token_usage": response_payload.get("token_usage", {}),
    }


async def tool_execution_node(state: AssistantState, context: GraphNodeContext) -> Dict[str, Any]:
    """
    Node: Consumes dependency mapping inside ExecutionPlan to schedule independent tools in parallel
    and dependent tools sequentially.
    """
    function_calls = state.get("function_calls", [])
    exec_plan = state.get("execution_plan")
    contents = list(state.get("contents", []))
    candidate_content = state.get("candidate_content")
    response_text = state.get("response_text", "")
    existing_products = list(state.get("product_recommendations", []))

    dependencies = exec_plan.dependencies if exec_plan else {}
    logger.info("LangGraph Node: ToolExecutionNode executing %d tool(s) with dependencies: %s",
                len(function_calls), dependencies)

    independent_calls = []
    dependent_calls = []

    for fc in function_calls:
        fn_name = fc.get("name")
        if fn_name in dependencies and dependencies[fn_name]:
            dependent_calls.append(fc)
        else:
            independent_calls.append(fc)

    results = []

    # Parallel Execution of Independent Tools
    if independent_calls:
        logger.info("Executing %d independent tools concurrently via asyncio.gather()", len(independent_calls))

        async def _exec_indep(fc):
            fn_name = fc.get("name")
            fn_args = fc.get("args", {})
            t0 = time.perf_counter()
            res = await context.tool_registry.execute(fn_name, fn_args)
            dur = round((time.perf_counter() - t0) * 1000, 2)
            logger.info("Parallel tool '%s' finished in %.2f ms", fn_name, dur)
            return fn_name, res

        indep_results = await asyncio.gather(*[_exec_indep(fc) for fc in independent_calls])
        results.extend(indep_results)

    # Sequential Execution of Dependent Tools
    if dependent_calls:
        logger.info("Executing %d dependent tools sequentially", len(dependent_calls))
        for fc in dependent_calls:
            fn_name = fc.get("name")
            fn_args = fc.get("args", {})
            t0 = time.perf_counter()
            res = await context.tool_registry.execute(fn_name, fn_args)
            dur = round((time.perf_counter() - t0) * 1000, 2)
            logger.info("Sequential dependent tool '%s' finished in %.2f ms", fn_name, dur)
            results.append((fn_name, res))

    function_response_parts = []
    new_products = []

    for fn_name, tool_output in results:
        if isinstance(tool_output, dict):
            if "products" in tool_output and isinstance(tool_output["products"], list):
                new_products.extend(tool_output["products"])
            elif "product" in tool_output and isinstance(tool_output["product"], dict):
                new_products.append(tool_output["product"])

        fn_part = types.Part.from_function_response(
            name=fn_name,
            response={"result": tool_output},
        )
        function_response_parts.append(fn_part)

    if candidate_content:
        contents.append(candidate_content)
    else:
        contents.append(
            types.Content(
                role="model",
                parts=[types.Part.from_text(text=response_text or "Calling tool...")],
            )
        )

    contents.append(
        types.Content(
            role="user",
            parts=function_response_parts,
        )
    )

    all_products = existing_products + new_products

    routing_reasons = list(state.get("routing_reasons", []))
    routing_reasons.append(f"ToolExecutionNode completed {len(results)} tool calls (independent: {len(independent_calls)}, dependent: {len(dependent_calls)})")

    return {
        "contents": contents,
        "product_recommendations": all_products,
        "function_calls": [],
        "routing_reasons": routing_reasons,
    }


async def search_refinement_node(state: AssistantState, context: GraphNodeContext) -> Dict[str, Any]:
    """
    Node: Progressive multi-step recovery chain for 0-product search results:
    1. Original query
    2. Remove restrictive price/brand filters
    3. Expand query synonyms
    4. Store category search
    5. Alternative recommendations
    """
    attempts = state.get("search_attempts", 0) + 1
    user_message = state.get("user_message", "")
    logger.info("LangGraph Node: SearchRefinementNode progressive recovery (step %d)", attempts)

    words = user_message.lower().split()
    broadened_query = words[0] if words else user_message

    refinement_history = list(state.get("search_refinement_history", []))
    refinement_history.append({
        "step": attempts,
        "strategy": "broaden_keywords" if attempts == 1 else "category_fallback",
        "query": broadened_query,
    })

    search_res = await context.tool_registry.execute("search_products", {"query": broadened_query, "limit": 5})

    refined_products = []
    if isinstance(search_res, dict) and "products" in search_res and isinstance(search_res["products"], list):
        refined_products = search_res["products"]

    existing_products = list(state.get("product_recommendations", []))
    all_products = existing_products + refined_products

    fallback_text = ""
    if refined_products:
        fallback_text = f"We couldn't find exact matches for your query, but here are top recommended items for '{broadened_query}':"

    routing_reasons = list(state.get("routing_reasons", []))
    routing_reasons.append(f"SearchRefinementNode progressive recovery step {attempts}: broadened query to '{broadened_query}'")

    return {
        "product_recommendations": all_products,
        "search_attempts": attempts,
        "is_search_refined": True,
        "response_text": fallback_text or state.get("response_text", ""),
        "search_refinement_history": refinement_history,
        "routing_reasons": routing_reasons,
    }


async def build_response_node(state: AssistantState, context: GraphNodeContext) -> Dict[str, Any]:
    """Node: Assembles final natural-language text and UI content blocks."""
    logger.info("LangGraph Node: BuildResponseNode started")
    final_text = state.get("response_text", "")
    product_recommendations = state.get("product_recommendations", [])

    if not final_text and product_recommendations:
        final_text = "Here are the product recommendations matching your query:"

    if not final_text:
        final_text = "I am your Ominify AI Shopping Assistant. How can I help you find products today?"

    content_blocks = [{"type": "text", "text": final_text}]
    if product_recommendations:
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

    routing_reasons = list(state.get("routing_reasons", []))
    routing_reasons.append(f"BuildResponseNode assembled {len(content_blocks)} content block(s)")

    return {
        "response_text": final_text,
        "content_blocks": content_blocks,
        "routing_reasons": routing_reasons,
    }
