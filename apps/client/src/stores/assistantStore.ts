"use client";

import type {
  AssistantError,
  Conversation,
  ConversationWithMessages,
  Message,
  QuickAction,
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
// and request cancellation. Completely decoupled from UI visibility/layout.

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
}

interface AssistantActions {
  fetchConversations: () => Promise<void>;
  fetchQuickActions: () => Promise<void>;
  openConversation: (conversationId: string) => Promise<void>;
  createConversation: (initialMessage?: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
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

    // ── Actions ──────────────────────────────────────────────────────────────

    fetchConversations: async () => {
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
          { signal: controller.signal }
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

    openConversation: async (conversationId) => {
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
          { signal: controller.signal }
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

    createConversation: async (initialMessage) => {
      const controller = new AbortController();
      set({
        isLoadingMessages: true,
        status: "loading",
        error: null,
        activeAbortController: controller,
      });

      try {
        const { conversation, messages } =
          await assistantService.createConversation(
            { initialMessage },
            { signal: controller.signal }
          );

        set((s) => ({
          activeConversation: { ...conversation, messages },
          conversations: [conversation, ...s.conversations],
          isLoadingMessages: false,
          status: "idle",
          activeAbortController: null,
        }));
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

    sendMessage: async (content) => {
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
        status: "sending",
        error: null,
        activeAbortController: controller,
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
        const { assistantMessage } = await assistantService.sendMessage(
          {
            conversationId: activeConversation.id,
            content,
          },
          { signal: controller.signal }
        );

        set((s) => ({
          isSending: false,
          status: "idle",
          activeAbortController: null,
          activeConversation: s.activeConversation
            ? {
                ...s.activeConversation,
                messages: [
                  ...s.activeConversation.messages.map((m) =>
                    m.id === optimisticUserMsg.id
                      ? { ...m, status: "sent" as const }
                      : m
                  ),
                  assistantMessage,
                ],
              }
            : null,
        }));
      } catch (e) {
        if (e instanceof AssistantAbortError) {
          set({ isSending: false, status: "idle", activeAbortController: null });
          return;
        }
        set({
          isSending: false,
          status: "error",
          error: e instanceof Error ? e : new Error(String(e)),
          activeAbortController: null,
        });
      }
    },

    deleteConversation: async (conversationId) => {
      try {
        await assistantService.deleteConversation(conversationId);
        set((s) => ({
          conversations: s.conversations.filter(
            (c) => c.id !== conversationId
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
        });
      }
    },

    goBackToWelcome: () => set({ activeConversation: null, error: null }),

    clearError: () => set({ error: null, status: "idle" }),
  })
);

export default useAssistantStore;
