"use client";

import useAssistantStore from "@/stores/assistantStore";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { MessageSquare, Plus, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

function timeAgo(date: Date): string {
  const now = Date.now();
  const d = date instanceof Date ? date : new Date(date);
  const diff = now - d.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ChatHistory(): React.ReactNode {
  const {
    conversations,
    isLoadingConversations,
    fetchConversations,
    openConversation,
    createConversation,
    deleteConversation,
  } = useAssistantStore();

  const { getToken } = useAuth();

  useEffect(() => {
    const load = async () => {
      let token: string | null = null;
      try {
        token = await getToken();
      } catch {
        // Dev mode fallback
      }
      fetchConversations(token);
    };
    load();
  }, [fetchConversations, getToken]);

  const handleOpen = async (conversationId: string) => {
    let token: string | null = null;
    try {
      token = await getToken();
    } catch {
      // Dev mode fallback
    }
    openConversation(conversationId, token);
  };

  const handleCreate = async () => {
    let token: string | null = null;
    try {
      token = await getToken();
    } catch {
      // Dev mode fallback
    }
    createConversation(undefined, token);
  };

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    let token: string | null = null;
    try {
      token = await getToken();
    } catch {
      // Dev mode fallback
    }
    deleteConversation(conversationId, token);
  };

  return (
    <div className="px-4">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Recent Chats
        </h3>
      </div>

      {isLoadingConversations ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      ) : conversations.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-400">
          No conversations yet
        </p>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv, index) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              onClick={() => handleOpen(conv.id)}
              className="group flex cursor-pointer w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 transition-colors group-hover:bg-blue-100">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">
                  {conv.title}
                </p>
                <p className="text-[10px] text-gray-400">
                  {timeAgo(conv.updatedAt)}
                </p>
              </div>

              {/* Delete button on hover */}
              <button
                type="button"
                onClick={(e) => handleDelete(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                aria-label="Delete conversation"
                title="Delete conversation"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Chat Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="button"
        onClick={handleCreate}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 bg-white py-2.5 text-xs font-medium text-gray-500 transition-colors hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600"
      >
        <Plus className="h-3.5 w-3.5" />
        New Chat
      </motion.button>
    </div>
  );
}
