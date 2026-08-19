// ─── Assistant Domain Models & API Contracts ────────────────────────────────
// Production-ready, extensible domain models for the AI Shopping Assistant.
// Designed to align with the `assistant-service` microservice
// without requiring frontend refactoring when backend capability expands.

import type { ProductType } from "@repo/types";

// ─── Role & Status Enums ──────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system" | "tool";

export type MessageStatus =
  | "pending"
  | "sending"
  | "sent"
  | "streaming"
  | "error";

export type ConversationStatus = "active" | "archived" | "pinned";

// ─── Extensible Message Content Blocks ───────────────────────────────────────
// Uses a discriminated union (`type` field) so new block types (citations,
// tool results, attachments) can be added without breaking existing components.

export type TextContentBlock = {
  type: "text";
  text: string;
};

export type ProductRecommendationsContentBlock = {
  type: "product_recommendations";
  products: AssistantProduct[];
};

export type ToolCallContentBlock = {
  type: "tool_call";
  toolName: string;
  args: Record<string, unknown>;
};

export type ToolResultContentBlock = {
  type: "tool_result";
  toolName: string;
  result: unknown;
};

export type CitationContentBlock = {
  type: "citation";
  title: string;
  url?: string;
  snippet?: string;
};

export type AttachmentContentBlock = {
  type: "attachment";
  name: string;
  url: string;
  mimeType: string;
};

export type FollowUpSuggestionsContentBlock = {
  type: "follow_up_suggestions";
  suggestions: string[];
};

export type MessageContentBlock =
  | TextContentBlock
  | ProductRecommendationsContentBlock
  | ToolCallContentBlock
  | ToolResultContentBlock
  | CitationContentBlock
  | AttachmentContentBlock
  | FollowUpSuggestionsContentBlock;

// ─── Product Model (Extends `@repo/types`) ────────────────────────────────────

/**
 * Extends core `@repo/types` `ProductType` rather than duplicating domain models.
 * Adds optional AI enrichment metrics (e.g., computed rating, review count).
 */
export interface AssistantProduct extends ProductType {
  rating?: number;
  reviewCount?: number;
}

// ─── Message Model ───────────────────────────────────────────────────────────

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: MessageContentBlock[];
  createdAt: Date;
  status?: MessageStatus;
  metadata?: Record<string, unknown>;
}

// ─── Conversation Models ─────────────────────────────────────────────────────

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

export interface PaginatedConversations {
  conversations: Conversation[];
  hasMore: boolean;
  nextCursor?: string;
}

// ─── Quick Action Model ──────────────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

// ─── API Request Options & Signals ───────────────────────────────────────────

export interface RequestOptions {
  signal?: AbortSignal;
  token?: string | null;
}

// ─── Service Request & Response Contracts ────────────────────────────────────
// Aligned with HTTP endpoints on `assistant-service` (Port :8004)

export interface GetConversationsParams {
  cursor?: string;
  limit?: number;
}

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
  messages: Message[];
}

// ─── Backend API Response Shapes (snake_case mapping) ────────────────────────

export interface BackendConversationResponse {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface BackendMessageResponse {
  id: string;
  conversation_id: string;
  role: string;
  content: MessageContentBlock[];
  created_at: string;
}

export interface BackendConversationListResponse {
  conversations: BackendConversationResponse[];
  total: number;
}

export interface BackendMessageListResponse {
  messages: BackendMessageResponse[];
  total: number;
}

// ─── SSE Event Types ─────────────────────────────────────────────────────────

export type StreamingPhase =
  | "idle"
  | "thinking"
  | "planning"
  | "tool_execution"
  | "reasoning"
  | "streaming"
  | "completed";

export interface SSEThinkingEvent {
  status: string;
  conversation_id: string;
}

export interface SSEPlanningEvent {
  intent: string;
  confidence: number;
  needs_clarification: boolean;
  reasoning: string;
}

export interface SSEToolStartEvent {
  tools: string[];
}

export interface SSEToolFinishedEvent {
  count: number;
}

export interface SSEReasoningEvent {
  status: string;
}

export interface SSELLMChunkEvent {
  delta: string;
}

export interface SSECompletedEvent {
  text: string;
  content_blocks: MessageContentBlock[];
}

export type SSEEventData =
  | SSEThinkingEvent
  | SSEPlanningEvent
  | SSEToolStartEvent
  | SSEToolFinishedEvent
  | SSEReasoningEvent
  | SSELLMChunkEvent
  | SSECompletedEvent;

export interface ParsedSSEEvent {
  event: string;
  data: SSEEventData;
}

// ─── Typed Frontend Errors ───────────────────────────────────────────────────

export class AssistantApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AssistantApiError";
  }
}

export class AssistantNetworkError extends Error {
  constructor(message: string = "Network error connecting to Assistant Service") {
    super(message);
    this.name = "AssistantNetworkError";
  }
}

export class AssistantAbortError extends Error {
  constructor(message: string = "Assistant request was cancelled") {
    super(message);
    this.name = "AssistantAbortError";
  }
}

export type AssistantError =
  | AssistantApiError
  | AssistantNetworkError
  | AssistantAbortError
  | Error;
