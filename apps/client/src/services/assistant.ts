// ─── Assistant Service Layer ─────────────────────────────────────────────────
// Frontend service module that abstracts communication with the assistant
// backend. Currently returns placeholder/demo data so the UI is fully
// functional. When the real `assistant-service` microservice is deployed,
// replace the function bodies with `fetch()` calls — the signatures and
// return types stay identical.
//
// All functions are async to match real network behaviour. The UI already
// handles loading / error / streaming states around these calls.

import type {
  Conversation,
  ConversationWithMessages,
  CreateConversationRequest,
  CreateConversationResponse,
  Message,
  QuickAction,
  SendMessageRequest,
  SendMessageResponse,
} from "@/types/assistant";

// ─── Configuration ───────────────────────────────────────────────────────────

const ASSISTANT_SERVICE_URL =
  process.env.NEXT_PUBLIC_ASSISTANT_SERVICE_URL ?? "http://localhost:8004";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

/** Simulates network latency during the placeholder phase. */
function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Placeholder Responses ───────────────────────────────────────────────────
// These simulate what the real service would return. They exist solely so
// the UI can be demonstrated end-to-end before the backend is ready.

const PLACEHOLDER_REPLIES: Record<string, Message> = {};

function buildPlaceholderReply(
  conversationId: string,
  userText: string
): Message {
  const lower = userText.toLowerCase();

  // Product recommendation demo
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
      content: [
        {
          type: "text",
          text: "I found some great options for you! Here are my top picks based on your needs:",
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
              images: { Yellow: "/products/1g.png" },
              sizes: ["Standard"],
              colors: ["Yellow"],
              rating: 4.8,
              reviewCount: 2341,
            },
            {
              id: 2,
              name: "Bosch Professional Impact Drill",
              price: 12999,
              shortDescription:
                "Heavy-duty impact drill with 800W motor and auxiliary handle.",
              images: { Blue: "/products/2w.png" },
              sizes: ["Standard"],
              colors: ["Blue"],
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
      content: [
        {
          type: "text",
          text: "I'd be happy to help you shop within your budget! What's your price range, and what type of product are you looking for? I'll find the best value options for you.",
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
      content: [
        {
          type: "text",
          text: "Sure! Tell me which products you'd like to compare, or share a category and I'll pull up the top contenders with a side-by-side breakdown of features, specs, and pricing.",
        },
      ],
      createdAt: new Date(),
    };
  }

  if (lower.includes("gift")) {
    return {
      id: uid(),
      conversationId,
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Great choice! Who are you shopping for? Tell me a bit about them — their interests, age, and your budget — and I'll curate a personalized gift list.",
        },
      ],
      createdAt: new Date(),
    };
  }

  if (lower.includes("spec") || lower.includes("explain")) {
    return {
      id: uid(),
      conversationId,
      role: "assistant",
      content: [
        {
          type: "text",
          text: "I can help decode product specifications! Share a product name or link, and I'll break down the technical details in plain language so you can make an informed decision.",
        },
      ],
      createdAt: new Date(),
    };
  }

  // Default fallback
  return {
    id: uid(),
    conversationId,
    role: "assistant",
    content: [
      {
        type: "text",
        text: "Thanks for reaching out! I'm your Ominify shopping assistant. I can help you find products, compare options, shop within a budget, explain specifications, or suggest gift ideas. What would you like to do?",
      },
    ],
    createdAt: new Date(),
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch the list of recent conversations for the current user.
 *
 * TODO: Replace with `GET ${ASSISTANT_SERVICE_URL}/conversations`
 */
export async function getConversations(): Promise<Conversation[]> {
  void ASSISTANT_SERVICE_URL; // reference to suppress lint
  await delay(300);

  return [
    {
      id: "demo-1",
      title: "Buying a Drill",
      status: "active",
      createdAt: new Date(Date.now() - 86_400_000),
      updatedAt: new Date(Date.now() - 86_400_000),
    },
    {
      id: "demo-2",
      title: "Running Shoes",
      status: "active",
      createdAt: new Date(Date.now() - 172_800_000),
      updatedAt: new Date(Date.now() - 172_800_000),
    },
    {
      id: "demo-3",
      title: "Gift Ideas",
      status: "active",
      createdAt: new Date(Date.now() - 259_200_000),
      updatedAt: new Date(Date.now() - 259_200_000),
    },
  ];
}

/**
 * Fetch a single conversation with all its messages.
 *
 * TODO: Replace with `GET ${ASSISTANT_SERVICE_URL}/conversations/:id`
 */
export async function getConversation(
  conversationId: string
): Promise<ConversationWithMessages> {
  void ASSISTANT_SERVICE_URL;
  await delay(400);

  return {
    id: conversationId,
    title:
      conversationId === "demo-1"
        ? "Buying a Drill"
        : conversationId === "demo-2"
          ? "Running Shoes"
          : "Gift Ideas",
    status: "active",
    createdAt: new Date(Date.now() - 86_400_000),
    updatedAt: new Date(),
    messages: [
      {
        id: uid(),
        conversationId,
        role: "assistant",
        content: [
          {
            type: "text",
            text: "Hi there! 👋 I'm your Ominify assistant. How can I help you today?",
          },
        ],
        createdAt: new Date(Date.now() - 86_400_000),
      },
    ],
  };
}

/**
 * Create a new conversation, optionally with an initial user message.
 *
 * TODO: Replace with `POST ${ASSISTANT_SERVICE_URL}/conversations`
 */
export async function createConversation(
  request: CreateConversationRequest
): Promise<CreateConversationResponse> {
  void ASSISTANT_SERVICE_URL;
  await delay(500);

  const conversationId = uid();
  const messages: Message[] = [];

  // Assistant greeting
  messages.push({
    id: uid(),
    conversationId,
    role: "assistant",
    content: [
      {
        type: "text",
        text: "Hi there! 👋 I'm your Ominify assistant. How can I help you today?",
      },
    ],
    createdAt: new Date(),
  });

  // If an initial message was provided, include user + assistant reply
  if (request.initialMessage) {
    const userMsg: Message = {
      id: uid(),
      conversationId,
      role: "user",
      content: [{ type: "text", text: request.initialMessage }],
      createdAt: new Date(),
    };
    messages.push(userMsg);

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
}

/**
 * Send a message within an existing conversation and receive the
 * assistant's reply.
 *
 * TODO: Replace with `POST ${ASSISTANT_SERVICE_URL}/conversations/:id/messages`
 */
export async function sendMessage(
  request: SendMessageRequest
): Promise<SendMessageResponse> {
  void ASSISTANT_SERVICE_URL;

  const userMessage: Message = {
    id: uid(),
    conversationId: request.conversationId,
    role: "user",
    content: [{ type: "text", text: request.content }],
    createdAt: new Date(),
  };

  // Simulate assistant "thinking" time
  await delay(800 + Math.random() * 800);

  const assistantMessage = buildPlaceholderReply(
    request.conversationId,
    request.content
  );

  return { userMessage, assistantMessage };
}

/**
 * Delete a conversation.
 *
 * TODO: Replace with `DELETE ${ASSISTANT_SERVICE_URL}/conversations/:id`
 */
export async function deleteConversation(
  conversationId: string
): Promise<void> {
  void ASSISTANT_SERVICE_URL;
  void conversationId;
  await delay(200);
}

/**
 * Get the list of quick-action prompts displayed on the welcome screen.
 *
 * TODO: Replace with `GET ${ASSISTANT_SERVICE_URL}/quick-actions`
 *       or keep client-side if these are static.
 */
export async function getQuickActions(): Promise<QuickAction[]> {
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
