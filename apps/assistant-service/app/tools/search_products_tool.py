"""
Search Products tool definition for native Gemini function calling.
"""

from typing import Any, Dict, Optional
from google.genai import types
from app.clients.product_client import ProductClient


class SearchProductsTool:
    """
    Tool allowing the assistant to search the product catalog via ProductClient.
    Exposes a native Gemini FunctionDeclaration for automatic tool registration.
    """

    def __init__(self, product_client: ProductClient):
        self.product_client = product_client
        self.name = "search_products"
        self.description = "Search products in the store catalog by keywords, category, min_price, max_price, or budget."

    def get_function_declaration(self) -> types.FunctionDeclaration:
        """Returns the official google-genai FunctionDeclaration for Gemini tool registration."""
        return types.FunctionDeclaration(
            name=self.name,
            description=self.description,
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "query": types.Schema(
                        type=types.Type.STRING,
                        description="Search keyword query (e.g. 'running shoes', 'laptop')",
                    ),
                    "category": types.Schema(
                        type=types.Type.STRING,
                        description="Optional product category name filter",
                    ),
                    "min_price": types.Schema(
                        type=types.Type.NUMBER,
                        description="Optional minimum price filter",
                    ),
                    "max_price": types.Schema(
                        type=types.Type.NUMBER,
                        description="Optional maximum price filter",
                    ),
                    "limit": types.Schema(
                        type=types.Type.INTEGER,
                        description="Maximum number of products to return (default: 10)",
                    ),
                },
                required=["query"],
            ),
        )

    async def execute(
        self,
        query: str = "",
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        limit: int = 10,
    ) -> Dict[str, Any]:
        """Validate parameters and execute search against ProductClient."""
        clean_query = query.strip() if query else ""
        results = await self.product_client.search_products(
            query=clean_query,
            category=category,
            min_price=min_price,
            max_price=max_price,
            limit=limit,
        )
        return {
            "status": "success",
            "query": clean_query,
            "count": len(results),
            "products": results,
        }
