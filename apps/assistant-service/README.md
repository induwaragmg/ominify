# Ominify AI Assistant Service (`assistant-service`)

Independent FastAPI microservice providing an AI-powered conversational shopping assistant for the Ominify e-commerce platform.

---

## Architecture & Production Hardening (Phase 3.8)

```text
                        Frontend (`apps/client`)
                                   │
                                   ▼
             FastAPI (`assistant-service` - Port 8004)
        [X-Request-ID Tracing & Exception Handling Middleware]
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      │                            │                            │
      ▼                            ▼                            ▼
Authentication               Conversation                 Assistant
 (Clerk JWT)                  Management                Orchestrator
                                                                │
                                                                ▼
                                                          PromptBuilder
                                                        (PROMPT_VERSION)
                                                                │
                                                                ▼
                                                          ToolRegistry
                                                       (Plug & Play Tools)
                                                                │
                                                                ▼
                                                           LLM Provider
                                                       (Gemini 3.6 Flash)
                                                                │
                                                                ▼
                                                          ProductClient
                                                     (Resiliency & Retries)
                                                                │
                                                                ▼
                                                         Product Service
                                                           (Port 8000)
```

---

## AI Request & Function-Calling Flow

```text
User Request ──► Request ID Middleware ──► PromptBuilder ──► Gemini Provider
                                                                  │
  API Response ◄── Content Blocks ◄── Synthesis ◄── FunctionResponse ◄── ToolRegistry (ProductClient)
```

1. **Request ID Middleware**: Injects `request_id`, `user_id`, and `conversation_id` into context variables so every log entry carries `[request_id=...] [user_id=...] [conversation_id=...]`.
2. **Prompt Assembly**: `PromptBuilder` (`PROMPT_VERSION = "v1.0"`) formats history turns as native `types.Content` objects without stringifying tool JSON into prompts.
3. **First Completion Pass**: `GeminiProvider` queries model (`gemini-3.6-flash`) with native `types.Tool` declarations from `ToolRegistry`.
4. **Tool Dispatch**: `AssistantOrchestrator` intercepts structured `FunctionCall` requests and delegates execution to `ToolRegistry`.
5. **ProductClient Resiliency**: `ProductClient` executes HTTP requests with exponential backoff retries for status codes `408, 429, 500, 502, 503, 504`. Never retries `400, 401, 403, 404`.
6. **Native FunctionResponse**: Native `types.Part.from_function_response()` parts are appended to conversation turns.
7. **Second Completion Pass**: Gemini synthesizes final natural-language response.
8. **Structured Content Blocks**: Returns final text and `product_recommendations` cards to the client.

---

## Production Hardening Features

- **Decoupled Tool Registry (`app/tools/registry.py`)**: Centralized `ToolRegistry` for registering and dynamically executing tools (`search_products`, `get_product`, `compare_products`, `get_categories`). `AssistantOrchestrator` never depends on concrete tool classes.
- **ProductClient Resiliency (`app/clients/product_client.py`)**: Exponential backoff retry policy, configurable timeouts, status-code filtering, and latency metrics.
- **Request Tracing & Log Context (`app/core/logging_context.py`)**: Automated contextvars injection of `[request_id=...] [user_id=...] [conversation_id=...]` into log streams.
- **Metrics Logging**: Logs Gemini API request latency (ms), token usage (`prompt_token_count`, `candidates_token_count`, `total_token_count`), tool execution duration (ms), Product API latency (ms), retry counts, and total orchestration duration (ms).
- **Startup Config Validation (`app/core/config.py`)**: Lifespan startup validation checking `DATABASE_URL`, `PRODUCT_SERVICE_URL`, `ENV`, and `GEMINI_MODEL`. Fails fast on invalid configuration.
- **Centralized Domain Exceptions (`app/core/exceptions.py`)**: `AssistantBaseException`, `ConfigurationError`, `LLMUnavailableError`, `ToolExecutionError`, `ProductServiceUnavailable`, and `PromptBuildError`. Exposes friendly error responses without stack traces.

---

## Roadmap

- **Phase 1 ✅**: Core FastAPI foundation, configuration, logging, database session setup, dependency injection, and abstract interfaces.
- **Phase 2 ✅**: Database ORM models (`Conversation`, `Message`), Alembic migrations, Clerk JWT authentication, repository pattern, service layer, and conversation/message REST endpoints.
- **Phase 2.5 ✅**: PostgreSQL primary database configuration, timezone-aware UTC datetimes (`datetime.now(UTC)`), authentication security hardening, `ProductClient` interface expansion, and `AssistantOrchestrator` workflow documentation.
- **Phase 3 ✅**: Official Gemini `google-genai` SDK integration, `PromptBuilder`, `ProductClient` async `httpx` implementation, tool function calling execution, official Clerk auth verification, and full AI shopping assistant message flow.
- **Phase 3.5 ✅**: Native `google-genai` function calling (`FunctionCall` -> `FunctionResponse`), multi-turn tool execution, removal of raw tool JSON responses, `GEMINI_MODEL=gemini-3.6-flash` configuration, and Express product service endpoint routing.
- **Phase 3.8 ✅**: Production Hardening — `ToolRegistry`, `ProductClient` exponential backoff retries, request ID log tracing context, latency & token metrics, startup config validation, centralized domain exceptions, and unit test suite expansion (`14 passed`).
- **Phase 4**: LangGraph stateful orchestration graphs, Server-Sent Events (SSE) streaming responses, performance tuning, and production optimizations.

---

## Getting Started & Verification

```bash
# Navigate to service directory
cd apps/assistant-service

# Run Alembic migrations
uv run alembic upgrade head

# Run automated unit and integration test suite (14 passed)
uv run pytest

# Start local dev server
uv run uvicorn app.main:app --reload --port 8004
```

- **Root Info**: `http://localhost:8004/`
- **Health Check**: `http://localhost:8004/health`
- **Swagger Docs**: `http://localhost:8004/docs`
