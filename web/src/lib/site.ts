/**
 * The canonical site origin, used for metadataBase, robots, sitemap, and the
 * absolute URLs in JSON-LD / OpenGraph.
 *
 * The production domain is networkninjas.app. Set NEXT_PUBLIC_SITE_URL in the
 * environment (Vercel) to override per-environment (e.g. a preview URL); if it
 * is unset, everything falls back to the production domain. Wiring it here means
 * the domain is correct everywhere from one place (see PREFLIGHT P0 "Real domain
 * + production URLs").
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://networkninjas.app"
).replace(/\/$/, "");

export const SITE_NAME = "NetworkNinjas";
