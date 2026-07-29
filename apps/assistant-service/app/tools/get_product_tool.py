"""
Get Product Tool definition for native Gemini function calling.
"""

from typing import Any, Dict
from google.genai import types
from app.clients.product_client import ProductClient


class GetProductTool:
    """
    Tool allowing the assistant to fetch detailed specifications for a single product by ID.
    Exposes a native Gemini FunctionDeclaration for automatic tool registration.
    """

    def __init__(self, product_client: ProductClient):
        self.product_client = product_client
        self.name = "get_product"
        self.description = "Fetch detailed specifications, pricing, rating, and images for a target product ID."

    def get_function_declaration(self) -> types.FunctionDeclaration:
        """Returns the official google-genai FunctionDeclaration for Gemini tool registration."""
        return types.FunctionDeclaration(
            name=self.name,
            description=self.description,
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "product_id": types.Schema(
                        type=types.Type.STRING,
                        description="Unique product ID string to fetch specifications for",
                    ),
                },
                required=["product_id"],
            ),
        )

    async def execute(self, product_id: str) -> Dict[str, Any]:
        """Validate input and fetch product specifications from ProductClient."""
        clean_id = product_id.strip() if product_id else ""
        if not clean_id:
            return {"status": "error", "message": "product_id cannot be empty"}

        product = await self.product_client.get_product(clean_id)
        if not product:
            return {"status": "error", "message": f"Product with ID '{clean_id}' not found"}

        return {
            "status": "success",
            "product": product,
        }
