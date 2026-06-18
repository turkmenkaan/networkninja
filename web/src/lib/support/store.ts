/**
 * Site-wide support-request capture sink.
 *
 * Backed by a Supabase Postgres table (`public.support_requests`). Writes happen
 * only from the server (the /api/support route) using the secret-key client in
 * lib/supabase/server.ts, so requests stay private: the table has RLS enabled
 * with no policies, so anon/publishable access is denied; only the secret key
 * works (it bypasses RLS). Mirrors lib/reports/store.ts.
 */
import { getServiceClient } from "@/lib/supabase/server";
import { isValidEmail, normalizeEmail } from "@/lib/subscribers/store";
import { isSupportCategory } from "@/lib/support/categories";

const MAX_DESCRIPTION = 4000;

export interface SupportRequestInput {
  category: string;
  description: string;
  email?: string | null;
  pagePath?: string | null;
  userId?: string | null;
}

export type AddSupportResult =
  | { status: "added" }
  | { status: "invalid"; reason: string };

export async function addSupportRequest(
  input: SupportRequestInput,
): Promise<AddSupportResult> {
  if (!isSupportCategory(input.category)) {
    return { status: "invalid", reason: "Please choose a topic." };
  }
  const description = input.description?.trim() ?? "";
  if (!description) {
    return { status: "invalid", reason: "Please describe how we can help." };
  }
  if (description.length > MAX_DESCRIPTION) {
    return {
      status: "invalid",
      reason: `Please keep the message under ${MAX_DESCRIPTION} characters.`,
    };
  }

  // Email is required for site-wide support: there is no unit to tie the request
  // back to, so a reply address is the only way we can follow up.
  const normalized = normalizeEmail(input.email ?? "");
  if (!isValidEmail(normalized)) {
    return {
      status: "invalid",
      reason: "Please enter your email so we can reply.",
    };
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("support_requests").insert({
    category: input.category,
    description,
    email: normalized,
    page_path: input.pagePath ?? null,
    user_id: input.userId ?? null,
  });

  if (error) {
    throw new Error(`Failed to save support request: ${error.message}`);
  }
  return { status: "added" };
}
