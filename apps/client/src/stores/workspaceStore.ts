"use client";

import type {
  Conversation,
  ConversationWithMessages,
  Message,
  QuickAction,
} from "@/types/assistant";
import * as assistantService from "@/services/assistant";
import { create } from "zustand";

// ─── State Shape ─────────────────────────────────────────────────────────────

interface WorkspaceState {
  // ── Assistant Visibility & Layout ────────────────────────────────────────
  isAssistantOpen: boolean;
  isMobileOpen: boolean;
  assistantWidth: number; // px, desktop only

  // ── Assistant Conversation State ─────────────────────────────────────────
  conversations: Conversation[];
  activeConversation: ConversationWithMessages | null;
  quickActions: QuickAction[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
}

interface WorkspaceActions {
  // ── Visibility ───────────────────────────────────────────────────────────
  toggleAssistant: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  closeMobile: () => void;
  setAssistantWidth: (width: number) => void;

  // ── Conversation Actions ─────────────────────────────────────────────────
  fetchConversations: () => Promise<void>;
  fetchQuickActions: () => Promise<void>;
  openConversation: (conversationId: string) => Promise<void>;
  createConversation: (initialMessage?: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  goBackToWelcome: () => void;
  clearError: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  (set, get) => ({
    // ── Initial State ────────────────────────────────────────────────────────
    isAssistantOpen: false,
    isMobileOpen: false,
    assistantWidth: 380,
    conversations: [],
    activeConversation: null,
    quickActions: [],
    isLoadingConversations: false,
    isLoadingMessages: false,
    isSending: false,
    error: null,

    // ── Visibility Actions ───────────────────────────────────────────────────
    toggleAssistant: () =>
      set((s) => {
        const next = !(s.isAssistantOpen || s.isMobileOpen);
        return {
          isAssistantOpen: next,
          isMobileOpen: next,
        };
      }),

    openAssistant: () =>
      set({ isAssistantOpen: true, isMobileOpen: true }),

    closeAssistant: () =>
      set({ isAssistantOpen: false, isMobileOpen: false }),

    closeMobile: () =>
      set({ isAssistantOpen: false, isMobileOpen: false }),

    setAssistantWidth: (width) => set({ assistantWidth: width }),

    // ── Conversation Actions ─────────────────────────────────────────────────

    fetchConversations: async () => {
      set({ isLoadingConversations: true, error: null });
      try {
        const conversations = await assistantService.getConversations();
        set({ conversations, isLoadingConversations: false });
      } catch (e) {
        set({
          error:
            e instanceof Error ? e.message : "Failed to load conversations",
          isLoadingConversations: false,
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
      set({ isLoadingMessages: true, error: null });
      try {
        const conversation =
          await assistantService.getConversation(conversationId);
        set({ activeConversation: conversation, isLoadingMessages: false });
      } catch (e) {
        set({
          error:
            e instanceof Error ? e.message : "Failed to load conversation",
          isLoadingMessages: false,
        });
      }
    },

    createConversation: async (initialMessage) => {
      set({ isLoadingMessages: true, error: null });
      try {
        const { conversation, messages } =
          await assistantService.createConversation({ initialMessage });
        set((s) => ({
          activeConversation: { ...conversation, messages },
          conversations: [conversation, ...s.conversations],
          isLoadingMessages: false,
        }));
      } catch (e) {
        set({
          error:
            e instanceof Error
              ? e.message
              : "Failed to create conversation",
          isLoadingMessages: false,
        });
      }
    },

    sendMessage: async (content) => {
      const { activeConversation } = get();
      if (!activeConversation) return;

      // Optimistically add the user message
      const optimisticUserMsg: Message = {
        id: crypto.randomUUID(),
        conversationId: activeConversation.id,
        role: "user",
        content: [{ type: "text", text: content }],
        createdAt: new Date(),
      };

      set((s) => ({
        isSending: true,
        error: null,
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
        const { assistantMessage } = await assistantService.sendMessage({
          conversationId: activeConversation.id,
          content,
        });

        set((s) => ({
          isSending: false,
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
      } catch (e) {
        set({
          isSending: false,
          error: e instanceof Error ? e.message : "Failed to send message",
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
          error:
            e instanceof Error
              ? e.message
              : "Failed to delete conversation",
        });
      }
    },

    goBackToWelcome: () => set({ activeConversation: null }),

    clearError: () => set({ error: null }),
  })
);

export default useWorkspaceStore;
