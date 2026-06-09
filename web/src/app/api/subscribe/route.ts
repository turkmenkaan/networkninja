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

// Capturing input must run per-request, never be statically optimized.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const record = body as { email?: unknown; source?: unknown };
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

  return NextResponse.json({
    ok: true,
    alreadySubscribed: result.status === "exists",
  });
}
