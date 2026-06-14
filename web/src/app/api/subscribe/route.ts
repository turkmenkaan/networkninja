/**
 * POST /api/subscribe — capture a "notify me of new lessons/labs" email.
 *
 * Body: { email: string, source?: string }
 * 200:  { ok: true, alreadySubscribed: boolean }
 * 400:  { ok: false, error: string }
 *
 * Persistence is delegated to src/lib/subscribers/store.ts (file sink in
 * Tier 1; swap for a hosted ESP / Postgres later — see that file).
 */
import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/subscribers/store";
import { rateLimit } from "@/lib/rate-limit";
import { getPostHogClient } from "@/lib/posthog-server";

// Capturing input must run per-request, never be statically optimized.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Throttle per IP before doing any work (blunts bot/DB spam floods).
  const ip =
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
    "unknown";
  const rl = rateLimit(`subscribe:${ip}`, 5, 60_000); // 5 / minute / IP
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
    email?: unknown;
    source?: unknown;
    website?: unknown;
  };

  // Honeypot: a hidden field real users never see. If it's filled, a bot did
  // it — return a fake success (so the bot learns nothing) and write nothing.
  const honeypot =
    typeof record.website === "string" ? record.website.trim() : "";
  if (honeypot) {
    return NextResponse.json({ ok: true, alreadySubscribed: false });
  }

  const email = typeof record.email === "string" ? record.email : "";
  const source =
    typeof record.source === "string" && record.source ? record.source : "site";

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Email is required." },
      { status: 400 },
    );
  }

  const result = await addSubscriber(email, source);
  if (result.status === "invalid") {
    return NextResponse.json(
      { ok: false, error: result.reason },
      { status: 400 },
    );
  }

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: email,
    event: "newsletter_signup_submitted",
    properties: {
      source,
      already_subscribed: result.status === "exists",
    },
  });
  await posthog.shutdown();

  return NextResponse.json({
    ok: true,
    alreadySubscribed: result.status === "exists",
  });
}
