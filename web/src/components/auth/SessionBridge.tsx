"use client";

/**
 * Wires Supabase auth state into the progress store: on sign-in it merge-syncs
 * local + remote progress; on sign-out it stops remote writes (local stays).
 * Mounted once in the root layout. Renders nothing. No-ops if auth env is
 * unconfigured.
 */
import { useEffect } from "react";
import posthog from "posthog-js";
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
        posthog.reset();
      } else if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        const userId = session?.user?.id ?? null;
        progressStore.setUser(userId);
        if (userId) {
          posthog.identify(userId, {
            email: session?.user?.email,
            provider: session?.user?.app_metadata?.provider,
          });
        }
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
