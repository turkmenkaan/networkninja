/**
 * POST /api/report-issue — capture a reader's report about a specific unit.
 *
 * Body: { unitId, unitTitle?, unitType?, category, description, email?, website? }
 * 200:  { ok: true }
 * 400:  { ok: false, error: string }
 *
 * Mirrors /api/subscribe: per-IP rate limit, honeypot, Supabase insert via the
 * secret-key service client, plus a PostHog event. Persistence is delegated to
 * src/lib/reports/store.ts.
 */
import { NextResponse } from "next/server";
import { addLessonReport } from "@/lib/reports/store";
import { rateLimit } from "@/lib/rate-limit";
import { getPostHogClient } from "@/lib/posthog-server";
import { createSupabaseServerClient } from "@/lib/supabase/ssr-server";

// Capturing input must run per-request, never be statically optimized.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Throttle per IP before doing any work (blunts bot/DB spam floods).
  const ip =
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
    "unknown";
  const rl = rateLimit(`report:${ip}`, 5, 60_000); // 5 / minute / IP
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many reports. Please try again in a minute." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const record = body as {
    unitId?: unknown;
    unitTitle?: unknown;
    unitType?: unknown;
    category?: unknown;
    description?: unknown;
    email?: unknown;
    website?: unknown;
  };

  // Honeypot: a hidden field real users never see. If it's filled, a bot did
  // it — return a fake success (so the bot learns nothing) and write nothing.
  const honeypot =
    typeof record.website === "string" ? record.website.trim() : "";
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const unitId = str(record.unitId);
  const category = str(record.category);
  const description = str(record.description);
  const unitTitle = str(record.unitTitle) || null;
  const unitType = str(record.unitType) || null;
  let email = str(record.email).trim() || null;

  // Best-effort: attach the signed-in user (auth is optional everywhere). If
  // they didn't type an email, fall back to their account email.
  let userId: string | null = null;
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      if (!email && user.email) email = user.email;
    }
  } catch {
    // No auth env or no session — proceed anonymously.
  }

  const result = await addLessonReport({
    unitId,
    unitTitle,
    unitType,
    category,
    description,
    email,
    userId,
  });
  if (result.status === "invalid") {
    return NextResponse.json(
      { ok: false, error: result.reason },
      { status: 400 },
    );
  }

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId ?? email ?? `anon:${ip}`,
    event: "lesson_issue_reported",
    properties: { unit_id: unitId, category, signed_in: !!userId },
  });
  await posthog.shutdown();

  return NextResponse.json({ ok: true });
}
