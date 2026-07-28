"""
Strongly typed AssistantState definition for LangGraph stateful agent execution.
"""

from typing import Any, Dict, List, Optional, TypedDict
from google.genai import types
from app.models.message import Message
from app.langgraph.schemas import ExecutionPlan, UserPreferences


class AssistantState(TypedDict, total=False):
    """
    State object passed between LangGraph state machine nodes.
    Mutated cleanly by each node during execution turns.
    """
    conversation_id: str
    user_id: str
    request_id: str
    user_message: str
    history_messages: List[Message]
    contents: List[types.Content]
    system_instruction: str
    genai_tools: List[types.Tool]
    function_calls: List[Dict[str, Any]]
    candidate_content: Optional[types.Content]
    tool_results: List[Dict[str, Any]]
    product_recommendations: List[Dict[str, Any]]
    response_text: str
    content_blocks: List[Dict[str, Any]]
    current_iteration: int
    max_iterations: int
    summary: str
    errors: List[str]
    timings: Dict[str, float]
    token_usage: Dict[str, int]
    intent: str
    needs_clarification: bool
    clarification_question: str
    search_attempts: int
    is_search_refined: bool
    plan_metadata: Dict[str, Any]
    # Phase 4.8 Additions
    execution_plan: ExecutionPlan
    user_preferences: UserPreferences
    routing_reasons: List[str]
    search_refinement_history: List[Dict[str, Any]]
