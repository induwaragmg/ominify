"""
Automated Test Suite for Phase 4.8 Cognitive Intelligence, ExecutionPlan, Confidence Scoring, UserPreferences Extraction, Progressive Search Refinement, and Explainable Routing.
"""

import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.langgraph.state import AssistantState
from app.langgraph.schemas import ExecutionPlan, UserPreferences
from app.langgraph.checkpoints import CheckpointerFactory
from app.langgraph.nodes import (
    GraphNodeContext,
    planning_node,
    clarification_node,
    llm_node,
    tool_execution_node,
    search_refinement_node,
    build_response_node,
)
from app.langgraph.edges import route_after_planning, route_after_llm
from app.langgraph.summarizer import ConversationSummarizer
from app.models.message import Message

client = TestClient(app)


def test_user_preferences_extraction():
    """Verify ConversationSummarizer extracts budget, brand, color, purpose, and gender into structured UserPreferences."""
    messages = [
        Message(id=uuid.uuid4(), conversation_id=uuid.uuid4(), role="user", content="Looking for black Nike running shoes under $150 for women"),
        Message(id=uuid.uuid4(), conversation_id=uuid.uuid4(), role="assistant", content="Checking store catalog"),
    ]
    prefs = ConversationSummarizer.extract_user_preferences(messages)
    assert prefs.budget == "under $150"
    assert prefs.brand == "Nike"
    assert prefs.color == "Black"
    assert prefs.purpose == "Running"
    assert prefs.gender == "Women"


@pytest.mark.anyio
async def test_planning_node_execution_plan_generation():
    """Verify PlanningNode generates a strongly typed ExecutionPlan with confidence scoring."""
    node_ctx = GraphNodeContext()

    # Ambiguous prompt -> low confidence 0.45
    state_vague: AssistantState = {"user_message": "shoes", "history_messages": []}
    res_vague = planning_node(state_vague, node_ctx)
    exec_plan_vague: ExecutionPlan = res_vague["execution_plan"]
    assert exec_plan_vague.confidence == 0.45
    assert exec_plan_vague.clarification_needed is True
    assert "running, basketball" in exec_plan_vague.clarification_question

    # Clear prompt -> high confidence 0.95
    state_clear: AssistantState = {"user_message": "Find red Nike running shoes under $100", "history_messages": []}
    res_clear = planning_node(state_clear, node_ctx)
    exec_plan_clear: ExecutionPlan = res_clear["execution_plan"]
    assert exec_plan_clear.confidence == 0.95
    assert exec_plan_clear.clarification_needed is False
    assert "search_products" in exec_plan_clear.required_tools


def test_explainable_confidence_routing():
    """Verify route_after_planning uses confidence scores and records routing explanation traces."""
    exec_plan_low = ExecutionPlan(confidence=0.45, clarification_needed=True)
    state_low: AssistantState = {"execution_plan": exec_plan_low, "needs_clarification": True}
    route_low = route_after_planning(state_low)
    assert route_low == "clarify"

    exec_plan_high = ExecutionPlan(confidence=0.95, clarification_needed=False)
    state_high: AssistantState = {"execution_plan": exec_plan_high, "needs_clarification": False}
    route_high = route_after_planning(state_high)
    assert route_high == "llm"


@pytest.mark.anyio
async def test_search_refinement_progressive_history():
    """Verify SearchRefinementNode logs search refinement history across attempts."""
    mock_registry = MagicMock()
    mock_registry.execute = AsyncMock(return_value={"products": [{"id": "p200", "name": "Broadened Shoe"}]})

    node_ctx = GraphNodeContext(tool_registry=mock_registry)
    state: AssistantState = {"user_message": "Find red running shoes", "search_attempts": 0, "search_refinement_history": []}

    res = await search_refinement_node(state, node_ctx)
    assert res["search_attempts"] == 1
    assert len(res["search_refinement_history"]) == 1
    assert res["search_refinement_history"][0]["strategy"] == "broaden_keywords"


@pytest.mark.anyio
async def test_tool_execution_plan_dependencies():
    """Verify ToolExecutionNode processes ExecutionPlan dependencies correctly."""
    mock_registry = MagicMock()
    mock_registry.execute = AsyncMock(side_effect=[
        {"status": "success", "products": [{"id": "p1", "name": "Shoe A"}]},
        {"status": "success", "comparison": "Shoe A is recommended"},
    ])

    exec_plan = ExecutionPlan(
        dependencies={"compare_products": ["search_products"]},
        parallel_groups=[["search_products"]],
    )

    node_ctx = GraphNodeContext(tool_registry=mock_registry)
    state: AssistantState = {
        "execution_plan": exec_plan,
        "function_calls": [
            {"name": "search_products", "args": {"query": "shoes"}},
            {"name": "compare_products", "args": {"product_ids": ["p1", "p2"]}},
        ],
        "contents": [],
        "routing_reasons": [],
    }

    res = await tool_execution_node(state, node_ctx)
    assert mock_registry.execute.call_count == 2
    assert len(res["routing_reasons"]) == 1
    assert "ToolExecutionNode completed 2 tool calls" in res["routing_reasons"][0]


def test_sse_streaming_sequence():
    """Verify POST /api/v1/conversations/{id}/messages/stream emits standardized event sequence."""
    headers = {"Authorization": "Bearer dev_user_alice"}
    resp_create = client.post("/api/v1/conversations", json={"title": "Cognitive Stream Test"}, headers=headers)
    conv_id = resp_create.json()["id"]

    resp_stream = client.post(
        f"/api/v1/conversations/{conv_id}/messages/stream",
        json={"role": "user", "content": "Recommend shoes under $100"},
        headers=headers,
    )
    assert resp_stream.status_code == 200
    assert "event: thinking" in resp_stream.text
    assert "event: planning" in resp_stream.text
    assert "event: reasoning" in resp_stream.text
    assert "event: completed" in resp_stream.text
