/**
 * Browser Supabase client for AUTH only (cookie-based sessions via @supabase/ssr).
 *
 * Uses the PUBLISHABLE key (safe to expose), never the secret key. Singleton so
 * we don't spin up multiple GoTrueClient instances. Throws if the env is missing
 * so callers (AuthButton/SessionBridge) can no-op gracefully when auth isn't
 * configured (e.g. a preview deploy without the key).
 *
 * NOTE: this is separate from server.ts (secret key, subscribers) on purpose.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase auth env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see web/.env.example).",
    );
  }

  client = createBrowserClient(url, key);
  return client;
}
