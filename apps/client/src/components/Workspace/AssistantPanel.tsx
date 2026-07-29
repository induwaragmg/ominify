"use client";

import useAssistantStore from "@/stores/assistantStore";
import type { StreamingPhase } from "@/types/assistant";
import { useAuth } from "@clerk/nextjs";
import { Bot, ArrowLeft, Loader2, Brain, Search, Wrench, Sparkles, MessageSquare, ArrowDown, LogIn, WifiOff, RefreshCw, Unlink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import QuickActions from "./QuickActions";
import ChatHistory from "./ChatHistory";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import MarkdownRenderer from "./MarkdownRenderer";
import Image from "next/image";

// ─── Streaming Phase Indicator ───────────────────────────────────────────────

const PHASE_CONFIG: Record<
  Exclude<StreamingPhase, "idle" | "completed">,
  { icon: React.ReactNode; label: string; color: string }
> = {
  thinking: {
    icon: <Brain className="h-3 w-3" />,
    label: "Analyzing your request...",
    color: "text-purple-500",
  },
  planning: {
    icon: <Search className="h-3 w-3" />,
    label: "Planning approach...",
    color: "text-blue-500",
  },
  tool_execution: {
    icon: <Wrench className="h-3 w-3" />,
    label: "Searching products...",
    color: "text-amber-500",
  },
  reasoning: {
    icon: <Sparkles className="h-3 w-3" />,
    label: "Synthesizing response...",
    color: "text-emerald-500",
  },
  streaming: {
    icon: <MessageSquare className="h-3 w-3" />,
    label: "Generating response...",
    color: "text-blue-500",
  },
};

function StreamingIndicator(): React.ReactNode {
  const { streamingPhase, streamingText, streamingTools } = useAssistantStore();

  if (streamingPhase === "idle" || streamingPhase === "completed") return null;

  const config = PHASE_CONFIG[streamingPhase];
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full flex-col items-start gap-1 max-w-[640px]"
    >
      {/* Bot header */}
      <div className="flex items-center gap-1.5 px-0.5">
        <div className="relative h-5 w-5 shrink-0 items-center justify-center rounded-full">
          <Image src="/icon.svg" alt="Ominify AI" fill className="object-contain" />
        </div>
        <span className="text-xs font-medium text-brand">Ominify AI</span>
      </div>

      <div className="w-full space-y-1.5">
        {/* Phase indicator pill */}
        <motion.div
          key={streamingPhase}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 shadow-sm"
        >
          <span className={`${config.color} animate-pulse`}>{config.icon}</span>
          <span className="text-xs font-medium text-gray-600">{config.label}</span>

          {/* Show tool names during execution */}
          {streamingPhase === "tool_execution" && streamingTools.length > 0 && (
            <span className="ml-1 text-[10px] text-gray-400">
              ({streamingTools.join(", ")})
            </span>
          )}
        </motion.div>

        {/* Partially streamed text rendered as Markdown in real-time */}
        {streamingPhase === "streaming" && streamingText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full rounded-2xl rounded-tl-md border border-gray-100 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-gray-800 shadow-sm"
          >
            <MarkdownRenderer content={streamingText} />
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block ml-1 w-1.5 h-3.5 bg-blue-500 rounded-sm align-middle"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Unauthenticated Banner Component ────────────────────────────────────────

function UnauthenticatedGate(): React.ReactNode {
  return (
    <div className="mx-4 my-auto flex flex-col items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/60 to-white p-6 text-center shadow-xs">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
        <Bot className="h-6 w-6" />
      </div>
      <h4 className="text-base font-bold text-gray-950">
        Sign in to Chat with Ominify AI
      </h4>
      <p className="mt-1.5 text-xs text-gray-500 leading-relaxed max-w-[280px]">
        Get personalized product recommendations, save your shopping history, and compare items instantly.
      </p>
      <Link
        href="/sign-in"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
      >
        <LogIn className="h-4 w-4" />
        Sign In with Clerk
      </Link>
    </div>
  );
}

// ─── Service Offline Gate Component ──────────────────────────────────────────
// Industry-standard offline pattern matching Ominify design system

function ServiceOfflineGate(): React.ReactNode {
  const { isCheckingHealth, checkServiceHealth } = useAssistantStore();

  return (
    <div className="mx-4 my-auto flex flex-col items-center justify-center rounded-3xl border border-gray-200/70 bg-gray-50/60 p-7 text-center shadow-xs">
      {/* Grayed-out icon badge with red offline accent */}
      <div className="relative mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 border border-gray-200 shadow-xs">
          <Unlink className="h-6 w-6 text-gray-400" />
        </div>
        
      </div>

      <h4 className="text-base font-bold text-gray-800 tracking-tight">
        Assistant Service is Offline
      </h4>
      <p className="mt-2 text-xs text-gray-500 leading-relaxed max-w-[290px]">
        We can&apos;t connect to the AI assistant right now. The service may be starting up or temporarily offline.
      </p>

      <button
        type="button"
        onClick={() => checkServiceHealth()}
        disabled={isCheckingHealth}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand/80 hover:shadow-md active:scale-98 disabled:opacity-60 cursor-pointer"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isCheckingHealth ? "animate-spin" : ""}`} />
        {isCheckingHealth ? "Connecting..." : "Retry Connection"}
      </button>
    </div>
  );
}

// ─── Inline Connection Error Card (for in-chat errors) ──────────────────────

function ConnectionErrorCard(): React.ReactNode {
  const { error, isCheckingHealth, checkServiceHealth, clearError } = useAssistantStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-xs"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200 text-gray-600">
          <WifiOff className="h-3.5 w-3.5 text-red-500" />
        </div>
        <span className="text-xs font-semibold text-gray-800">Assistant Connection Lost</span>
      </div>
      <p className="text-[11px] text-gray-600 leading-relaxed">
        {error instanceof Error
          ? error.message
          : "Unable to reach the assistant service. Please check if the backend service is active."}
      </p>
      <div className="flex items-center gap-3 pt-0.5">
        <button
          type="button"
          onClick={() => {
            clearError();
            checkServiceHealth();
          }}
          disabled={isCheckingHealth}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${isCheckingHealth ? "animate-spin" : ""}`} />
          {isCheckingHealth ? "Connecting..." : "Retry"}
        </button>
        <button
          type="button"
          onClick={clearError}
          className="text-[11px] text-gray-500 hover:text-gray-800 underline cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

// ─── Assistant Panel ─────────────────────────────────────────────────────────

export default function AssistantPanel(): React.ReactNode {
  const {
    activeConversation,
    isLoadingMessages,
    isSending,
    error,
    isOffline,
    streamingPhase,
    goBackToWelcome,
    checkServiceHealth,
  } = useAssistantStore();

  const { isSignedIn, isLoaded } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Check service health on mount
  useEffect(() => {
    checkServiceHealth();
  }, [checkServiceHealth]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Auto-scroll ONLY inside internal chat container when new content arrives
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 120;

      if (isNearBottom || isSending) {
        scrollToBottom();
      }
    }
  }, [activeConversation?.messages.length, isSending, streamingPhase]);

  // Monitor user scroll position to show/hide "Scroll to bottom" button
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isFarFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight > 150;
      setShowScrollBottom(isFarFromBottom);
    }
  };

  // ── Active Chat View ─────────────────────────────────────────────────────
  if (activeConversation) {
    const isStreaming = streamingPhase !== "idle" && streamingPhase !== "completed";

    return (
      <div className="flex h-full flex-1 flex-col min-h-0 relative">
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
          {/* Inline offline indicator in chat header */}
          {isOffline && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600 border border-red-100">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Offline
            </span>
          )}
        </div>

        {/* Messages - Internal Scroll Container (Centered max-w-3xl) */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4 relative"
        >
          <div className="max-w-3xl mx-auto w-full">
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

                {/* Show streaming indicator during SSE events */}
                {isStreaming && <StreamingIndicator />}
              </div>
            )}

            {/* Connection Error Card — shown when error or offline in chat */}
            {(error || isOffline) && <ConnectionErrorCard />}
          </div>
        </div>

        {/* Floating Scroll-to-bottom Button */}
        <AnimatePresence>
          {showScrollBottom && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-16 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input - Pinned at bottom, centered max-w-3xl */}
        <div className="shrink-0">
          <div className="max-w-3xl mx-auto w-full">
            <ChatInput />
          </div>
        </div>
      </div>
    );
  }

  // ── Welcome View ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-1 flex-col min-h-0">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-center px-4 py-4">
          <div className="relative h-6 w-7 shrink-0 items-center justify-center rounded-md">
            <Image src="/icon.svg" alt="Ominify AI" fill className="object-contain" />
          </div>
          <div className="flex flex-col pl-2">
            <h3 className="text-sm font-semibold text-brand">
              Ominify AI
            </h3>
          </div>
        </div>

        {/* Priority: Auth gate > Offline gate > Normal content */}
        {isLoaded && !isSignedIn ? (
          <UnauthenticatedGate />
        ) : isOffline ? (
          <ServiceOfflineGate />
        ) : (
          <>
            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 space-y-5 overflow-y-auto pb-4">
              <QuickActions />
              <ChatHistory />
            </div>

            {/* Input always at bottom */}
            <ChatInput />
          </>
        )}
      </div>
    </div>
  );
}
