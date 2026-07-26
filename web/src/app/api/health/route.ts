/**
 * GET /api/health — uptime probe that actually exercises Supabase.
 *
 * 200: { ok: true,  supabase: "up" }
 * 503: { ok: false, supabase: "down", error: string }
 *
 * Why this exists: the homepage is served from Vercel's CDN cache and returns
 * 200 even when Supabase is down (which is how a real outage once went
 * unnoticed). This route is `force-dynamic` + `no-store` so it is never cached,
 * and it makes a lightweight, row-free query against Supabase so an external
 * monitor (UptimeRobot keyword check on `"ok":true`) catches a paused/
 * unreachable backend. The probe is bounded by a timeout so an unresponsive
 * Supabase fails fast (503) instead of hanging until Vercel's function limit.
 */
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

// Must run per-request and never be statically optimized or cached.
export const dynamic = "force-dynamic";

const PROBE_TIMEOUT_MS = 5000;

// Headers that guarantee the response is never cached at any layer.
const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

export async function GET() {
  try {
    // HEAD request against a known table: validates DNS, TLS, credentials and
    // that the DB answers — returns a count only, no rows.
    const probe = async () => {
      const supabase = getServiceClient();
      const { error } = await supabase
        .from("support_requests")
        .select("*", { head: true, count: "exact" });
      if (error) throw new Error(error.message);
    };

    await Promise.race([
      probe(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Supabase probe timed out after ${PROBE_TIMEOUT_MS}ms`)),
          PROBE_TIMEOUT_MS,
        ),
      ),
    ]);

    return NextResponse.json(
      { ok: true, supabase: "up" },
      { status: 200, headers: NO_STORE },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { ok: false, supabase: "down", error: message },
      { status: 503, headers: NO_STORE },
    );
  }
}
