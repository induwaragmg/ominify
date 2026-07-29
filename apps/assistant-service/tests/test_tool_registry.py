"""
Unit test suite for ToolRegistry registration, function declaration export, and tool execution.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from app.tools.registry import ToolRegistry, BaseTool
from app.tools.search_products_tool import SearchProductsTool
from app.tools.get_product_tool import GetProductTool
from app.tools.compare_products_tool import CompareProductsTool
from app.tools.get_categories_tool import GetCategoriesTool


def test_tool_registry_registration_and_export():
    product_client = MagicMock()
    registry = ToolRegistry()

    search_tool = SearchProductsTool(product_client)
    get_tool = GetProductTool(product_client)

    registry.register(search_tool)
    registry.register(get_tool)

    assert registry.get("search_products") is search_tool
    assert registry.get("get_product") is get_tool
    assert registry.get("unknown") is None

    declarations = registry.list_function_declarations()
    assert len(declarations) == 2
    assert {d.name for d in declarations} == {"search_products", "get_product"}

    genai_tools = registry.get_genai_tools()
    assert len(genai_tools) == 1
    assert len(genai_tools[0].function_declarations) == 2


@pytest.mark.anyio
async def test_tool_registry_execution_handling():
    product_client = MagicMock()
    product_client.search_products = AsyncMock(return_value=[{"id": "1", "name": "Shoe"}])

    registry = ToolRegistry()
    registry.register(SearchProductsTool(product_client))

    # Successful execution
    res = await registry.execute("search_products", {"query": "shoes"})
    assert res["status"] == "success"
    assert res["count"] == 1

    # Unregistered tool name
    unknown_res = await registry.execute("invalid_tool", {})
    assert unknown_res["status"] == "error"
    assert "Unknown tool" in unknown_res["message"]

    # Malformed arguments
    product_client.search_products = AsyncMock(side_effect=TypeError("unexpected kwarg"))
    malformed_res = await registry.execute("search_products", {"bad": "arg"})
    assert malformed_res["status"] == "error"
    assert "Malformed arguments" in malformed_res["message"]
