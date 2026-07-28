"use client";

import useWorkspaceStore from "@/stores/workspaceStore";
import { Bot, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import QuickActions from "./QuickActions";
import ChatHistory from "./ChatHistory";
import ChatMessage from "./ChatMessage";
import { TypingIndicator } from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function AssistantPanel(): React.ReactNode {
  const {
    activeConversation,
    isLoadingMessages,
    isSending,
    error,
    goBackToWelcome,
    clearError,
  } = useWorkspaceStore();

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ONLY inside the internal chat container (never main page window)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activeConversation?.messages.length, isSending]);

  // ── Active Chat View ─────────────────────────────────────────────────────
  if (activeConversation) {
    return (
      <div className="flex h-full flex-1 flex-col min-h-0">
        {/* Chat Header */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={goBackToWelcome}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {activeConversation.title}
            </h3>
          </div>
        </div>

        {/* Messages - Internal Scroll Container Only */}
        <div
          ref={chatContainerRef}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
        >
          {isLoadingMessages ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {activeConversation.messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
              </AnimatePresence>

              {isSending && <TypingIndicator />}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              <span>{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="font-medium underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Input - Pinned at bottom */}
        <div className="shrink-0">
          <ChatInput />
        </div>
      </div>
    );
  }

  // ── Welcome View ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-1 flex-col min-h-0">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 px-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Ominify Assistant
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-gray-400">Online</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 space-y-5 overflow-y-auto pb-4">
        <QuickActions />
        <ChatHistory />
      </div>

      {/* Input always at bottom */}
      <ChatInput />
    </div>
  );
}
