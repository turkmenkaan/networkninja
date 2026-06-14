/**
 * Server-side Supabase client for AUTH (cookie-backed), used by the OAuth
 * callback route. Uses the PUBLISHABLE key with the user's session cookies, so
 * it is scoped by Row Level Security to that user — distinct from server.ts,
 * which uses the SECRET key for the subscriber list.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseServerClient(): SupabaseClient {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase auth env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see web/.env.example).",
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a context where cookies are read-only (e.g. a Server
          // Component). The middleware refreshes the session cookie instead.
        }
      },
    },
  });
}
