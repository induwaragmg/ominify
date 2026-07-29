"""
Centralized Tool Registry for plug-and-play AI Assistant tool management.
"""

import logging
from typing import Any, Dict, List, Optional, Protocol
from google.genai import types

from app.clients.product_client import ProductClient
from app.core.exceptions import ToolExecutionError
from app.tools.search_products_tool import SearchProductsTool
from app.tools.get_product_tool import GetProductTool
from app.tools.compare_products_tool import CompareProductsTool
from app.tools.get_categories_tool import GetCategoriesTool

logger = logging.getLogger("assistant-service.tools")


class BaseTool(Protocol):
    """Protocol defining the standard interface for all AI Assistant tools."""
    name: str
    description: str

    def get_function_declaration(self) -> types.FunctionDeclaration:
        ...

    async def execute(self, **kwargs: Any) -> Dict[str, Any]:
        ...


class ToolRegistry:
    """
    Decoupled tool registry managing tool registration, function declaration export,
    and dynamic tool execution.
    """

    def __init__(self) -> None:
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        """Registers a tool instance in the registry."""
        if not hasattr(tool, "name") or not tool.name:
            raise ToolExecutionError("Cannot register tool without a valid 'name' attribute")
        self._tools[tool.name] = tool
        logger.info("ToolRegistry registered tool '%s'", tool.name)

    def get(self, name: str) -> Optional[BaseTool]:
        """Retrieves a registered tool by name."""
        return self._tools.get(name)

    def list_function_declarations(self) -> List[types.FunctionDeclaration]:
        """Returns native FunctionDeclaration objects for all registered tools."""
        return [tool.get_function_declaration() for tool in self._tools.values()]

    def get_genai_tools(self) -> List[types.Tool]:
        """Wraps all registered function declarations into a google-genai types.Tool list."""
        declarations = self.list_function_declarations()
        return [types.Tool(function_declarations=declarations)] if declarations else []

    async def execute(self, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a registered tool by name with provided argument mapping.
        Handles missing tools, malformed arguments, and execution failures gracefully.
        """
        tool = self.get(name)
        if not tool:
            logger.warning("ToolRegistry execution attempt for unregistered tool '%s'", name)
            return {"status": "error", "message": f"Unknown tool '{name}'"}

        try:
            logger.info("ToolRegistry executing tool '%s' with args: %s", name, args)
            return await tool.execute(**args)
        except TypeError as e:
            logger.warning("Malformed arguments for tool '%s': %s", name, str(e))
            return {"status": "error", "message": f"Malformed arguments for tool '{name}': {str(e)}"}
        except Exception as e:
            logger.error("Error executing tool '%s': %s", name, str(e))
            return {"status": "error", "message": f"Execution failed for tool '{name}': {str(e)}"}


def create_default_tool_registry(product_client: ProductClient) -> ToolRegistry:
    """Factory creating and populating the default ToolRegistry with all product tools."""
    registry = ToolRegistry()
    registry.register(SearchProductsTool(product_client))
    registry.register(GetProductTool(product_client))
    registry.register(CompareProductsTool(product_client))
    registry.register(GetCategoriesTool(product_client))
    return registry
