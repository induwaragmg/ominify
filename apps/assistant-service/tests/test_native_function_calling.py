"""
Automated Integration Test Suite for Native google-genai Function Calling, Prompt Assembly, Tool Execution, and Error Handling.
"""

import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock
from google.genai import types

from app.tools.search_products_tool import SearchProductsTool
from app.tools.get_product_tool import GetProductTool
from app.tools.compare_products_tool import CompareProductsTool
from app.tools.get_categories_tool import GetCategoriesTool
from app.llm.prompts.prompt_builder import PromptBuilder
from app.orchestrators.assistant_orchestrator import AssistantOrchestrator
from app.models.message import Message


def test_tool_function_declarations():
    """Verify tool classes export valid google-genai FunctionDeclarations."""
    mock_client = MagicMock()
    
    search_tool = SearchProductsTool(mock_client)
    get_tool = GetProductTool(mock_client)
    compare_tool = CompareProductsTool(mock_client)
    cat_tool = GetCategoriesTool(mock_client)

    fd_search = search_tool.get_function_declaration()
    assert fd_search.name == "search_products"
    assert "query" in fd_search.parameters.properties

    fd_get = get_tool.get_function_declaration()
    assert fd_get.name == "get_product"
    assert "product_id" in fd_get.parameters.properties

    fd_compare = compare_tool.get_function_declaration()
    assert fd_compare.name == "compare_products"
    assert "product_ids" in fd_compare.parameters.properties

    fd_cat = cat_tool.get_function_declaration()
    assert fd_cat.name == "get_categories"


def test_prompt_builder_conversation_contents():
    """Verify PromptBuilder constructs native types.Content objects from history."""
    msg1 = Message(
        id=uuid.uuid4(),
        conversation_id=uuid.uuid4(),
        role="user",
        content=[{"type": "text", "text": "Looking for running shoes"}],
    )
    msg2 = Message(
        id=uuid.uuid4(),
        conversation_id=uuid.uuid4(),
        role="assistant",
        content=[{"type": "text", "text": "Here are top running shoes"}],
    )

    contents = PromptBuilder.build_conversation_contents([msg1, msg2], "Show me shoes under $150")
    assert len(contents) == 3
    assert contents[0].role == "user"
    assert contents[0].parts[0].text == "Looking for running shoes"
    assert contents[1].role == "model"
    assert contents[1].parts[0].text == "Here are top running shoes"
    assert contents[2].role == "user"
    assert contents[2].parts[0].text == "Show me shoes under $150"


@pytest.mark.anyio
async def test_orchestrator_unknown_and_malformed_tool_execution():
    """Verify Orchestrator and ToolRegistry handle unknown tools and malformed arguments gracefully without raising exceptions."""
    product_client = MagicMock()
    orchestrator = AssistantOrchestrator(product_client=product_client)

    # Unknown tool name
    unknown_res = await orchestrator.tool_registry.execute("non_existent_tool", {})
    assert unknown_res["status"] == "error"
    assert "Unknown tool" in unknown_res["message"]

    # Malformed arguments for search_products
    product_client.search_products = AsyncMock(side_effect=TypeError("unexpected keyword argument 'invalid_param'"))
    malformed_res = await orchestrator.tool_registry.execute("search_products", {"invalid_param": 123})
    assert malformed_res["status"] == "error"
    assert "Malformed arguments" in malformed_res["message"]


@pytest.mark.anyio
async def test_orchestrator_native_function_calling_flow():
    """Verify Orchestrator executes native FunctionCall -> FunctionResponse -> Final Synthesis flow."""
    mock_gemini = MagicMock()
    mock_gemini.model_name = "gemini-3.6-flash"
    mock_gemini.client = MagicMock()

    # Pass 1: Gemini requests search_products function call
    mock_gemini.generate_response = AsyncMock(side_effect=[
        {
            "text": "",
            "function_calls": [{"name": "search_products", "args": {"query": "running shoes"}}],
            "candidate_content": types.Content(
                role="model",
                parts=[types.Part.from_function_call(name="search_products", args={"query": "running shoes"})],
            ),
        },
        # Pass 2: Gemini synthesizes final response text after tool execution
        {
            "text": "Here are top recommended running shoes for your query.",
            "function_calls": [],
            "candidate_content": types.Content(role="model", parts=[types.Part.from_text(text="Here are top recommended running shoes for your query.")]),
        }
    ])

    mock_product_client = MagicMock()
    mock_product_client.search_products = AsyncMock(return_value=[
        {"id": "p1", "name": "Speedster Pro", "price": 120}
    ])

    orchestrator = AssistantOrchestrator(gemini_provider=mock_gemini, product_client=mock_product_client)

    conv_id = uuid.uuid4()
    result = await orchestrator.process_message(
        conversation_id=conv_id,
        user_id="test_user",
        user_message="Recommend running shoes under $150",
        history_messages=[],
    )

    assert result["text"] == "Here are top recommended running shoes for your query."
    assert len(result["content_blocks"]) == 2
    assert result["content_blocks"][0]["type"] == "text"
    assert result["content_blocks"][1]["type"] == "product_recommendations"
    assert result["content_blocks"][1]["products"][0]["name"] == "Speedster Pro"
    assert mock_gemini.generate_response.call_count == 2
