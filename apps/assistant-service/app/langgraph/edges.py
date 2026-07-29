"""
Explainable confidence-driven conditional routing edges for LangGraph state machine flow control.
"""

import logging
from app.langgraph.state import AssistantState

logger = logging.getLogger("assistant-service.langgraph.edges")


def route_after_planning(state: AssistantState) -> str:
    """
    Conditional Edge: Evaluates ExecutionPlan confidence score and clarification requirement.
    Records routing explanation in state["routing_reasons"].
    """
    exec_plan = state.get("execution_plan")
    needs_clarification = state.get("needs_clarification")
    confidence = exec_plan.confidence if exec_plan else 0.9

    if needs_clarification or confidence < 0.70:
        reason = f"Planning -> Clarification (Reason: Low confidence {confidence:.2f} for ambiguous query)"
        logger.info("LangGraph Edge: %s", reason)
        return "clarify"

    reason = f"Planning -> LLM (Reason: High confidence {confidence:.2f} for clear intent '{exec_plan.intent if exec_plan else 'search'}')"
    logger.info("LangGraph Edge: %s", reason)
    return "llm"


def route_after_llm(state: AssistantState) -> str:
    """
    Conditional Edge: Evaluates requested function calls and product recommendation state.
    Records routing explanation in state["routing_reasons"].
    """
    function_calls = state.get("function_calls", [])
    current_iter = state.get("current_iteration", 0)
    max_iters = state.get("max_iterations", 5)
    products = state.get("product_recommendations", [])
    attempts = state.get("search_attempts", 0)
    user_msg = state.get("user_message", "").lower()

    if function_calls and current_iter < max_iters:
        reason = f"LLM -> Tool Execution (Reason: Gemini requested {len(function_calls)} native function call(s) on pass {current_iter}/{max_iters})"
        logger.info("LangGraph Edge: %s", reason)
        return "execute_tools"

    is_search_intent = any(kw in user_msg for kw in ["search", "find", "shoes", "shirt", "laptop", "buy", "recommend"])
    if not products and attempts < 1 and is_search_intent:
        reason = f"LLM -> Search Refinement (Reason: 0 products returned on initial search attempt {attempts})"
        logger.info("LangGraph Edge: %s", reason)
        return "refine_search"

    reason = "LLM -> Build Response (Reason: Reasoning complete, no additional tools requested)"
    logger.info("LangGraph Edge: %s", reason)
    return "build_response"
