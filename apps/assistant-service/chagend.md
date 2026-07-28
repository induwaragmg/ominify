# Phase 3.5 Implementation Summary (`chagend.md`)

This document details all refactoring changes made for Phase 3.5 of the Ominify AI Assistant service (`assistant-service`), enabling official `google-genai` native function calling (`FunctionCall` -> `FunctionResponse` -> Final Response Synthesis).

---

## 1. Overview of Phase 3.5 Changes

1. **No Raw Tool JSON returned to Users**:
   - Eliminated any text stringification or prompt injection of tool results.
   - The user workflow is strictly: `User -> Gemini -> FunctionCall -> Tool Execution -> FunctionResponse -> Gemini -> Natural Language Answer`.

2. **Official `google-genai` SDK Function-Calling Flow**:
   - `GeminiProvider` receives native `types.Content` messages and `types.Tool` definitions.
   - `AssistantOrchestrator` intercepts structured `FunctionCall` requests from Gemini, executes tools via `.execute()`, wraps output in native `types.Part.from_function_response()`, appends them into conversation turns, and sends them back to Gemini for second-pass synthesis.

3. **PromptBuilder Refactoring**:
   - `PromptBuilder` now builds pure `types.Content` objects from history and user prompts without injecting stringified JSON or tool result prompt text.

4. **Dynamic Tool Registration**:
   - Replaced static tool definitions with plug-and-play dynamic iteration: `[tool.get_function_declaration() for tool in self.tool_instances]`.

5. **Multi-Turn & Multiple Function Calls Support**:
   - Iterative execution loop handles multiple function calls in a single turn or consecutive turns (e.g. `search_products` -> `compare_products` -> final synthesis) up to `max_iterations = 5`.

6. **Comprehensive Logging**:
   - Detailed logs added across `GeminiProvider`, `AssistantOrchestrator`, and `ProductClient`: model name (`gemini-3.6-flash`), first completion request, function calls requested, tool executions, HTTP requests/responses, second completion pass, and final synthesized text.

7. **Configurable Model Name (`GEMINI_MODEL`)**:
   - Moved default model configuration to `.env` (`GEMINI_MODEL=gemini-3.6-flash`) and `app/core/config.py` (`GEMINI_MODEL: str = "gemini-3.6-flash"`).

8. **Robust Error Handling**:
   - Catches malformed arguments, unknown functions, API errors, empty search results, and Product Service HTTP failures without exposing raw exceptions or stack traces to the client.

9. **Preserved Frontend Content Blocks Format**:
   - Returned response payload preserves the required `content_blocks` structure: `[{"type": "text", "text": ...}, {"type": "product_recommendations", "products": [...]}]`.

---

## 2. Modified Files & Complete Source Code

### `app/core/config.py`
```python
"""
Application configuration management using Pydantic Settings.
Environment variables are loaded from `.env` file or process environment.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application Info
    PROJECT_NAME: str = "Ominify AI Assistant Service"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "AI Shopping Assistant Microservice for Ominify E-commerce"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/assistant_db"

    # AI / LLM Provider Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"

    # Authentication Settings (Clerk)
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_ISSUER_URL: str = ""

    # External Client Services
    PRODUCT_SERVICE_URL: str = "http://localhost:8000"

    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3002",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
```

---

### `app/llm/prompts/prompt_builder.py`
```python
"""
Centralized prompt builder for assembling Gemini context window payloads and conversation history.
"""

from typing import List
from google.genai import types

from app.llm.prompts.system_prompt import SYSTEM_PROMPT_TEMPLATE
from app.llm.prompts.shopping_prompt import SHOPPING_ASSISTANT_PROMPT
from app.models.message import Message


class PromptBuilder:
    """
    Assembles system instructions and formatted conversation history as native types.Content objects.
    Single location for all prompt assembly logic.
    """

    @staticmethod
    def build_system_instruction() -> str:
        """Combines system guidelines and shopping prompt rules into a unified system instruction string."""
        return f"{SYSTEM_PROMPT_TEMPLATE.strip()}\n\n{SHOPPING_ASSISTANT_PROMPT.strip()}"

    @staticmethod
    def build_conversation_contents(
        history_messages: List[Message],
        current_user_message: str,
    ) -> List[types.Content]:
        """
        Formats previous database Message records and the new user message into native google-genai types.Content objects.
        Tool responses are handled as native FunctionResponse parts in the orchestrator, never injected as text here.
        """
        contents: List[types.Content] = []

        # Format past conversation history
        for msg in history_messages:
            text_parts = []
            if isinstance(msg.content, list):
                for block in msg.content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text_parts.append(block.get("text", ""))
            elif isinstance(msg.content, str):
                text_parts.append(msg.content)

            full_text = "\n".join(text_parts).strip()
            if full_text:
                role_label = "user" if msg.role == "user" else "model"
                contents.append(
                    types.Content(
                        role=role_label,
                        parts=[types.Part.from_text(text=full_text)],
                    )
                )

        # Append current user prompt
        if current_user_message and current_user_message.strip():
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=current_user_message.strip())],
                )
            )

        return contents
```

---

### `app/llm/providers/gemini.py`
```python
"""
Google Gemini LLM provider implementation using official google-genai SDK.
"""

import logging
from typing import Any, List, Dict, Optional
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.llm.providers.base import LLMProvider
from app.core.config import settings

logger = logging.getLogger("assistant-service.llm")


class GeminiProvider(LLMProvider):
    """
    Official Google Gemini provider implementation using google-genai SDK.
    Handles client initialization, model completion, native tool definition registration,
    structured function call extraction, and error handling.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
    ):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL

        self.client = None
        if self.api_key and self.api_key.strip():
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Gemini Client initialized with model: %s", self.model_name)
            except Exception as e:
                logger.warning("Failed to initialize Gemini Client: %s", str(e))
        else:
            logger.warning("GEMINI_API_KEY is not set. Offline fallback mode active.")

    async def generate_response(
        self,
        messages: List[types.Content],
        system_prompt: Optional[str] = None,
        tools: Optional[List[types.Tool]] = None,
    ) -> Dict[str, Any]:
        """
        Generate completion from Gemini API.
        Returns dictionary containing:
          - text: Response text string
          - function_calls: List of structured function call dicts requested by Gemini
          - candidate_content: The candidate model Content object (containing FunctionCall parts)
          - raw_response: Raw SDK response object
        """
        if not self.client:
            logger.info("GEMINI_API_KEY not configured. Returning offline fallback response.")
            return {
                "text": "I am your Ominify AI Shopping Assistant! I can help you search products, compare specifications, find recommendations, and answer shopping questions.",
                "function_calls": [],
                "candidate_content": None,
                "raw_response": None,
            }

        try:
            config_kwargs: Dict[str, Any] = {}
            if system_prompt:
                config_kwargs["system_instruction"] = system_prompt

            if tools:
                config_kwargs["tools"] = tools

            config = types.GenerateContentConfig(**config_kwargs) if config_kwargs else None

            logger.info("Sending completion request to Gemini model '%s' (contents: %d turns, tools: %s)",
                        self.model_name, len(messages), bool(tools))

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=messages,
                config=config,
            )

            function_calls = []
            if hasattr(response, "function_calls") and response.function_calls:
                for fc in response.function_calls:
                    function_calls.append({
                        "name": fc.name,
                        "args": dict(fc.args) if hasattr(fc, "args") and fc.args else {},
                    })
                    logger.info("Gemini requested native FunctionCall: '%s' with args %s", fc.name, fc.args)

            response_text = response.text if hasattr(response, "text") and response.text else ""

            candidate_content = None
            if response.candidates and len(response.candidates) > 0:
                candidate_content = response.candidates[0].content

            return {
                "text": response_text,
                "function_calls": function_calls,
                "candidate_content": candidate_content,
                "raw_response": response,
            }

        except APIError as e:
            logger.error("Gemini API error (%s) for model '%s': %s", e.code, self.model_name, e.message)
            return {
                "text": f"I encountered an API error while processing your shopping request: {e.message}",
                "function_calls": [],
                "candidate_content": None,
                "raw_response": None,
            }
        except Exception as e:
            logger.error("Unexpected error in GeminiProvider for model '%s': %s", self.model_name, str(e))
            return {
                "text": "I am currently unable to reach the AI model service. Please try again in a moment.",
                "function_calls": [],
                "candidate_content": None,
                "raw_response": None,
            }
```

---

### `app/orchestrators/assistant_orchestrator.py`
```python
"""
Assistant Orchestrator owning the AI workflow execution graph using native google-genai function calling.
"""

import logging
import uuid
from typing import Any, Dict, List, Optional
from google.genai import types

from app.llm.providers.gemini import GeminiProvider
from app.llm.prompts.prompt_builder import PromptBuilder
from app.clients.product_client import ProductClient
from app.tools.search_products_tool import SearchProductsTool
from app.tools.get_product_tool import GetProductTool
from app.tools.compare_products_tool import CompareProductsTool
from app.tools.get_categories_tool import GetCategoriesTool
from app.models.message import Message

logger = logging.getLogger("assistant-service.orchestrator")


class AssistantOrchestrator:
    """
    Coordinates the native AI workflow execution graph:
    Dynamic Tool Registration -> First Pass Gemini Completion -> Native Function Call Execution ->
    Native FunctionResponse Content Appending -> Second Pass Gemini Synthesis -> Content Block Assembly.
    """

    def __init__(
        self,
        gemini_provider: Optional[GeminiProvider] = None,
        product_client: Optional[ProductClient] = None,
    ):
        self.gemini = gemini_provider or GeminiProvider()
        self.product_client = product_client or ProductClient()

        # Initialize plug-and-play tool instances
        self.search_tool = SearchProductsTool(self.product_client)
        self.get_product_tool = GetProductTool(self.product_client)
        self.compare_tool = CompareProductsTool(self.product_client)
        self.categories_tool = GetCategoriesTool(self.product_client)

        self.tool_instances = [
            self.search_tool,
            self.get_product_tool,
            self.compare_tool,
            self.categories_tool,
        ]

        # Dynamic tool registration and lookup map
        self.tool_map = {tool.name: tool for tool in self.tool_instances}
        self.tools = [
            types.Tool(
                function_declarations=[tool.get_function_declaration() for tool in self.tool_instances]
            )
        ]

    async def process_message(
        self,
        conversation_id: uuid.UUID,
        user_id: str,
        user_message: str,
        history_messages: List[Message],
    ) -> Dict[str, Any]:
        """
        Executes the official google-genai native function calling workflow:
        User -> Gemini -> FunctionCall -> Tool Execution -> FunctionResponse -> Gemini -> Final Response
        """
        system_instruction = PromptBuilder.build_system_instruction()
        contents = PromptBuilder.build_conversation_contents(history_messages, user_message)

        logger.info(
            "Orchestrator processing message for conversation '%s' (user_id: %s, model: %s)",
            conversation_id,
            user_id,
            self.gemini.model_name,
        )

        product_recommendations = []
        final_text = ""
        max_iterations = 5
        iteration = 0

        while iteration < max_iterations:
            iteration += 1

            # Request completion from Gemini
            logger.info("Orchestrator sending pass %d completion request to Gemini", iteration)
            response_payload = await self.gemini.generate_response(
                messages=contents,
                system_prompt=system_instruction,
                tools=self.tools,
            )

            function_calls = response_payload.get("function_calls", [])
            candidate_content = response_payload.get("candidate_content")
            response_text = response_payload.get("text", "")

            # If Gemini requested function call(s)
            if function_calls:
                logger.info("Pass %d: Gemini requested %d function call(s)", iteration, len(function_calls))

                function_response_parts = []

                # Execute every requested function call
                for fc in function_calls:
                    fn_name = fc.get("name")
                    fn_args = fc.get("args", {})
                    logger.info("Executing requested tool '%s' with args %s", fn_name, fn_args)

                    # Execute tool via tool instance
                    tool_output = await self._execute_tool_by_name(fn_name, fn_args)

                    # Extract products for rich UI cards
                    if isinstance(tool_output, dict):
                        if "products" in tool_output and isinstance(tool_output["products"], list):
                            product_recommendations.extend(tool_output["products"])
                        elif "product" in tool_output and isinstance(tool_output["product"], dict):
                            product_recommendations.append(tool_output["product"])

                    # Create native FunctionResponse part
                    fn_part = types.Part.from_function_response(
                        name=fn_name,
                        response={"result": tool_output},
                    )
                    function_response_parts.append(fn_part)

                # Append candidate model turn (containing FunctionCall) into conversation contents
                if candidate_content:
                    contents.append(candidate_content)
                else:
                    contents.append(
                        types.Content(
                            role="model",
                            parts=[types.Part.from_text(text=response_text or "Calling function...")],
                        )
                    )

                # Append user turn with native FunctionResponse parts into conversation contents
                contents.append(
                    types.Content(
                        role="user",
                        parts=function_response_parts,
                    )
                )

                # Loop to send FunctionResponse parts back to Gemini for second completion pass
                continue

            # No further function calls requested by Gemini -> completion reached
            final_text = response_text
            logger.info("Pass %d: Gemini generated final response text: '%s'", iteration, final_text[:100] if final_text else "")
            break

        # Fallback offline keyword search if Gemini is unconfigured or in offline test mode
        if not final_text and not product_recommendations and self._should_auto_trigger_search(user_message):
            logger.info("Offline fallback keyword search triggered for query: '%s'", user_message)
            search_res = await self.search_tool.execute(query=user_message, limit=5)
            if isinstance(search_res, dict) and "products" in search_res:
                product_recommendations.extend(search_res.get("products", []))
                final_text = f"Here are relevant products found for '{user_message}':"

        # Ensure fallback text if text is empty but product recommendations exist
        if not final_text and product_recommendations:
            final_text = f"Here are the product recommendations matching your query:"

        # Clean fallback text if still empty
        if not final_text:
            final_text = "I am your Ominify AI Shopping Assistant. How can I help you find products today?"

        # Assemble final content blocks list for client
        content_blocks = [{"type": "text", "text": final_text}]
        if product_recommendations:
            # Deduplicate product recommendations by ID
            unique_products = []
            seen_ids = set()
            for p in product_recommendations:
                pid = p.get("id")
                if pid not in seen_ids:
                    seen_ids.add(pid)
                    unique_products.append(p)

            content_blocks.append({
                "type": "product_recommendations",
                "products": unique_products,
            })

        logger.info("Orchestrator completed message processing successfully.")
        return {
            "text": final_text,
            "content_blocks": content_blocks,
        }

    async def _execute_tool_by_name(self, tool_name: str, args: Dict[str, Any]) -> Any:
        """Dispatches tool execution dynamically via tool instances and handles errors gracefully."""
        tool = self.tool_map.get(tool_name)
        if not tool:
            logger.warning("Tool execution attempted for unknown function '%s'", tool_name)
            return {"status": "error", "message": f"Unknown tool '{tool_name}'"}

        try:
            return await tool.execute(**args)
        except TypeError as e:
            logger.warning("Malformed arguments for tool '%s': %s", tool_name, str(e))
            return {"status": "error", "message": f"Malformed arguments for tool '{tool_name}': {str(e)}"}
        except Exception as e:
            logger.error("Error executing tool '%s': %s", tool_name, str(e))
            return {"status": "error", "message": f"Tool execution failed: {str(e)}"}

    def _should_auto_trigger_search(self, query: str) -> bool:
        """Determines if query contains explicit shopping search keywords when LLM is offline."""
        q = query.lower()
        keywords = ["search", "find", "looking for", "recommend", "buy", "shoes", "shirt", "pants", "laptop", "phone"]
        return any(kw in q for kw in keywords)
```

---

### `app/clients/product_client.py`
```python
"""
Async HTTP Client implementation for Product Service microservice communication via httpx.
"""

import logging
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("assistant-service.clients")


class ProductClient:
    """
    Async HTTP client for communicating with the Product Service microservice (Port :8000).
    Performs catalog searches, product detail fetches, category queries, and comparison lookups.
    """

    def __init__(self, base_url: Optional[str] = None, timeout: float = 5.0):
        self.base_url = (base_url or settings.PRODUCT_SERVICE_URL).rstrip("/")
        self.timeout = timeout

    async def search_products(
        self,
        query: str,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Queries Product Service search endpoint with logging and error handling.
        """
        params: Dict[str, Any] = {"q": query, "limit": limit}
        if category:
            params["category"] = category
        if min_price is not None:
            params["min_price"] = min_price
        if max_price is not None:
            params["max_price"] = max_price

        url = f"{self.base_url}/api/v1/products/search"
        logger.info("ProductClient request: GET %s with params %s", url, params)

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    products = data.get("products", data) if isinstance(data, dict) else data
                    logger.info("ProductClient search succeeded: found %d items", len(products) if isinstance(products, list) else 0)
                    return products if isinstance(products, list) else []
                logger.warning("Product Service search returned HTTP %s for query '%s'", response.status_code, query)
                return []
        except httpx.HTTPError as e:
            logger.warning("Product Service HTTP error during search for '%s': %s", query, str(e))
            return []

    async def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches detailed product specifications by ID with logging and error handling.
        """
        url = f"{self.base_url}/api/v1/products/{product_id}"
        logger.info("ProductClient request: GET %s", url)

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    logger.info("ProductClient get_product succeeded for ID '%s'", product_id)
                    return response.json()
                logger.warning("Product Service lookup for '%s' returned HTTP %s", product_id, response.status_code)
                return None
        except httpx.HTTPError as e:
            logger.warning("Product Service HTTP error during get_product for '%s': %s", product_id, str(e))
            return None

    async def compare_products(self, product_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Fetches multiple product details for side-by-side comparison with logging.
        """
        logger.info("ProductClient request: compare_products for IDs %s", product_ids)
        results = []
        for pid in product_ids:
            product = await self.get_product(pid)
            if product:
                results.append(product)
        return results

    async def get_categories(self) -> List[Dict[str, Any]]:
        """
        Fetches store categories from Product Service with logging.
        """
        url = f"{self.base_url}/api/v1/categories"
        logger.info("ProductClient request: GET %s", url)

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    categories = data.get("categories", data) if isinstance(data, dict) else data
                    logger.info("ProductClient get_categories succeeded: found %d categories", len(categories) if isinstance(categories, list) else 0)
                    return categories if isinstance(categories, list) else []
                logger.warning("Product Service get_categories returned HTTP %s", response.status_code)
                return []
        except httpx.HTTPError as e:
            logger.warning("Product Service HTTP error during get_categories: %s", str(e))
            return []
```

---

### `tests/test_native_function_calling.py`
```python
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
    """Verify Orchestrator handles unknown tools and malformed arguments gracefully without raising exceptions."""
    product_client = MagicMock()
    orchestrator = AssistantOrchestrator(product_client=product_client)

    # Unknown tool name
    unknown_res = await orchestrator._execute_tool_by_name("non_existent_tool", {})
    assert unknown_res["status"] == "error"
    assert "Unknown tool" in unknown_res["message"]

    # Malformed arguments for search_products
    product_client.search_products = AsyncMock(side_effect=TypeError("unexpected keyword argument 'invalid_param'"))
    malformed_res = await orchestrator._execute_tool_by_name("search_products", {"invalid_param": 123})
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
```
