"use client";

import type { Message, FollowUpSuggestionsContentBlock } from "@/types/assistant";
import useAssistantStore from "@/stores/assistantStore";
import Image from "next/image";
import { motion } from "framer-motion";
import ProductRecommendationCard from "./ProductRecommendationCard";
import MarkdownRenderer from "./MarkdownRenderer";

interface ChatMessageProps {
  message: Message;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function FollowUpSuggestions({ block }: { block: FollowUpSuggestionsContentBlock }) {
  const { sendMessage, activeConversation } = useAssistantStore();

  if (!block.suggestions || block.suggestions.length === 0) return null;

  const handleClick = (suggestion: string) => {
    if (!activeConversation) return;
    sendMessage(suggestion);
  };

  return (
    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[560px]">
      {block.suggestions.map((suggestion, idx) => (
        <motion.button
          key={idx}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.06, duration: 0.2 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => handleClick(suggestion)}
          className="rounded-full border border-blue-100 bg-blue-50/60 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-100/80"
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  );
}

export default function ChatMessage({ message }: ChatMessageProps): React.ReactNode {
  const isUser = message.role === "user";

  if (!isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex w-full flex-col items-start gap-1"
      >
        {/* Bot header indicator above message */}
        <div className="flex items-center gap-1.5 px-0.5 mb-1">
          <div className="relative h-5 w-5 shrink-0 items-center justify-center rounded-full">
            <Image src="/icon.svg" alt="Ominify AI" fill className="object-contain" />
          </div>
          <span className="text-xs font-medium text-brand">Ominify AI</span>
        </div>

        {/* Message content - capped at max-w-[640px] so text doesn't stretch infinitely on wide panels */}
        <div className="w-full max-w-[640px] space-y-1.5">
          {message.content.map((block, i) => {
            if (block.type === "text") {
              return (
                <div
                  key={i}
                  className="w-full rounded-2xl rounded-tl-md border border-gray-100 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-gray-800 shadow-sm"
                >
                  <MarkdownRenderer content={block.text} />
                </div>
              );
            }

            if (block.type === "product_recommendations") {
              return (
                <div
                  key={i}
                  className="w-full max-w-[420px] flex flex-col gap-2 my-1"
                >
                  {block.products.map((product) => (
                    <ProductRecommendationCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              );
            }

            if (block.type === "follow_up_suggestions") {
              return <FollowUpSuggestions key={i} block={block} />;
            }

            return null;
          })}

          <p className="px-1 text-[10px] text-gray-400">
            {formatTime(
              message.createdAt instanceof Date
                ? message.createdAt
                : new Date(message.createdAt),
            )}
          </p>
        </div>
      </motion.div>
    );
  }

  // User Message
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex w-full flex-col items-end gap-1"
    >
      <div className="flex max-w-[85%] sm:max-w-[500px] flex-col items-end space-y-1">
        {message.content.map((block, i) => {
          if (block.type === "text") {
            return (
              <div
                key={i}
                className="rounded-2xl rounded-tr-md bg-blue-600 px-3.5 py-1.5 text-sm leading-relaxed text-white shadow-sm"
              >
                {block.text}
              </div>
            );
          }
          return null;
        })}
        <p className="px-1 text-right text-[10px] text-gray-400">
          {formatTime(
            message.createdAt instanceof Date
              ? message.createdAt
              : new Date(message.createdAt),
          )}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

export function TypingIndicator(): React.ReactNode {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full flex-col items-start gap-1 max-w-[640px]"
    >
      <div className="flex items-center gap-1.5 px-0.5">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-0.5 shadow-xs">
          <Image src="/icon.svg" alt="Ominify AI" width={14} height={14} className="h-3.5 w-3.5 object-contain" />
        </div>
        <span className="text-[11px] font-medium text-gray-500">Ominify AI</span>
      </div>
      <div className="rounded-2xl rounded-tl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-1.5 w-1.5 rounded-full bg-gray-400"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
