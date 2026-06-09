/**
 * Server-only Supabase client (secret API key).
 *
 * ⚠️  NEVER import this into a "use client" file or expose the key to the
 * browser. The secret key (Supabase's replacement for the legacy service_role
 * key) bypasses Row Level Security, so it must stay on the server (route
 * handlers, server components/actions) only.
 *
 * The client is created lazily so that importing this module never throws at
 * build time when env vars are absent — it only requires them when actually
 * used at request time.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (see web/.env.example).",
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
