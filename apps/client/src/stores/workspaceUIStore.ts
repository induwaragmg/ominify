"use client";

import { create } from "zustand";

// ─── Workspace UI State Shape ────────────────────────────────────────────────
// Dedicated store managing UI visibility, panels, drawers, and resizable layout.
// Completely decoupled from assistant chat data.

interface WorkspaceUIState {
  isAssistantOpen: boolean;
  isMobileOpen: boolean;
  assistantWidth: number;
  isResizing: boolean;
}

interface WorkspaceUIActions {
  toggleAssistant: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  closeMobile: () => void;
  setAssistantWidth: (width: number) => void;
  setIsResizing: (isResizing: boolean) => void;
}

export const useWorkspaceUIStore = create<
  WorkspaceUIState & WorkspaceUIActions
>()((set) => ({
  isAssistantOpen: false,
  isMobileOpen: false,
  assistantWidth: 380,
  isResizing: false,

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

  setAssistantWidth: (width) => set({ assistantWidth: Math.max(360, width) }),

  setIsResizing: (isResizing) => set({ isResizing }),
}));

export default useWorkspaceUIStore;
