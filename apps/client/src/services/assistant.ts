// ─── Assistant Service API Client ────────────────────────────────────────────
// Service client module for HTTP API communication with the assistant-service
// microservice (defaulting to http://localhost:8004).
//
// All functions return typed Promises, throw typed errors (AssistantApiError,
// AssistantNetworkError, AssistantAbortError), and support AbortSignal cancellation.
// Uses Clerk JWT token for authenticated requests via Authorization header.

import type {
  BackendConversationListResponse,
  BackendConversationResponse,
  BackendMessageListResponse,
  BackendMessageResponse,
  Conversation,
  ConversationWithMessages,
  CreateConversationRequest,
  CreateConversationResponse,
  Message,
  MessageContentBlock,
  ParsedSSEEvent,
  QuickAction,
  RequestOptions,
  SendMessageRequest,
} from "@/types/assistant";
import {
  AssistantAbortError,
  AssistantApiError,
  AssistantNetworkError,
} from "@/types/assistant";

// ─── Configuration ───────────────────────────────────────────────────────────

const ASSISTANT_SERVICE_URL =
  process.env.NEXT_PUBLIC_ASSISTANT_SERVICE_URL ?? "http://localhost:8004";

const API_V1 = `${ASSISTANT_SERVICE_URL}/api/v1`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build headers including optional Clerk JWT Bearer token. */
function buildHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/** Handles errors and wraps unknown failures into typed AssistantErrors. */
function handleServiceError(error: unknown): never {
  if (
    error instanceof AssistantApiError ||
    error instanceof AssistantNetworkError ||
    error instanceof AssistantAbortError
  ) {
    throw error;
  }
  if (error instanceof Error && error.name === "AbortError") {
    throw new AssistantAbortError();
  }
  if (error instanceof TypeError && error.message.includes("fetch")) {
    throw new AssistantNetworkError(
      "Cannot connect to Assistant Service. Is it running on port 8004?"
    );
  }
  throw new AssistantApiError(
    error instanceof Error ? error.message : "Unexpected assistant service error"
  );
}

/** Parse backend response and throw on non-OK status. */
async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || body.message || detail;
    } catch {
      // ignore parse errors on error responses
    }
    throw new AssistantApiError(detail, response.status);
  }
  return response.json() as Promise<T>;
}

// ─── Response Mappers (snake_case → camelCase) ───────────────────────────────

function mapBackendConversation(raw: BackendConversationResponse): Conversation {
  return {
    id: raw.id,
    title: raw.title,
    status: "active",
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
  };
}

function mapBackendMessage(raw: BackendMessageResponse): Message {
  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    role: raw.role as Message["role"],
    content: raw.content as MessageContentBlock[],
    status: "sent",
    createdAt: new Date(raw.created_at),
  };
}

// ─── SSE Stream Parser ──────────────────────────────────────────────────────

/**
 * Opens a fetch-based SSE connection to the streaming endpoint.
 * Yields ParsedSSEEvent objects for each server-sent event.
 */
export async function* streamSSE(
  conversationId: string,
  content: string,
  options?: RequestOptions,
): AsyncGenerator<ParsedSSEEvent, void, unknown> {
  const url = `${API_V1}/conversations/${conversationId}/messages/stream`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(options?.token),
      body: JSON.stringify({ role: "user", content }),
      signal: options?.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AssistantAbortError();
    }
    throw new AssistantNetworkError(
      "Cannot connect to Assistant Service for streaming"
    );
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || body.message || detail;
    } catch {
      // ignore parse errors
    }
    throw new AssistantApiError(detail, response.status);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new AssistantNetworkError("No readable stream in SSE response");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by double newlines
      const events = buffer.split("\n\n");
      // Keep the last (possibly incomplete) chunk in the buffer
      buffer = events.pop() ?? "";

      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue;

        let eventType = "";
        let dataStr = "";

        for (const line of eventBlock.split("\n")) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            dataStr = line.slice(6).trim();
          }
        }

        if (eventType && dataStr) {
          try {
            const data = JSON.parse(dataStr);
            yield { event: eventType, data };
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ─── Public API Client Methods ───────────────────────────────────────────────

/**
 * Fetch recent conversations.
 * Backend: GET /api/v1/conversations
 */
export async function getConversations(
  params?: { limit?: number; offset?: number },
  options?: RequestOptions,
): Promise<Conversation[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set("limit", String(params.limit));
    if (params?.offset) queryParams.set("offset", String(params.offset));

    const qs = queryParams.toString();
    const url = `${API_V1}/conversations${qs ? `?${qs}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(options?.token),
      signal: options?.signal,
    });

    const data = await parseResponse<BackendConversationListResponse>(response);
    return data.conversations.map(mapBackendConversation);
  } catch (error) {
    return handleServiceError(error);
  }
}

/**
 * Fetch a single conversation with its messages.
 * Backend: GET /api/v1/conversations/:id + GET /api/v1/conversations/:id/messages
 */
export async function getConversation(
  conversationId: string,
  options?: RequestOptions,
): Promise<ConversationWithMessages> {
  try {
    // Fetch conversation details and messages in parallel
    const [convResponse, msgsResponse] = await Promise.all([
      fetch(`${API_V1}/conversations/${conversationId}`, {
        method: "GET",
        headers: buildHeaders(options?.token),
        signal: options?.signal,
      }),
      fetch(`${API_V1}/conversations/${conversationId}/messages`, {
        method: "GET",
        headers: buildHeaders(options?.token),
        signal: options?.signal,
      }),
    ]);

    const convData = await parseResponse<BackendConversationResponse>(convResponse);
    const msgsData = await parseResponse<BackendMessageListResponse>(msgsResponse);

    const conversation = mapBackendConversation(convData);
    const messages = msgsData.messages.map(mapBackendMessage);

    return { ...conversation, messages };
  } catch (error) {
    return handleServiceError(error);
  }
}

/**
 * Create a new conversation.
 * Backend: POST /api/v1/conversations
 *
 * If `initialMessage` is provided, the first user message is sent via
 * the store's sendMessage flow (SSE streaming) after conversation creation.
 * This function only creates the conversation and returns the welcome state.
 */
export async function createConversation(
  request: CreateConversationRequest,
  options?: RequestOptions,
): Promise<CreateConversationResponse> {
  try {
    const title = request.initialMessage
      ? request.initialMessage.slice(0, 40) + (request.initialMessage.length > 40 ? "..." : "")
      : undefined;

    const response = await fetch(`${API_V1}/conversations`, {
      method: "POST",
      headers: buildHeaders(options?.token),
      body: JSON.stringify({ title }),
      signal: options?.signal,
    });

    const convData = await parseResponse<BackendConversationResponse>(response);
    const conversation = mapBackendConversation(convData);

    return {
      conversation,
      messages: [], // Messages will be populated via SSE streaming
    };
  } catch (error) {
    return handleServiceError(error);
  }
}

/**
 * Send a message within a conversation (non-streaming REST fallback).
 * Backend: POST /api/v1/conversations/:id/messages
 */
export async function sendMessage(
  request: SendMessageRequest,
  options?: RequestOptions,
): Promise<{ userMessage: Message; assistantMessage: Message }> {
  try {
    const response = await fetch(
      `${API_V1}/conversations/${request.conversationId}/messages`,
      {
        method: "POST",
        headers: buildHeaders(options?.token),
        body: JSON.stringify({ role: "user", content: request.content }),
        signal: options?.signal,
      },
    );

    const data = await parseResponse<BackendMessageResponse>(response);
    const assistantMessage = mapBackendMessage(data);

    // The backend returns only the assistant message; construct user message locally
    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversationId: request.conversationId,
      role: "user",
      status: "sent",
      content: [{ type: "text", text: request.content }],
      createdAt: new Date(),
    };

    return { userMessage, assistantMessage };
  } catch (error) {
    return handleServiceError(error);
  }
}

/**
 * Delete a conversation.
 * Backend: DELETE /api/v1/conversations/:id
 */
export async function deleteConversation(
  conversationId: string,
  options?: RequestOptions,
): Promise<void> {
  try {
    const response = await fetch(
      `${API_V1}/conversations/${conversationId}`,
      {
        method: "DELETE",
        headers: buildHeaders(options?.token),
        signal: options?.signal,
      },
    );

    if (!response.ok && response.status !== 204) {
      let detail = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        detail = body.detail || body.message || detail;
      } catch {
        // ignore
      }
      throw new AssistantApiError(detail, response.status);
    }
  } catch (error) {
    if (error instanceof AssistantApiError) throw error;
    return handleServiceError(error);
  }
}

/**
 * Fetch available quick actions.
 * These are defined client-side (no backend endpoint).
 */
export async function getQuickActions(
  options?: RequestOptions,
): Promise<QuickAction[]> {
  void options;
  return [
    {
      id: "find",
      label: "Find the right product",
      icon: "🔍",
      prompt: "Help me find the right product",
    },
    {
      id: "compare",
      label: "Compare products",
      icon: "⚖️",
      prompt: "I want to compare products",
    },
    {
      id: "budget",
      label: "Shop within my budget",
      icon: "💰",
      prompt: "Help me shop within my budget",
    },
    {
      id: "specs",
      label: "Explain specifications",
      icon: "📋",
      prompt: "Can you explain specifications for me?",
    },
    {
      id: "gifts",
      label: "Gift ideas",
      icon: "🎁",
      prompt: "I need gift ideas",
    },
  ];
}

/**
 * Health check — lightweight probe to see if the assistant microservice is reachable.
 * Falls back to the base URL root if /health doesn't exist (any 2xx/3xx = alive).
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(`${ASSISTANT_SERVICE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timerId);
    return response.ok || response.status === 404; // 404 means server is up but no /health route
  } catch {
    return false;
  }
}
