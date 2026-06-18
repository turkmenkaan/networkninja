/**
 * POST /api/support — capture a site-wide support request (any page).
 *
 * Body: { category, description, email, pagePath?, website? }
 * 200:  { ok: true }
 * 400:  { ok: false, error: string }
 *
 * Mirrors /api/report-issue: per-IP rate limit, honeypot, Supabase insert via
 * the secret-key service client, plus a PostHog event. Persistence is delegated
 * to src/lib/support/store.ts. Unlike a report, this is not tied to a unit and
 * email is required (it is the only reply path).
 */
import { NextResponse } from "next/server";
import { addSupportRequest } from "@/lib/support/store";
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
  const rl = rateLimit(`support:${ip}`, 5, 60_000); // 5 / minute / IP
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
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
    category?: unknown;
    description?: unknown;
    email?: unknown;
    pagePath?: unknown;
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
  const category = str(record.category);
  const description = str(record.description);
  const pagePath = str(record.pagePath) || null;
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

  const result = await addSupportRequest({
    category,
    description,
    email,
    pagePath,
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
    event: "support_request_submitted",
    properties: { category, page_path: pagePath, signed_in: !!userId },
  });
  await posthog.shutdown();

  return NextResponse.json({ ok: true });
}
