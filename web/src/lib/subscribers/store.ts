/**
 * Subscriber capture — "notify me of new lessons/labs" sink.
 *
 * Backed by a Supabase Postgres table (`public.subscribers`). The table has a
 * unique constraint on `email`; a duplicate insert surfaces as Postgres error
 * `23505`, which we map to `{ status: "exists" }`.
 *
 * Writes happen only from the server (the /api/subscribe route) using the
 * secret-key client in lib/supabase/server.ts, so the subscriber list stays
 * private: the table has RLS enabled with no policies, so anon/publishable
 * access is denied; only the secret key works (it bypasses RLS).
 *
 * The public API here is unchanged from the previous file-based implementation,
 * so the route handler and UI need no edits.
 */
import { getServiceClient } from "@/lib/supabase/server";

export interface SubscriberRecord {
  email: string;
  source?: string;
  /** ISO timestamp (set by the DB default). */
  created_at?: string;
}

export type AddResult =
  | { status: "added" }
  | { status: "exists" }
  | { status: "invalid"; reason: string };

// Pragmatic email check — not RFC-perfect, but rejects obvious junk. The real
// validation is a confirmation email, added with a hosted-ESP swap later.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}

export async function addSubscriber(
  rawEmail: string,
  source?: string,
): Promise<AddResult> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) {
    return { status: "invalid", reason: "Please enter a valid email address." };
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("subscribers")
    .insert({ email, source: source ?? null });

  if (!error) return { status: "added" };
  if (error.code === "23505") return { status: "exists" }; // unique_violation
  throw new Error(`Failed to save subscriber: ${error.message}`);
}
