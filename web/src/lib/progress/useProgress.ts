"use client";

import { useSyncExternalStore } from "react";
import { progressStore, type ProgressState } from "./store";

/**
 * Subscribe a component to the progress store. Returns the current snapshot
 * plus the mutation actions. Backend-agnostic by design (see store.ts).
 */
export function useProgress() {
  const state: ProgressState = useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
    progressStore.getServerSnapshot,
  );

  return {
    state,
    setUnitComplete: progressStore.setUnitComplete.bind(progressStore),
    toggleObjective: progressStore.toggleObjective.bind(progressStore),
    resetAll: progressStore.resetAll.bind(progressStore),
  };
}
