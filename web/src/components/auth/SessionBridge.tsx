"use client";

/**
 * Wires Supabase auth state into the progress store: on sign-in it merge-syncs
 * local + remote progress; on sign-out it stops remote writes (local stays).
 * Mounted once in the root layout. Renders nothing. No-ops if auth env is
 * unconfigured.
 */
import { useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { progressStore } from "@/lib/progress/store";

export function SessionBridge() {
  useEffect(() => {
    let supabase;
    try {
      supabase = getBrowserClient();
    } catch {
      return;
    }
    progressStore.setSupabase(supabase);

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        progressStore.setUser(null);
      } else if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        progressStore.setUser(session?.user?.id ?? null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
