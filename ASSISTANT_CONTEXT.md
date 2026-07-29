# Ominify AI Shopping Assistant — Architecture & Technical Specification

Use this document as the authoritative architectural specification for the AI Shopping Assistant workspace feature (`apps/client`). It reflects the codebase as refactored on **2026-07-28**.

---

## 1. Executive Summary & Design Principles

The **Ominify AI Shopping Assistant** is an embedded, AI-first conversational shopping companion integrated into the Next.js storefront (`apps/client`).

### Architecture Directives:
- **Strict Decoupling**: UI components consume Zustand stores and abstract API client functions — zero direct backend awareness in components.
- **Store Separation**: UI state (visibility, widths, drawers) is completely isolated from Assistant data state (conversations, messages, lifecycle status, cancellation signals).
- **Extensible Content Schema**: Message content blocks use a discriminated union (`type`) supporting text, product recommendations, tool calls, tool results, citations, attachments, and follow-up suggestions without breaking components when backend capability expands.
- **Zero Frontend Refactoring on Integration**: All API calls in `services/assistant.ts` return typed Promises, accept `AbortSignal` for cancellation, throw typed errors (`AssistantApiError`, `AssistantNetworkError`, `AssistantAbortError`), and are fetch-compatible.

---

## 2. Architecture & Service Layer Abstraction

```text
+-----------------------------------------------------------------------------------+
|                                 Next.js Client                                    |
|                                                                                   |
|  +---------------------------+             +-----------------------------------+  |
|  | UI Components             |             | Zustand Stores                    |  |
|  | (Navbar, Workspace,       | ----------->| - workspaceUIStore.ts (Layout/UI) |  |
|  |  AssistantPanel, Chat)    |             | - assistantStore.ts (Data/Chat)   |  |
|  +---------------------------+             +-----------------+-----------------+  |
|                                                              |                    |
|                                                              v                    |
|                                            +-----------------------------------+  |
|                                            | API Client Service Layer          |  |
|                                            | (services/assistant.ts)           |  |
|                                            +-----------------+-----------------+  |
+--------------------------------------------------------------|--------------------+
                                                               |
                                                               | (HTTP / REST API)
                                                               v
                                            +-----------------------------------+
                                            | Upcoming assistant-service        |
                                            | Microservice (Port :8004 / LLM)   |
                                            +-----------------------------------+
```

---

## 3. Store Responsibilities

### 3.1 UI Store (`stores/workspaceUIStore.ts`)
Manages layout presentation state only:
- **`isAssistantOpen`**: `boolean` (desktop panel visibility).
- **`isMobileOpen`**: `boolean` (mobile slide-over drawer visibility).
- **`assistantWidth`**: `number` (pixel width for desktop mouse resizing).
- **`isResizing`**: `boolean` (mouse drag active flag).
- **Actions**: `toggleAssistant()`, `openAssistant()`, `closeAssistant()`, `closeMobile()`, `setAssistantWidth(w)`, `setIsResizing(b)`.

### 3.2 Assistant Data Store (`stores/assistantStore.ts`)
Manages chat lifecycle, conversation lists, message history, and request signals:
- **`conversations`**: `Conversation[]`.
- **`activeConversation`**: `ConversationWithMessages | null`.
- **`quickActions`**: `QuickAction[]`.
- **`status`**: `"idle" | "loading" | "sending" | "streaming" | "error"`.
- **`error`**: `AssistantError | null`.
- **`activeAbortController`**: `AbortController | null` (active HTTP cancellation controller).
- **Actions**: `fetchConversations()`, `fetchQuickActions()`, `openConversation(id)`, `createConversation(initialPrompt?)`, `sendMessage(content)`, `deleteConversation(id)`, `cancelActiveRequest()`, `goBackToWelcome()`, `clearError()`.

### 3.3 Unified Facade Store (`stores/workspaceStore.ts`)
Re-exports `useWorkspaceUIStore` and `useAssistantStore` and provides a backward-compatible selector facade for legacy components.

---

## 4. Domain Models & Contracts (`types/assistant.ts`)

### 4.1 Extensible Message & Content Blocks
```typescript
export type MessageRole = "user" | "assistant" | "system" | "tool";

export type MessageStatus = "pending" | "sending" | "sent" | "streaming" | "error";

export type MessageContentBlock =
  | { type: "text"; text: string }
  | { type: "product_recommendations"; products: AssistantProduct[] }
  | { type: "tool_call"; toolName: string; args: Record<string, unknown> }
  | { type: "tool_result"; toolName: string; result: unknown }
  | { type: "citation"; title: string; url?: string; snippet?: string }
  | { type: "attachment"; name: string; url: string; mimeType: string }
  | { type: "follow_up_suggestions"; suggestions: string[] };
```

### 4.2 Reused Product Model
Extends core `@repo/types` `ProductType` rather than duplicating product schemas:
```typescript
export interface AssistantProduct extends ProductType {
  rating?: number;
  reviewCount?: number;
}
```

### 4.3 Conversation & Pagination Contracts
```typescript
export type ConversationStatus = "active" | "archived" | "pinned";

export interface Conversation {
  id: string;
  title: string;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}
```

### 4.4 Typed Error Hierarchy
- **`AssistantApiError`**: Thrown for HTTP status errors (4xx/5xx). Includes `statusCode` and `code`.
- **`AssistantNetworkError`**: Thrown for offline or connection failure events.
- **`AssistantAbortError`**: Thrown when user or system cancels an in-flight request via `AbortSignal`.

---

## 5. API Client Service Layer (`services/assistant.ts`)

Every method accepts an optional `options?: RequestOptions` object containing `signal?: AbortSignal` and returns typed Promises:

| Function | Endpoint Contract | Purpose |
| :--- | :--- | :--- |
| `getConversations(params?, options?)` | `GET /conversations` | List user chat threads |
| `getConversation(id, options?)` | `GET /conversations/:id` | Get thread details & messages |
| `createConversation(req, options?)` | `POST /conversations` | Start new chat thread |
| `sendMessage(req, options?)` | `POST /conversations/:id/messages` | Post user message & await reply |
| `deleteConversation(id, options?)` | `DELETE /conversations/:id` | Remove chat thread |
| `getQuickActions(options?)` | `GET /quick-actions` | Fetch starter prompts |

---

## 6. Component Responsibilities

- **`Navbar.tsx`**: Renders Sparkles toggle button. Uses `useWorkspaceUIStore` for active status and toggle triggers.
- **`Workspace.tsx`**: Manages sticky positioning (`sticky top-0`), resizable mouse drag handle (`ResizeHandle`), panel width clamping, and mobile slide-over drawer with backdrop overlay.
- **`AssistantPanel.tsx`**: Renders welcome screen vs active conversation, online status indicator, container-only smooth auto-scrolling (`chatContainerRef.current.scrollTo`), and error banner. Uses `useAssistantStore`.
- **`ChatMessage.tsx`**: Renders message blocks stacked vertically below bot indicator for 100% full panel width, custom corner roundness (`rounded-tr-md` on user messages), and animated typing indicators.
- **`ChatInput.tsx`**: Renders single-line 32px height text input with pixel-perfect vertical centering (`items-center`) and keyboard submit handlers.
- **`QuickActions.tsx`**: Renders clickable prompt chips.
- **`ChatHistory.tsx`**: Renders recent conversation list with relative timestamps.
- **`ProductRecommendationCard.tsx`**: Renders rich product cards with thumbnails, ratings, price, view links, and direct `useCartStore` cart actions.
- **`Categories.tsx`**: Uses `ResizeObserver` to dynamically hide/show middle category items in real time as the assistant panel width changes, keeping "All" on the far left and "More" on the far right.

---

## 7. Connecting the `assistant-service` Microservice

When `apps/assistant-service` (Port `:8004`) is implemented:

1. Add environment variable to `.env`:
   ```env
   NEXT_PUBLIC_ASSISTANT_SERVICE_URL=http://localhost:8004
   ```
2. Replace placeholder response generators in `services/assistant.ts` with standard `fetch()` calls:
   ```typescript
   export async function sendMessage(
     request: SendMessageRequest,
     options?: RequestOptions
   ): Promise<SendMessageResponse> {
     const res = await fetch(`${ASSISTANT_SERVICE_URL}/conversations/${request.conversationId}/messages`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(request),
       signal: options?.signal,
     });
     if (!res.ok) {
       throw new AssistantApiError("Failed to send message", res.status);
     }
     return res.json();
   }
   ```
3. **No UI component or store changes required.**
