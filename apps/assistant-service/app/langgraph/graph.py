"""
LangGraph StateGraph definition and compilation for stateful AI shopping assistant execution.
"""

import logging
from typing import Optional
from langgraph.graph import StateGraph, START, END

from app.langgraph.state import AssistantState
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

logger = logging.getLogger("assistant-service.langgraph.graph")


def create_agent_graph(node_context: Optional[GraphNodeContext] = None, checkpointer=None):
    """
    Constructs and compiles the state-driven LangGraph StateGraph agent execution graph with pluggable checkpointer.
    """
    ctx = node_context or GraphNodeContext()
    checkpointer = checkpointer or CheckpointerFactory.get_checkpointer("memory")

    workflow = StateGraph(AssistantState)

    # Node wrappers passing node_context
    def _node_planning(state: AssistantState):
        return planning_node(state, ctx)

    def _node_clarify(state: AssistantState):
        return clarification_node(state, ctx)

    async def _node_llm(state: AssistantState):
        return await llm_node(state, ctx)

    async def _node_execute_tools(state: AssistantState):
        return await tool_execution_node(state, ctx)

    async def _node_refine_search(state: AssistantState):
        return await search_refinement_node(state, ctx)

    async def _node_build_response(state: AssistantState):
        return await build_response_node(state, ctx)

    # Add Nodes
    workflow.add_node("planning", _node_planning)
    workflow.add_node("clarify", _node_clarify)
    workflow.add_node("llm", _node_llm)
    workflow.add_node("execute_tools", _node_execute_tools)
    workflow.add_node("refine_search", _node_refine_search)
    workflow.add_node("build_response", _node_build_response)

    # Entrypoint
    workflow.add_edge(START, "planning")

    # Conditional Routing from Planning (Clarification vs LLM)
    workflow.add_conditional_edges(
        "planning",
        route_after_planning,
        {
            "clarify": "clarify",
            "llm": "llm",
        },
    )

    workflow.add_edge("clarify", END)

    # Conditional Routing from LLM (Tool Execution vs Search Refinement vs Build Response)
    workflow.add_conditional_edges(
        "llm",
        route_after_llm,
        {
            "execute_tools": "execute_tools",
            "refine_search": "refine_search",
            "build_response": "build_response",
        },
    )

    # Loop tool execution back to LLM for reasoning pass
    workflow.add_edge("execute_tools", "llm")
    workflow.add_edge("refine_search", "build_response")
    workflow.add_edge("build_response", END)

    compiled_app = workflow.compile(checkpointer=checkpointer)
    logger.info("LangGraph agent graph compiled successfully with state-driven dynamic routing.")
    return compiled_app
