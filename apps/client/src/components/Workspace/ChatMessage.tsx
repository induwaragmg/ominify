"use client";

import type { Message } from "@/types/assistant";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";
import ProductRecommendationCard from "./ProductRecommendationCard";

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
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xs">
            <Bot className="h-3 w-3" />
          </div>
          <span className="text-[11px] font-medium text-gray-500">Ominify AI</span>
        </div>

        {/* Message content placed BELOW bot indicator - full width */}
        <div className="w-full space-y-1.5">
          {message.content.map((block, i) => {
            if (block.type === "text") {
              return (
                <div
                  key={i}
                  className="w-full rounded-2xl rounded-tl-md border border-gray-100 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-gray-800 shadow-sm"
                >
                  {block.text}
                </div>
              );
            }

            if (block.type === "product_recommendations") {
              return (
                <div key={i} className="w-full space-y-2">
                  {block.products.map((product) => (
                    <ProductRecommendationCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              );
            }

            return null;
          })}

          <p className="px-1 text-[10px] text-gray-400">
            {formatTime(
              message.createdAt instanceof Date
                ? message.createdAt
                : new Date(message.createdAt)
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
      <div className="flex max-w-[85%] flex-col items-end space-y-1">
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
              : new Date(message.createdAt)
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
      className="flex w-full flex-col items-start gap-1"
    >
      <div className="flex items-center gap-1.5 px-0.5">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xs">
          <Bot className="h-3 w-3" />
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
