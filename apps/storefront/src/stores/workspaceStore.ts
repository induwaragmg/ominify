"use client";

import { useWorkspaceUIStore } from "./workspaceUIStore";
import { useAssistantStore } from "./assistantStore";

export { useWorkspaceUIStore } from "./workspaceUIStore";
export { useAssistantStore } from "./assistantStore";

/**
 * Unified facade hook combining UI state (`useWorkspaceUIStore`) and Assistant
 * data state (`useAssistantStore`). Preserves full backward-compatibility
 * for existing components while maintaining strict architectural separation
 * under the hood.
 */
export function useWorkspaceStore<T>(
  selector?: (
    state: ReturnType<typeof useWorkspaceUIStore.getState> &
      ReturnType<typeof useAssistantStore.getState>
  ) => T
): T {
  const uiState = useWorkspaceUIStore();
  const assistantState = useAssistantStore();

  const combined = {
    ...uiState,
    ...assistantState,
    // Error message helper for components expecting string | null
    error: assistantState.error ? assistantState.error.message : null,
  };

  if (selector) {
    return selector(combined as any);
  }

  return combined as any;
}

export default useWorkspaceStore;
