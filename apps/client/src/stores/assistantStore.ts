"use client";

import type {
  AssistantError,
  Conversation,
  ConversationWithMessages,
  Message,
  MessageContentBlock,
  QuickAction,
  StreamingPhase,
  SSECompletedEvent,
  SSELLMChunkEvent,
  SSEToolStartEvent,
} from "@/types/assistant";
import { AssistantAbortError } from "@/types/assistant";
import * as assistantService from "@/services/assistant";
import { create } from "zustand";

// ─── Assistant Request Lifecycle Status ──────────────────────────────────────

export type RequestLifecycleStatus =
  | "idle"
  | "loading"
  | "sending"
  | "streaming"
  | "error";

// ─── Assistant State Shape ───────────────────────────────────────────────────
// Dedicated store managing conversation data, message history, network status,
// SSE streaming state, and request cancellation.

interface AssistantState {
  conversations: Conversation[];
  activeConversation: ConversationWithMessages | null;
  quickActions: QuickAction[];
  status: RequestLifecycleStatus;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: AssistantError | null;
  activeAbortController: AbortController | null;

  // SSE streaming state
  streamingPhase: StreamingPhase;
  streamingText: string;
  streamingTools: string[];
  streamingToolCount: number;
}

interface AssistantActions {
  fetchConversations: (token?: string | null) => Promise<void>;
  fetchQuickActions: () => Promise<void>;
  openConversation: (conversationId: string, token?: string | null) => Promise<void>;
  createConversation: (initialMessage?: string, token?: string | null) => Promise<void>;
  sendMessage: (content: string, token?: string | null) => Promise<void>;
  deleteConversation: (conversationId: string, token?: string | null) => Promise<void>;
  cancelActiveRequest: () => void;
  goBackToWelcome: () => void;
  clearError: () => void;
}

export const useAssistantStore = create<AssistantState & AssistantActions>()(
  (set, get) => ({
    // ── Initial State ────────────────────────────────────────────────────────
    conversations: [],
    activeConversation: null,
    quickActions: [],
    status: "idle",
    isLoadingConversations: false,
    isLoadingMessages: false,
    isSending: false,
    error: null,
    activeAbortController: null,

    // SSE streaming state
    streamingPhase: "idle",
    streamingText: "",
    streamingTools: [],
    streamingToolCount: 0,

    // ── Actions ──────────────────────────────────────────────────────────────

    fetchConversations: async (token) => {
      const controller = new AbortController();
      set({
        isLoadingConversations: true,
        status: "loading",
        error: null,
        activeAbortController: controller,
      });

      try {
        const conversations = await assistantService.getConversations(
          undefined,
          { signal: controller.signal, token },
        );
        set({
          conversations,
          isLoadingConversations: false,
          status: "idle",
          activeAbortController: null,
        });
      } catch (e) {
        if (e instanceof AssistantAbortError) {
          set({ isLoadingConversations: false, status: "idle", activeAbortController: null });
          return;
        }
        set({
          error: e instanceof Error ? e : new Error(String(e)),
          isLoadingConversations: false,
          status: "error",
          activeAbortController: null,
        });
      }
    },

    fetchQuickActions: async () => {
      try {
        const quickActions = await assistantService.getQuickActions();
        set({ quickActions });
      } catch {
        // Quick actions are non-critical
      }
    },

    openConversation: async (conversationId, token) => {
      const controller = new AbortController();
      set({
        isLoadingMessages: true,
        status: "loading",
        error: null,
        activeAbortController: controller,
      });

      try {
        const conversation = await assistantService.getConversation(
          conversationId,
          { signal: controller.signal, token },
        );
        set({
          activeConversation: conversation,
          isLoadingMessages: false,
          status: "idle",
          activeAbortController: null,
        });
      } catch (e) {
        if (e instanceof AssistantAbortError) {
          set({ isLoadingMessages: false, status: "idle", activeAbortController: null });
          return;
        }
        set({
          error: e instanceof Error ? e : new Error(String(e)),
          isLoadingMessages: false,
          status: "error",
          activeAbortController: null,
        });
      }
    },

    createConversation: async (initialMessage, token) => {
      const controller = new AbortController();
      set({
        isLoadingMessages: true,
        status: "loading",
        error: null,
        activeAbortController: controller,
      });

      try {
        const { conversation } =
          await assistantService.createConversation(
            { initialMessage },
            { signal: controller.signal, token },
          );

        set((s) => ({
          activeConversation: { ...conversation, messages: [] },
          conversations: [conversation, ...s.conversations],
          isLoadingMessages: false,
          status: "idle",
          activeAbortController: null,
        }));

        // If there's an initial message, send it via SSE streaming
        if (initialMessage) {
          await get().sendMessage(initialMessage, token);
        }
      } catch (e) {
        if (e instanceof AssistantAbortError) {
          set({ isLoadingMessages: false, status: "idle", activeAbortController: null });
          return;
        }
        set({
          error: e instanceof Error ? e : new Error(String(e)),
          isLoadingMessages: false,
          status: "error",
          activeAbortController: null,
        });
      }
    },

    sendMessage: async (content, token) => {
      const { activeConversation } = get();
      if (!activeConversation) return;

      const controller = new AbortController();

      // Optimistically add the user message with "sending" status
      const optimisticUserMsg: Message = {
        id: crypto.randomUUID(),
        conversationId: activeConversation.id,
        role: "user",
        status: "sending",
        content: [{ type: "text", text: content }],
        createdAt: new Date(),
      };

      set((s) => ({
        isSending: true,
        status: "streaming",
        error: null,
        activeAbortController: controller,
        streamingPhase: "thinking",
        streamingText: "",
        streamingTools: [],
        streamingToolCount: 0,
        activeConversation: s.activeConversation
          ? {
              ...s.activeConversation,
              messages: [
                ...s.activeConversation.messages,
                optimisticUserMsg,
              ],
            }
          : null,
      }));

      try {
        // Mark user message as sent
        set((s) => ({
          activeConversation: s.activeConversation
            ? {
                ...s.activeConversation,
                messages: s.activeConversation.messages.map((m) =>
                  m.id === optimisticUserMsg.id
                    ? { ...m, status: "sent" as const }
                    : m,
                ),
              }
            : null,
        }));

        // Stream SSE events from the backend
        const stream = assistantService.streamSSE(
          activeConversation.id,
          content,
          { signal: controller.signal, token },
        );

        for await (const sseEvent of stream) {
          const { event, data } = sseEvent;

          switch (event) {
            case "thinking":
              set({ streamingPhase: "thinking" });
              break;

            case "planning":
              set({ streamingPhase: "planning" });
              break;

            case "tool_start": {
              const toolData = data as SSEToolStartEvent;
              set({
                streamingPhase: "tool_execution",
                streamingTools: toolData.tools || [],
              });
              break;
            }

            case "tool_finished": {
              set({ streamingPhase: "tool_execution" });
              break;
            }

            case "reasoning":
              set({ streamingPhase: "reasoning" });
              break;

            case "llm_chunk": {
              const chunkData = data as SSELLMChunkEvent;
              set((s) => ({
                streamingPhase: "streaming",
                streamingText: s.streamingText + (chunkData.delta || ""),
              }));
              break;
            }

            case "completed": {
              const completedData = data as SSECompletedEvent;
              const contentBlocks: MessageContentBlock[] =
                completedData.content_blocks || [
                  { type: "text", text: completedData.text || "" },
                ];

              const assistantMessage: Message = {
                id: crypto.randomUUID(),
                conversationId: activeConversation.id,
                role: "assistant",
                status: "sent",
                content: contentBlocks,
                createdAt: new Date(),
              };

              set((s) => ({
                isSending: false,
                status: "idle",
                activeAbortController: null,
                streamingPhase: "idle",
                streamingText: "",
                streamingTools: [],
                streamingToolCount: 0,
                activeConversation: s.activeConversation
                  ? {
                      ...s.activeConversation,
                      messages: [
                        ...s.activeConversation.messages,
                        assistantMessage,
                      ],
                    }
                  : null,
              }));
              break;
            }
          }
        }
      } catch (e) {
        if (e instanceof AssistantAbortError) {
          // Finalize any partial streamed text on cancel
          const partialText = get().streamingText;
          if (partialText) {
            const partialMessage: Message = {
              id: crypto.randomUUID(),
              conversationId: activeConversation.id,
              role: "assistant",
              status: "sent",
              content: [{ type: "text", text: partialText }],
              createdAt: new Date(),
            };
            set((s) => ({
              isSending: false,
              status: "idle",
              activeAbortController: null,
              streamingPhase: "idle",
              streamingText: "",
              streamingTools: [],
              activeConversation: s.activeConversation
                ? {
                    ...s.activeConversation,
                    messages: [...s.activeConversation.messages, partialMessage],
                  }
                : null,
            }));
          } else {
            set({
              isSending: false,
              status: "idle",
              activeAbortController: null,
              streamingPhase: "idle",
              streamingText: "",
              streamingTools: [],
            });
          }
          return;
        }
        set({
          isSending: false,
          status: "error",
          error: e instanceof Error ? e : new Error(String(e)),
          activeAbortController: null,
          streamingPhase: "idle",
          streamingText: "",
          streamingTools: [],
        });
      }
    },

    deleteConversation: async (conversationId, token) => {
      try {
        await assistantService.deleteConversation(conversationId, { token });
        set((s) => ({
          conversations: s.conversations.filter(
            (c) => c.id !== conversationId,
          ),
          activeConversation:
            s.activeConversation?.id === conversationId
              ? null
              : s.activeConversation,
        }));
      } catch (e) {
        set({
          error: e instanceof Error ? e : new Error(String(e)),
          status: "error",
        });
      }
    },

    cancelActiveRequest: () => {
      const { activeAbortController } = get();
      if (activeAbortController) {
        activeAbortController.abort();
        set({
          activeAbortController: null,
          isSending: false,
          isLoadingMessages: false,
          isLoadingConversations: false,
          status: "idle",
          streamingPhase: "idle",
        });
      }
    },

    goBackToWelcome: () => set({ activeConversation: null, error: null }),

    clearError: () => set({ error: null, status: "idle" }),
  }),
);

export default useAssistantStore;
