"use client";

import useAssistantStore from "@/stores/assistantStore";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function QuickActions(): React.ReactNode {
  const { quickActions, fetchQuickActions, createConversation } =
    useAssistantStore();
  const { getToken } = useAuth();

  useEffect(() => {
    if (quickActions.length === 0) {
      fetchQuickActions();
    }
  }, [quickActions.length, fetchQuickActions]);

  if (quickActions.length === 0) return null;

  const handleClick = async (prompt: string) => {
    let token: string | null = null;
    try {
      token = await getToken();
    } catch {
      // Dev mode fallback
    }
    createConversation(prompt, token);
  };

  return (
    <div className="px-4">
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleClick(action.prompt)}
            className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 text-left text-xs font-medium text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
          >
            <span className="text-sm">{action.icon}</span>
            <span className="line-clamp-2">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
