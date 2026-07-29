"use client";

import useAssistantStore from "@/stores/assistantStore";
import { useAuth } from "@clerk/nextjs";
import { Paperclip, ArrowUp, Square } from "lucide-react";
import { useState, useCallback, type KeyboardEvent } from "react";

export default function ChatInput(): React.ReactNode {
  const [value, setValue] = useState("");
  const {
    sendMessage,
    createConversation,
    cancelActiveRequest,
    activeConversation,
    isSending,
    streamingPhase,
    isOffline,
  } = useAssistantStore();

  const { getToken } = useAuth();

  const isStreaming =
    isSending || (streamingPhase !== "idle" && streamingPhase !== "completed");
  const isInputDisabled = isStreaming || isOffline;

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || isInputDisabled) return;

    setValue("");

    // Get Clerk JWT for authenticated requests
    let token: string | null = null;
    try {
      token = await getToken();
    } catch {
      // Dev mode fallback — backend allows unauthenticated in development
    }

    if (activeConversation) {
      await sendMessage(trimmed, token);
    } else {
      // No active conversation — create one with this as the initial message
      await createConversation(trimmed, token);
    }
  }, [value, isInputDisabled, activeConversation, sendMessage, createConversation, getToken]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCancel = () => {
    cancelActiveRequest();
  };

  return (
    <div className="border-t border-gray-100 bg-white p-2.5">
      <div className={`flex items-center gap-2 rounded-full border px-2 py-1 transition-colors ${
        isOffline
          ? "border-gray-200 bg-gray-100/70"
          : "border-gray-200 bg-gray-50 focus-within:border-blue-300 focus-within:bg-white"
      }`}>
        {/* Attachment Button (placeholder) */}
        <button
          type="button"
          disabled
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-300 transition-colors"
          aria-label="Attach file (coming soon)"
          title="Attachments coming soon"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isOffline
              ? "Assistant service is offline..."
              : isStreaming
                ? "AI is responding..."
                : "Ask Ominify Assistant..."
          }
          disabled={isInputDisabled}
          className="h-8 min-w-0 flex-1 bg-transparent px-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Send / Cancel Button */}
        {isStreaming ? (
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-all hover:bg-red-600"
            aria-label="Stop response"
            title="Stop generating"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim() || isOffline}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
