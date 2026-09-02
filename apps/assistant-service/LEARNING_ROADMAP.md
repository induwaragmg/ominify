# Ominify AI Assistant Service — Complete Master Code & Architecture Guide

> **Target Audience:** Beginner to Intermediate developers learning AI engineering, Agentic State Machines, and Python microservices.  
> **Coverage:** 100% of all 45+ source code, configuration, database migration, and test files in `apps/assistant-service`.

---

## Table of Contents
1. [Full File Directory & Inventory (All Files)](#1-full-file-directory--inventory-all-files)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
3. [10-Step Master Learning Roadmap with ChatGPT Prompts](#3-10-step-master-learning-roadmap-with-chatgpt-prompts)
   - [Phase 1: Project Setup, Docker & Dependencies](#phase-1-project-setup-docker--dependencies)
   - [Phase 2: Core Configuration, Lifespan & Tracing Logs](#phase-2-core-configuration-lifespan--tracing-logs)
   - [Phase 3: Database Engine, ORM Models & Alembic Migrations](#phase-3-database-engine-orm-models--alembic-migrations)
   - [Phase 4: Repositories & Data Access Layer](#phase-4-repositories--data-access-layer)
   - [Phase 5: Authentication & Security (Clerk JWT)](#phase-5-authentication--security-clerk-jwt)
   - [Phase 6: External Microservice HTTP Client (Product Client)](#phase-6-external-microservice-http-client-product-client)
   - [Phase 7: Tool Registry & Gemini Function Calling](#phase-7-tool-registry--gemini-function-calling)
   - [Phase 8: LLM Provider, System Prompts & Context Builder](#phase-8-llm-provider-system-prompts--context-builder)
   - [Phase 9: LangGraph Cognitive State Machine (Agent Brain)](#phase-9-langgraph-cognitive-state-machine-agent-brain)
   - [Phase 10: Orchestration, SSE Streaming, API Routes & Pytest Suite](#phase-10-orchestration-sse-streaming-api-routes--pytest-suite)
4. [Life of a Message (Complete End-to-End Trace)](#4-life-of-a-message-complete-end-to-end-trace)
5. [Complete Terminology Glossary](#5-complete-terminology-glossary)

---

## 1. Full File Directory & Inventory (All Files)

Here is every single file in `apps/assistant-service`:

```text
apps/assistant-service/
├── pyproject.toml                         # Dependency management and project metadata
├── Dockerfile                             # Multi-stage production container build
├── alembic.ini                            # Alembic migration configuration
├── .env                                   # Local environment variables
├── test.py                                # Direct Gemini SDK API testing script
│
├── alembic/                               # Database migration scripts
│   ├── env.py                             # Async migration engine runner
│   ├── script.py.mako                     # Migration file template
│   └── versions/
│       └── 055a80d1cadd_create_conversations_and_messages_tables.py # Initial DB schema
│
├── app/
│   ├── main.py                            # FastAPI application entry point
│   │
│   ├── core/                              # Infrastructure and configuration
│   │   ├── config.py                      # Pydantic BaseSettings & startup validation
│   │   ├── exceptions.py                  # Domain exception hierarchy
│   │   ├── lifespan.py                    # Startup validation & shutdown handler
│   │   ├── logging.py                     # Structured log formatting setup
│   │   └── logging_context.py             # ContextVar per-request log tracing
│   │
│   ├── database/                          # Database connection layer
│   │   ├── session.py                     # Async SQLAlchemy engine & get_db dependency
│   │   └── base.py                        # Declarative Base export
│   │
│   ├── models/                            # SQLAlchemy ORM database models
│   │   ├── __init__.py                    # Model re-exports
│   │   ├── conversation.py                # Conversation entity & relationships
│   │   └── message.py                     # Message entity with JSONB content blocks
│   │
│   ├── schemas/                           # Pydantic API validation schemas
│   │   ├── auth.py                        # CurrentUser schema
│   │   ├── conversation.py                # ConversationCreate, Response, List
│   │   ├── message.py                     # MessageCreate (with validator), Response, List
│   │   ├── health.py                      # HealthResponse schema
│   │   └── error.py                       # ErrorResponse schema
│   │
│   ├── auth/                              # Authentication & token verification
│   │   ├── clerk.py                       # Clerk JWT verification & claim extraction
│   │   └── dependencies.py                # FastAPI get_current_user & require_auth
│   │
│   ├── api/                               # API layer
│   │   ├── dependencies/
│   │   │   ├── auth.py                    # Auth dependency export
│   │   │   └── database.py                # Database dependency export
│   │   └── routes/
│   │       ├── health.py                  # GET /health endpoint
│   │       ├── conversations.py           # CRUD endpoints for conversations
│   │       └── messages.py                # POST /messages & POST /messages/stream
│   │
│   ├── repositories/                      # Pure SQL/ORM database query layer
│   │   ├── conversation_repository.py     # Conversation queries (create, get, list, delete)
│   │   └── message_repository.py          # Message queries (create, list)
│   │
│   ├── services/                          # Business logic service layer
│   │   ├── conversation_service.py        # Conversation rules & 404/403 authorization
│   │   └── message_service.py             # Message flow, title generation, AI invocation
│   │
│   ├── clients/                           # External microservice clients
│   │   └── product_client.py              # Async httpx client with exponential backoff
│   │
│   ├── tools/                             # AI Function Calling Tools
│   │   ├── registry.py                    # ToolRegistry & BaseTool protocol
│   │   ├── search_products_tool.py        # Search products tool
│   │   ├── get_product_tool.py            # Get product specifications tool
│   │   ├── compare_products_tool.py       # Compare multiple products tool
│   │   └── get_categories_tool.py         # Get product categories tool
│   │
│   ├── llm/                               # LLM integration & prompts
│   │   ├── providers/
│   │   │   ├── base.py                    # Abstract LLMProvider interface
│   │   │   └── gemini.py                  # Google Gemini provider with token & latency metrics
│   │   └── prompts/
│   │       ├── system_prompt.py           # Core assistant personality & safety guardrails
│   │       ├── shopping_prompt.py         # E-commerce shopping guidelines
│   │       └── prompt_builder.py          # Conversation history & preference assembler
│   │
│   ├── langgraph/                         # Cognitive State Machine (The Brain)
│   │   ├── state.py                       # AssistantState TypedDict
│   │   ├── schemas.py                     # ExecutionPlan & UserPreferences schemas
│   │   ├── summarizer.py                  # Sliding-window summarization & regex preference extractor
│   │   ├── edges.py                       # Conditional routing edges (planning & llm routing)
│   │   ├── checkpoints.py                 # Checkpointer factory (MemorySaver)
│   │   ├── nodes.py                       # Planning, Clarification, LLM, Tools, Refinement, Response
│   │   └── graph.py                       # StateGraph definition & compilation
│   │
│   └── orchestrators/                     # High-level AI conductor
│       └── assistant_orchestrator.py      # REST orchestration & 7-stage SSE event streaming
│
└── tests/                                 # Automated Pytest Suite
    ├── conftest.py                        # Test database setup & fixtures
    ├── test_config_and_exceptions.py      # Configuration validation & domain error tests
    ├── test_conversations_and_messages.py # User isolation & conversation lifecycle tests
    ├── test_langgraph_agent.py            # Planning, confidence scoring & search refinement tests
    ├── test_native_function_calling.py    # Function declaration & multi-pass tool execution tests
    ├── test_product_client_resiliency.py  # HTTP backoff retry & error handling tests
    └── test_tool_registry.py              # Tool registry unit tests
```

---

## 2. End-to-End System Architecture

```text
[ Next.js Storefront Browser ]
             │
             │ HTTP REST / SSE Stream (Port 8004)
             ▼
┌────────────────────────────────────────────────────────┐
│ FastAPI Web Server (`app/main.py`)                     │
│ ├── Tracing Middleware (`app/core/logging_context.py`) │
│ ├── Auth Verification (`app/auth/clerk.py`)            │
│ └── API Endpoints (`app/api/routes/`)                  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Service Layer (`app/services/message_service.py`)      │
│ ├── Checks thread ownership (403 vs 404)               │
│ ├── Saves user message to DB                           │
│ └── Triggers Assistant Orchestrator                    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Orchestrator (`app/orchestrators/`)                    │
│ └── Manages LangGraph State Machine Execution          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ LangGraph State Machine (`app/langgraph/`)             │
│                                                        │
│ 1. PlanningNode (Calculates confidence & intent)       │
│      │                                                 │
│      ├─ [Confidence < 0.70] ──> ClarificationNode       │
│      │                                                 │
│      └─ [Confidence >= 0.70] ─> LLMNode (Gemini Flash) │
│                                            │           │
│ 2. ToolExecutionNode <─────────────────────┤           │
│    (Executes search/compare tools)         │           │
│      │                                     │           │
│      └─ [0 items found] ──> SearchRefinementNode       │
│                                            │           │
│ 3. BuildResponseNode <─────────────────────┘           │
│    (Packages text + rich product card blocks)          │
└───────────────────┬───────────────────┬────────────────┘
                    │                   │
                    ▼                   ▼
┌─────────────────────────┐   ┌──────────────────────────┐
│ Gemini LLM Provider     │   │ Product Service Client   │
│ (`app/llm/providers/`)  │   │ (`app/clients/`)         │
│ (google-genai SDK)      │   │ (HTTP calls to Port 8000)│
└─────────────────────────┘   └──────────────────────────┘
```

---

## 3. 10-Step Master Learning Roadmap with ChatGPT Prompts

---

### Phase 1: Project Setup, Docker & Dependencies
**Goal:** Understand how modern Python services are configured, packaged, and containerized.

#### 📂 Files:
1. `pyproject.toml`
2. `Dockerfile`
3. `test.py`

#### 💡 Core Concepts:
- **`uv` Package Manager**: Fast dependency resolution and lockfile management (`uv.lock`).
- **Multi-Stage Dockerfile**:
  - *Stage 1 (Builder)*: Uses `ghcr.io/astral-sh/uv` to install dependencies into `.venv`.
  - *Stage 2 (Runner)*: Minimal Alpine Linux container running as an unprivileged `appuser`.
- **Direct Gemini Test (`test.py`)**: A simple 15-line script testing API keys with `client.models.generate_content`.

#### 🤖 Copy-Paste Prompts for ChatGPT:
```text
I am studying a Python backend microservice. Here is pyproject.toml and Dockerfile:
[Paste contents of pyproject.toml and Dockerfile]

Please explain to me:
1. What each dependency in pyproject.toml does.
2. How multi-stage Docker builds work and why we run as non-root user.
3. How to run this container locally.
```

---

### Phase 2: Core Configuration, Lifespan & Tracing Logs
**Goal:** Learn how a production Python backend validates environment settings on startup and traces requests across async logs.

#### 📂 Files:
1. `app/core/config.py`
2. `app/core/exceptions.py`
3. `app/core/lifespan.py`
4. `app/core/logging.py`
5. `app/core/logging_context.py`
6. `app/main.py`

#### 💡 Core Concepts:
- **`pydantic-settings` (`BaseSettings`)**: Type-safe loading from `.env` (URLs, ports, API keys).
- **Fail-Fast `validate_config()`**: Stops server startup immediately if required parameters (like `DATABASE_URL`) are missing.
- **ContextVars Log Tracing**: Injects `[request_id=...] [user_id=...] [conversation_id=...]` into all log records automatically.
- **Domain Exception Hierarchy**: Custom errors derived from `AssistantBaseException`.

#### 🤖 Copy-Paste Prompts for ChatGPT:
```text
Here is app/core/config.py, app/core/exceptions.py, and app/core/logging_context.py:
[Paste contents of app/core/config.py and app/core/logging_context.py]

Please explain:
1. How Pydantic BaseSettings parses environment variables.
2. How Python contextvars works for per-request log tracing.
3. How global exception handlers in FastAPI catch custom domain exceptions.
```

---

### Phase 3: Database Engine, ORM Models & Alembic Migrations
**Goal:** Learn asynchronous SQL databases, relational data modeling, and schema version control.

#### 📂 Files:
1. `app/database/session.py`
2. `app/database/base.py`
3. `app/models/conversation.py`
4. `app/models/message.py`
5. `app/models/__init__.py`
6. `alembic.ini`
7. `alembic/env.py`
8. `alembic/versions/055a80d1cadd_create_conversations_and_messages_tables.py`

#### 💡 Core Concepts:
- **Async SQLAlchemy (`create_async_engine`, `async_sessionmaker`)**: Connecting asynchronously to PostgreSQL (`asyncpg`) or SQLite (`aiosqlite`).
- **ORM Models**: `Conversation` has a 1-to-many relationship with `Message` (`cascade="all, delete-orphan"`).
- **JSON / JSONB Columns**: `Message.content` stores structured content blocks (text, product recommendations, citations).
- **Alembic Migrations**: Tracking database schema changes across environments.

#### 🤖 Copy-Paste Prompts for ChatGPT:
```text
Here is app/models/conversation.py, app/models/message.py, and alembic/env.py:
[Paste contents of app/models/conversation.py and app/models/message.py]

Please explain:
1. What SQLAlchemy 2.0 Mapped columns and relationships do.
2. How cascade="all, delete-orphan" works when a conversation is deleted.
3. Why storing message content as JSON/JSONB is ideal for an AI shopping assistant.
```

---

### Phase 4: Repositories & Data Access Layer
**Goal:** Learn the Repository and Service patterns that decouple SQL queries from business rules.

#### 📂 Files:
1. `app/repositories/conversation_repository.py`
2. `app/repositories/message_repository.py`
3. `app/services/conversation_service.py`
4. `app/services/message_service.py`
5. `app/schemas/conversation.py`
6. `app/schemas/message.py`
7. `app/schemas/health.py`
8. `app/schemas/error.py`

#### 💡 Core Concepts:
- **Repository Pattern**: `ConversationRepository` and `MessageRepository` handle pure SQL statements.
- **Service Layer**: Handles authorization, title generation from the first user message, and triggering the AI orchestrator.
- **Pydantic Validation**: `MessageCreate` field validators ensure messages are non-empty and under character limits.

#### 🤖 Copy-Paste Prompts for ChatGPT:
```text
Here is app/repositories/conversation_repository.py and app/services/conversation_service.py:
[Paste contents of app/services/conversation_service.py]

Please explain:
1. Why we separate Repositories from Services.
2. How get_conversation distinguishes between 404 (not found) and 403 (unauthorized).
3. How Pydantic validates incoming request bodies.
```

---

### Phase 5: Authentication & Security (Clerk JWT)
**Goal:** Understand how JWT tokens authenticate users and enforce chat isolation.

#### 📂 Files:
1. `app/schemas/auth.py`
2. `app/auth/clerk.py`
3. `app/auth/dependencies.py`
4. `app/api/dependencies/auth.py`
5. `app/api/dependencies/database.py`

#### 💡 Core Concepts:
- **Clerk JWT Verification**: Decoding signatures, checking expiration, and extracting the user ID (`sub`).
- **FastAPI `Depends()`**: Injects the verified `CurrentUser` directly into route handlers.
- **Dev Mode Fallback**: Provides mock credentials for local testing without contacting external auth servers.

#### 🤖 Copy-Paste Prompts for ChatGPT:
```text
Here is app/auth/clerk.py and app/auth/dependencies.py:
[Paste contents of app/auth/dependencies.py]

Please explain:
1. How FastAPI dependency injection resolves CurrentUser from the Authorization header.
2. What are JWT claims and how do they secure multi-user applications?
```

---

### Phase 6: External Microservice HTTP Client (Product Client)
**Goal:** Learn how microservices communicate over HTTP reliably using exponential backoff retries.

#### 📂 Files:
1. `app/clients/product_client.py`

#### 💡 Core Concepts:
- **`httpx.AsyncClient`**: Asynchronous HTTP client for querying the Product Service (Port 8000).
- **Exponential Backoff**: Sleeping `backoff_factor * (2 ** attempt)` seconds between failed requests.
- **Retry Status Codes**: Retrying on `503`, `502`, `429`, or timeouts, but never retrying `404` or `401`.

#### 🤖 Copy-Paste Prompts for ChatGPT:
```text
Here is app/clients/product_client.py:
[Paste contents of app/clients/product_client.py]

Please explain:
1. How does the retry loop with exponential backoff work in _execute_request_with_retry?
2. Why are status codes like 503 retryable while 404 is non-retryable?
```

---

### Phase 7: Tool Registry & Gemini Function Calling
**Goal:** Master native function calling — giving the AI tools to query live product databases.

#### 📂 Files:
1. `app/tools/registry.py`
2. `app/tools/search_products_tool.py`
3. `app/tools/get_product_tool.py`
4. `app/tools/compare_products_tool.py`
5. `app/tools/get_categories_tool.py`

#### 💡 Core Concepts:
- **`types.FunctionDeclaration`**: Official Google GenAI tool schemas defining function names, parameter types, and descriptions.
- **`ToolRegistry`**: Central manager that registers Python tools, exports them as Gemini tools, and executes them dynamically.
- **The 4 Tools**:
  - `search_products`: Searches products by keyword, category, and price range.
  - `get_product`: Retrieves complete product specifications by ID.
  - `compare_products`: Compares multiple products side-by-side.
  - `get_categories`: Lists store categories.

#### 🤖 Copy-Paste Prompts for ChatGPT:
```text
Here is app/tools/registry.py and app/tools/search_products_tool.py:
[Paste contents of app/tools/search_products_tool.py and app/tools/registry.py]

Please explain:
1. What is a google-genai FunctionDeclaration and how does Gemini use it?
2. Walk me through the step-by-step lifecycle of an AI tool execution turn.
```

---

### Phase 8: LLM Provider, System Prompts & Context Builder
**Goal:** Learn how to call Google Gemini using the official SDK, design system prompts, and assemble multi-turn conversation context.

#### 📂 Files:
1. `app/llm/providers/base.py`
2. `app/llm/providers/gemini.py`
3. `app/llm/prompts/system_prompt.py`
4. `app/llm/prompts/shopping_prompt.py`
5. `app/llm/prompts/prompt_builder.py`

#### 💡 Core Concepts:
- **`google-genai` SDK**: Client initialization, `generate_content`, and `generate_content_stream`.
- **Token & Latency Metrics**: Logging request duration in ms and prompt/candidate token counts.
- **`PromptBuilder`**: Assembling previous database messages, system rules, user preferences, and dialogue summaries into `types.Content` arrays.

#### 🤖 Copy-Paste Prompts for ChatGPT:
```text
Here is app/llm/providers/gemini.py and app/llm/prompts/prompt_builder.py:
[Paste contents of app/llm/prompts/prompt_builder.py]

Please explain:
1. How does PromptBuilder convert database message history into Gemini types.Content objects?
2. How are long-term user preferences injected into the system instruction?
```

---

### Phase 9: LangGraph Cognitive State Machine (Agent Brain)
**Goal:** Master state-driven Agentic AI, confidence scoring, planning, and progressive search recovery.

#### 📂 Files:
1. `app/langgraph/state.py`
2. `app/langgraph/schemas.py`
3. `app/langgraph/summarizer.py`
4. `app/langgraph/edges.py`
5. `app/langgraph/nodes.py`
6. `app/langgraph/graph.py`
7. `app/langgraph/checkpoints.py`

#### 💡 Core Concepts:
- **`StateGraph`**: A state machine where Nodes represent tasks and Edges represent conditional decisions.
- **`AssistantState`**: The TypedDict passed between nodes containing context, execution plans, and tool outputs.
- **Cognitive Nodes**:
  - `planning_node`: Analyzes intent, assigns confidence (0.0 to 1.0), extracts `UserPreferences`.
  - `clarification_node`: Triggered when confidence < 0.70 to ask clarifying questions for vague queries.
  - `llm_node`: Calls Gemini with context and tools.
  - `tool_execution_node`: Runs independent tools in parallel (`asyncio.gather`) and dependent tools sequentially.
  - `search_refinement_node`: Progressive multi-step recovery when a search returns 0 products.
  - `build_response_node`: Assembles final text and UI product cards.
- **Conditional Edges**: `route_after_planning` and `route_after_llm`.

#### 🤖 Copy-Paste Prompts for ChatGPT:
```text
Here is app/langgraph/graph.py, app/langgraph/nodes.py, and app/langgraph/edges.py:
[Paste contents of app/langgraph/graph.py and app/langgraph/edges.py]

Please explain:
1. How does LangGraph pass state between nodes?
2. How do route_after_planning and route_after_llm make dynamic routing decisions?
3. What is the role of each node in this cognitive graph?
```

---

### Phase 10: Orchestration, SSE Streaming, API Routes & Pytest Suite
**Goal:** Understand how the entire AI system is exposed via REST endpoints and Server-Sent Events (SSE) streaming, and verified by automated tests.

#### 📂 Files:
1. `app/orchestrators/assistant_orchestrator.py`
2. `app/api/routes/health.py`
3. `app/api/routes/conversations.py`
4. `app/api/routes/messages.py`
5. `tests/conftest.py`
6. `tests/test_config_and_exceptions.py`
7. `tests/test_conversations_and_messages.py`
8. `tests/test_langgraph_agent.py`
9. `tests/test_native_function_calling.py`
10. `tests/test_product_client_resiliency.py`
11. `tests/test_tool_registry.py`

#### 💡 Core Concepts:
- **Server-Sent Events (SSE / `StreamingResponse`)**: Emitting real-time progress events:
  1. `event: thinking`
  2. `event: planning`
  3. `event: tool_start`
  4. `event: tool_finished`
  5. `event: reasoning`
  6. `event: llm_chunk` (word-by-word streaming)
  7. `event: completed` (final structured product cards)
- **Pytest Suite**: 6 test files covering unit validation, async mocks, JWT user isolation, function calling, and state machine graph execution.

#### 🤖 Copy-Paste Prompts for ChatGPT:
```text
Here is app/orchestrators/assistant_orchestrator.py and tests/test_conversations_and_messages.py:
[Paste contents of app/orchestrators/assistant_orchestrator.py]

Please explain:
1. How stream_message generates Server-Sent Events (SSE) using Python AsyncGenerator and yield.
2. How the tests mock external clients to test the assistant without incurring API costs.
```

---

## 4. Life of a Message (Complete End-to-End Trace)

Follow what happens when a user types **"Find me Nike running shoes under $120"**:

```text
1. [User Request]
   User sends HTTP POST to /api/v1/conversations/{id}/messages
   Payload: { "role": "user", "content": "Find me Nike running shoes under $120" }

2. [FastAPI Endpoint - app/api/routes/messages.py]
   - get_current_user extracts Clerk JWT claims -> user_id = "user_456"
   - Calls MessageService.create_message()

3. [Service Layer - app/services/message_service.py]
   - Validates conversation exists & user_id owns it.
   - Saves User message to PostgreSQL messages table.
   - Calls AssistantOrchestrator.process_message()

4. [Orchestrator - app/orchestrators/assistant_orchestrator.py]
   - Initializes AssistantState dictionary.
   - Invokes compiled LangGraph agent graph.

5. [LangGraph Execution - app/langgraph/nodes.py & graph.py]
   Step A: planning_node
           - Extracts user preferences: brand="Nike", purpose="Running", budget="under $120"
           - Calculates confidence = 0.95 (intent = "search_products")
   Step B: route_after_planning edge
           - Confidence >= 0.70 -> Routes to llm_node
   Step C: llm_node
           - Calls GeminiProvider.generate_response()
           - Gemini replies with FunctionCall: search_products(query="running shoes", category="Nike", max_price=120)
   Step D: route_after_llm edge
           - Function call detected -> Routes to tool_execution_node
   Step E: tool_execution_node
           - ToolRegistry executes SearchProductsTool
           - ProductClient makes async HTTP GET to Product Service (Port 8000)
           - Fetches 3 Nike running shoes from database
           - Appends FunctionResponse to conversation context
   Step F: llm_node (Pass 2)
           - Gemini inspects the 3 returned shoes and generates a helpful summary
   Step G: route_after_llm edge
           - No more function calls -> Routes to build_response_node
   Step H: build_response_node
           - Packages final text and 3 product recommendation objects into content_blocks

6. [Save & Return]
   - MessageService saves Assistant message with content_blocks to database.
   - Returns MessageResponse to client.
   - Storefront UI renders natural language text + interactive product cards!
```

---

## 5. Complete Terminology Glossary

- **Agent**: An AI system equipped with tools, memory, and a workflow to solve goals autonomously.
- **State**: The shared dictionary passed between nodes in LangGraph during an execution turn.
- **Node**: A Python function representing one discrete step of computation in LangGraph.
- **Conditional Edge**: A routing function that inspects the current state and decides which node to execute next.
- **Function Calling / Tools**: Providing structured schemas to an LLM so it can request real-world database queries or API actions.
- **Prompt Engineering**: Crafting system instructions, rules, and few-shot examples to guide model behavior.
- **SSE (Server-Sent Events)**: An HTTP standard allowing the server to push a continuous stream of events to the client over one connection.
- **JWT (JSON Web Token)**: A signed token carrying identity and permission claims for secure authentication.
- **Pydantic**: A data validation and settings library using Python type annotations.
- **SQLAlchemy 2.0**: The standard Python ORM for database modeling and asynchronous query execution.
- **Alembic**: A database migration tool for SQLAlchemy that tracks and applies table schema revisions.
- **ContextVars**: Python's native mechanism for managing thread-safe, coroutine-safe context data like request IDs across async function calls.
