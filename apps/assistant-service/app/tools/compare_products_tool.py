"""
Compare Products tool definition for native Gemini function calling.
"""

from typing import Any, Dict, List
from google.genai import types
from app.clients.product_client import ProductClient


class CompareProductsTool:
    """
    Tool allowing the assistant to fetch multiple products side-by-side for comparison.
    Exposes a native Gemini FunctionDeclaration for automatic tool registration.
    """

    def __init__(self, product_client: ProductClient):
        self.product_client = product_client
        self.name = "compare_products"
        self.description = "Compare multiple products side-by-side by providing a list of product IDs."

    def get_function_declaration(self) -> types.FunctionDeclaration:
        """Returns the official google-genai FunctionDeclaration for Gemini tool registration."""
        return types.FunctionDeclaration(
            name=self.name,
            description=self.description,
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "product_ids": types.Schema(
                        type=types.Type.ARRAY,
                        items=types.Schema(type=types.Type.STRING),
                        description="List of product ID strings to compare side-by-side",
                    ),
                },
                required=["product_ids"],
            ),
        )

    async def execute(self, product_ids: List[str]) -> Dict[str, Any]:
        """Validate list of product IDs and fetch side-by-side details."""
        if not product_ids or not isinstance(product_ids, list):
            return {"status": "error", "message": "product_ids must be a non-empty list of product IDs"}

        clean_ids = [pid.strip() for pid in product_ids if pid and isinstance(pid, str)]
        products = await self.product_client.compare_products(clean_ids)
        return {
            "status": "success",
            "count": len(products),
            "products": products,
        }
