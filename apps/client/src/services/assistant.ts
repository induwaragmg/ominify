// ─── Assistant Service API Client ────────────────────────────────────────────
// Service client module abstracting HTTP API communication with the upcoming
// `assistant-service` microservice (defaulting to http://localhost:8004).
//
// All functions return typed Promises, throw typed errors (AssistantApiError,
// AssistantNetworkError, AssistantAbortError), and support AbortSignal cancellation.
// Currently returns temporary placeholder responses until the backend API is live.

import type {
  Conversation,
  ConversationWithMessages,
  CreateConversationRequest,
  CreateConversationResponse,
  GetConversationsParams,
  Message,
  QuickAction,
  RequestOptions,
  SendMessageRequest,
  SendMessageResponse,
} from "@/types/assistant";
import {
  AssistantAbortError,
  AssistantApiError,
  AssistantNetworkError,
} from "@/types/assistant";

// ─── Configuration ───────────────────────────────────────────────────────────

const ASSISTANT_SERVICE_URL =
  process.env.NEXT_PUBLIC_ASSISTANT_SERVICE_URL ?? "http://localhost:8004";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

/** Simulates network latency while respecting AbortSignal cancellation. */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new AssistantAbortError());
    }

    const timer = setTimeout(() => {
      resolve();
    }, ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new AssistantAbortError());
    });
  });
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
  throw new AssistantApiError(
    error instanceof Error ? error.message : "Unexpected assistant service error"
  );
}

// ─── Temporary Placeholder Generator ─────────────────────────────────────────

function buildPlaceholderReply(
  conversationId: string,
  userText: string
): Message {
  const lower = userText.toLowerCase();

  if (
    lower.includes("drill") ||
    lower.includes("find") ||
    lower.includes("product") ||
    lower.includes("recommend")
  ) {
    return {
      id: uid(),
      conversationId,
      role: "assistant",
      status: "sent",
      content: [
        {
          type: "text",
          text: "I found some top-rated recommendations based on your needs:",
        },
        {
          type: "product_recommendations",
          products: [
            {
              id: 1,
              name: "DeWalt 20V MAX Cordless Drill",
              price: 9999,
              shortDescription:
                "Compact, lightweight drill driver with LED light and 2-speed transmission.",
              description: "High performance cordless drill.",
              images: { Yellow: "/products/1g.png" },
              sizes: ["Standard"],
              colors: ["Yellow"],
              categorySlug: "tools",
              createdAt: new Date(),
              updatedAt: new Date(),
              rating: 4.8,
              reviewCount: 2341,
            },
            {
              id: 2,
              name: "Bosch Professional Impact Drill",
              price: 12999,
              shortDescription:
                "Heavy-duty impact drill with 800W motor and auxiliary handle.",
              description: "Professional grade impact driver.",
              images: { Blue: "/products/2w.png" },
              sizes: ["Standard"],
              colors: ["Blue"],
              categorySlug: "tools",
              createdAt: new Date(),
              updatedAt: new Date(),
              rating: 4.6,
              reviewCount: 1892,
            },
          ],
        },
      ],
      createdAt: new Date(),
    };
  }

  if (lower.includes("budget") || lower.includes("cheap") || lower.includes("under")) {
    return {
      id: uid(),
      conversationId,
      role: "assistant",
      status: "sent",
      content: [
        {
          type: "text",
          text: "I can help you filter products by price range! What is your budget ceiling and target category?",
        },
      ],
      createdAt: new Date(),
    };
  }

  if (lower.includes("compare")) {
    return {
      id: uid(),
      conversationId,
      role: "assistant",
      status: "sent",
      content: [
        {
          type: "text",
          text: "Which products would you like to compare side-by-side?",
        },
      ],
      createdAt: new Date(),
    };
  }

  return {
    id: uid(),
    conversationId,
    role: "assistant",
    status: "sent",
    content: [
      {
        type: "text",
        text: "I am your Ominify AI Shopping Assistant. How can I assist your product search or order today?",
      },
    ],
    createdAt: new Date(),
  };
}

// ─── Public API Client Methods ───────────────────────────────────────────────

/**
 * Fetch recent conversations.
 * Backend contract: GET /conversations
 */
export async function getConversations(
  params?: GetConversationsParams,
  options?: RequestOptions
): Promise<Conversation[]> {
  void ASSISTANT_SERVICE_URL;
  void params;

  try {
    await delay(300, options?.signal);

    return [
      {
        id: "conv-1",
        title: "Buying a Drill",
        status: "active",
        createdAt: new Date(Date.now() - 86_400_000),
        updatedAt: new Date(Date.now() - 86_400_000),
      },
      {
        id: "conv-2",
        title: "Running Shoes",
        status: "active",
        createdAt: new Date(Date.now() - 172_800_000),
        updatedAt: new Date(Date.now() - 172_800_000),
      },
    ];
  } catch (error) {
    return handleServiceError(error);
  }
}

/**
 * Fetch a single conversation with messages.
 * Backend contract: GET /conversations/:id
 */
export async function getConversation(
  conversationId: string,
  options?: RequestOptions
): Promise<ConversationWithMessages> {
  void ASSISTANT_SERVICE_URL;

  try {
    await delay(400, options?.signal);

    return {
      id: conversationId,
      title: conversationId === "conv-1" ? "Buying a Drill" : "Product Inquiry",
      status: "active",
      createdAt: new Date(Date.now() - 86_400_000),
      updatedAt: new Date(),
      messages: [
        {
          id: uid(),
          conversationId,
          role: "assistant",
          status: "sent",
          content: [
            {
              type: "text",
              text: "Hello! 👋 How can I help you find the right items today?",
            },
          ],
          createdAt: new Date(Date.now() - 86_400_000),
        },
      ],
    };
  } catch (error) {
    return handleServiceError(error);
  }
}

/**
 * Create a new conversation.
 * Backend contract: POST /conversations
 */
export async function createConversation(
  request: CreateConversationRequest,
  options?: RequestOptions
): Promise<CreateConversationResponse> {
  void ASSISTANT_SERVICE_URL;

  try {
    await delay(450, options?.signal);

    const conversationId = uid();
    const messages: Message[] = [
      {
        id: uid(),
        conversationId,
        role: "assistant",
        status: "sent",
        content: [
          {
            type: "text",
            text: "Hello! 👋 How can I assist you with your shopping today?",
          },
        ],
        createdAt: new Date(),
      },
    ];

    if (request.initialMessage) {
      messages.push({
        id: uid(),
        conversationId,
        role: "user",
        status: "sent",
        content: [{ type: "text", text: request.initialMessage }],
        createdAt: new Date(),
      });

      const assistantReply = buildPlaceholderReply(
        conversationId,
        request.initialMessage
      );
      messages.push(assistantReply);
    }

    return {
      conversation: {
        id: conversationId,
        title: request.initialMessage?.slice(0, 40) || "New Chat",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      messages,
    };
  } catch (error) {
    return handleServiceError(error);
  }
}

/**
 * Send a message within a conversation.
 * Backend contract: POST /conversations/:id/messages
 */
export async function sendMessage(
  request: SendMessageRequest,
  options?: RequestOptions
): Promise<SendMessageResponse> {
  void ASSISTANT_SERVICE_URL;

  try {
    const userMessage: Message = {
      id: uid(),
      conversationId: request.conversationId,
      role: "user",
      status: "sent",
      content: [{ type: "text", text: request.content }],
      createdAt: new Date(),
    };

    await delay(600, options?.signal);

    const assistantMessage = buildPlaceholderReply(
      request.conversationId,
      request.content
    );

    return { userMessage, assistantMessage };
  } catch (error) {
    return handleServiceError(error);
  }
}

/**
 * Delete a conversation.
 * Backend contract: DELETE /conversations/:id
 */
export async function deleteConversation(
  conversationId: string,
  options?: RequestOptions
): Promise<void> {
  void ASSISTANT_SERVICE_URL;

  try {
    await delay(200, options?.signal);
  } catch (error) {
    return handleServiceError(error);
  }
}

/**
 * Fetch available quick actions.
 * Backend contract: GET /quick-actions
 */
export async function getQuickActions(
  options?: RequestOptions
): Promise<QuickAction[]> {
  try {
    await delay(150, options?.signal);

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
  } catch (error) {
    return handleServiceError(error);
  }
}
