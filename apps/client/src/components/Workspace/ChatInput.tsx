"use client";

import useAssistantStore from "@/stores/assistantStore";
import { Paperclip, ArrowUp } from "lucide-react";
import { useState, useCallback, type KeyboardEvent } from "react";

export default function ChatInput(): React.ReactNode {
  const [value, setValue] = useState("");
  const { sendMessage, createConversation, activeConversation, isSending } =
    useAssistantStore();

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;

    setValue("");

    if (activeConversation) {
      await sendMessage(trimmed);
    } else {
      // No active conversation — create one with this as the initial message
      await createConversation(trimmed);
    }
  }, [value, isSending, activeConversation, sendMessage, createConversation]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white p-2.5">
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 transition-colors focus-within:border-blue-300 focus-within:bg-white">
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

        {/* Input - Exact 32px height matching buttons for 100% symmetrical centering */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Ominify Assistant..."
          className="h-8 min-w-0 flex-1 bg-transparent px-1 text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim() || isSending}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
