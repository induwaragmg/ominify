"""
Get Categories Tool definition for native Gemini function calling.
"""

from typing import Any, Dict
from google.genai import types
from app.clients.product_client import ProductClient


class GetCategoriesTool:
    """
    Tool allowing the assistant to fetch available product categories.
    Exposes a native Gemini FunctionDeclaration for automatic tool registration.
    """

    def __init__(self, product_client: ProductClient):
        self.product_client = product_client
        self.name = "get_categories"
        self.description = "Fetch list of all product categories available in the store catalog."

    def get_function_declaration(self) -> types.FunctionDeclaration:
        """Returns the official google-genai FunctionDeclaration for Gemini tool registration."""
        return types.FunctionDeclaration(
            name=self.name,
            description=self.description,
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={},
            ),
        )

    async def execute(self) -> Dict[str, Any]:
        """Fetch categories from ProductClient."""
        categories = await self.product_client.get_categories()
        return {
            "status": "success",
            "count": len(categories),
            "categories": categories,
        }
