/**
 * The canonical site origin, used for metadataBase, robots, sitemap, and the
 * absolute URLs in JSON-LD / OpenGraph.
 *
 * Set NEXT_PUBLIC_SITE_URL (e.g. https://networkninja.dev) in the environment
 * once the real domain exists; until then everything falls back to the
 * placeholder, exactly as before, so nothing breaks pre-launch. Wiring it here
 * means the domain becomes correct everywhere by setting one env var, with no
 * code change (see PREFLIGHT P0 "Real domain + production URLs").
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://networkninja.local"
).replace(/\/$/, "");

export const SITE_NAME = "NetworkNinja";
