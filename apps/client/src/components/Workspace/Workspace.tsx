"use client";

import useWorkspaceUIStore from "@/stores/workspaceUIStore";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import RightSidebar from "../RightSidebar";
import AssistantPanel from "./AssistantPanel";

const MIN_ASSISTANT_WIDTH = 320;
const MAX_ASSISTANT_PANEL_WIDTH = 720;
const MIN_MAIN_CONTENT_WIDTH = 480;

// ─── Resize Handle ──────────────────────────────────────────────────────────

function ResizeHandle({
  onResizeStart,
  isResizing,
}: {
  onResizeStart: (e: React.MouseEvent) => void;
  isResizing: boolean;
}): React.ReactNode {
  return (
    <div
      onMouseDown={onResizeStart}
      className={`absolute left-0 top-0 bottom-0 z-30 flex w-4 cursor-col-resize items-center justify-center
        ${isResizing ? "" : "group/handle"}`}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize assistant panel"
      tabIndex={0}
    >
      {/* Visual bar positioned in the gap */}
      <div
        className={`h-[calc(100%-22px)] mt-5 w-[4px] rounded-full transition-all duration-150
          ${
            isResizing
              ? "bg-blue-500 shadow-sm"
              : "bg-gray-300/40 group-hover/handle:bg-blue-400"
          }`}
      />
    </div>
  );
}

// ─── Main Workspace Component ────────────────────────────────────────────────

export default function Workspace(): React.ReactNode {
  const {
    isAssistantOpen,
    isMobileOpen,
    assistantWidth,
    setAssistantWidth,
    closeAssistant,
    closeMobile,
  } = useWorkspaceUIStore();

  const [isResizing, setIsResizing] = useState(false);
  const asideRef = useRef<HTMLElement>(null);

  // ── Resize Logic ─────────────────────────────────────────────────────────

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = assistantWidth;

      // Measure the flex row parent to compute dynamic max
      const parentWidth =
        asideRef.current?.parentElement?.offsetWidth ?? window.innerWidth;
      const maxWidth = Math.min(
        MAX_ASSISTANT_PANEL_WIDTH,
        Math.max(MIN_ASSISTANT_WIDTH, parentWidth - MIN_MAIN_CONTENT_WIDTH)
      );

      const onMouseMove = (moveEvent: MouseEvent) => {
        // Dragging left (negative delta) → wider panel
        const delta = startX - moveEvent.clientX;
        const newWidth = Math.max(
          MIN_ASSISTANT_WIDTH,
          Math.min(maxWidth, startWidth + delta)
        );
        setAssistantWidth(newWidth);
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [assistantWidth, setAssistantWidth]
  );

  // ── Default: Show original RightSidebar ────────────────────────────────
  if (!isAssistantOpen) {
    return <RightSidebar />;
  }

  // ── Assistant Open: Sticky resizable panel + mobile drawer ─────────────
  return (
    <>
      {/* Desktop / Tablet: Sticky aside positioned relative to viewport & parent flex row */}
      <aside
        ref={asideRef}
        style={{ width: assistantWidth }}
        className="sticky top-0 hidden shrink-0 self-start pt-4 pl-4 pr-1 lg:block relative"
      >
        {/* Resize Handle in the left padding gap outside the chatbot card */}
        <ResizeHandle
          onResizeStart={startResize}
          isResizing={isResizing}
        />

        <div className="flex h-[calc(100vh-26px)] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          {/* Header with close */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-50 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Ominify Assistant
            </span>
            <button
              type="button"
              onClick={closeAssistant}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close assistant"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Panel content */}
          <div className="flex flex-1 min-h-0 flex-col">
            <AssistantPanel />
          </div>
        </div>
      </aside>

      {/* Mobile: Slide-over Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[400px] max-w-[90vw] flex-col border-l border-gray-100 bg-white shadow-2xl lg:hidden"
            >
              {/* Mobile header */}
              <div className="flex shrink-0 items-center justify-between border-b border-gray-50 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Ominify Assistant
                </span>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-1 min-h-0 flex-col">
                <AssistantPanel />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
