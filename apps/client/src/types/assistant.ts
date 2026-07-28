// ─── Assistant Domain Models ─────────────────────────────────────────────────
// Strongly typed interfaces for the AI Shopping Assistant feature.
// These models define the contract between the frontend UI and the
// assistant-service backend. When the real microservice is built, only
// `services/assistant.ts` needs to change — the UI consumes these types as-is.

import type { ProductType } from "@repo/types";

// ─── Message Types ───────────────────────────────────────────────────────────

/** Identifies who authored a message. */
export type MessageRole = "user" | "assistant";

/** Discriminated content blocks that a message can contain. */
export type MessageContentBlock =
  | { type: "text"; text: string }
  | { type: "product_recommendations"; products: AssistantProduct[] };

/**
 * A product surfaced by the assistant in a recommendation.
 * Mirrors the core `ProductType` fields the UI needs, plus an optional
 * rating that the assistant service may compute.
 */
export interface AssistantProduct {
  id: number;
  name: string;
  price: number;
  shortDescription: string;
  images: Record<string, string>;
  sizes: string[];
  colors: string[];
  rating?: number;       // 0–5, optional — assistant may enrich
  reviewCount?: number;  // optional
}

/** Converts a store `ProductType` to an `AssistantProduct`. */
export function toAssistantProduct(p: ProductType): AssistantProduct {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    shortDescription: p.shortDescription,
    images: p.images as Record<string, string>,
    sizes: p.sizes,
    colors: p.colors,
  };
}

/** A single message within a conversation. */
export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: MessageContentBlock[];
  createdAt: Date;
}

// ─── Conversation Types ──────────────────────────────────────────────────────

export type ConversationStatus = "active" | "archived";

/** A conversation (chat thread) between the user and the assistant. */
export interface Conversation {
  id: string;
  title: string;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** Conversation with its messages fully loaded. */
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// ─── Quick Action Types ──────────────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  icon: string;  // emoji or lucide icon name
  prompt: string; // the message to send when clicked
}

// ─── Service Request / Response Shapes ───────────────────────────────────────

export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

export interface CreateConversationRequest {
  initialMessage?: string;
}

export interface CreateConversationResponse {
  conversation: Conversation;
  messages: Message[]; // may include an initial assistant greeting
}
