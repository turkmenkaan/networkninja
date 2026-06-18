/**
 * Per-unit issue-report capture sink.
 *
 * Backed by a Supabase Postgres table (`public.lesson_reports`). Writes happen
 * only from the server (the /api/report-issue route) using the secret-key
 * client in lib/supabase/server.ts, so reports stay private: the table has RLS
 * enabled with no policies, so anon/publishable access is denied; only the
 * secret key works (it bypasses RLS). Mirrors lib/subscribers/store.ts.
 */
import { getServiceClient } from "@/lib/supabase/server";
import { isValidEmail, normalizeEmail } from "@/lib/subscribers/store";
import { isReportCategory } from "@/lib/reports/categories";

const MAX_DESCRIPTION = 4000;

export interface LessonReportInput {
  unitId: string;
  unitTitle?: string | null;
  unitType?: string | null;
  category: string;
  description: string;
  email?: string | null;
  userId?: string | null;
}

export type AddReportResult =
  | { status: "added" }
  | { status: "invalid"; reason: string };

export async function addLessonReport(
  input: LessonReportInput,
): Promise<AddReportResult> {
  const unitId = input.unitId?.trim();
  if (!unitId) {
    return { status: "invalid", reason: "Missing the unit being reported." };
  }
  if (!isReportCategory(input.category)) {
    return { status: "invalid", reason: "Please choose a category." };
  }
  const description = input.description?.trim() ?? "";
  if (!description) {
    return { status: "invalid", reason: "Please describe the issue." };
  }
  if (description.length > MAX_DESCRIPTION) {
    return {
      status: "invalid",
      reason: `Please keep the description under ${MAX_DESCRIPTION} characters.`,
    };
  }

  let email: string | null = null;
  if (input.email) {
    const normalized = normalizeEmail(input.email);
    if (!isValidEmail(normalized)) {
      return {
        status: "invalid",
        reason: "Please enter a valid email address, or leave it blank.",
      };
    }
    email = normalized;
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("lesson_reports").insert({
    unit_id: unitId,
    unit_title: input.unitTitle ?? null,
    unit_type: input.unitType ?? null,
    category: input.category,
    description,
    email,
    user_id: input.userId ?? null,
  });

  if (error) {
    throw new Error(`Failed to save lesson report: ${error.message}`);
  }
  return { status: "added" };
}
