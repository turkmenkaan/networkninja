/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The content library lives outside the app (../content). It is read at
  // build/request time by lib/content. Nothing is copied into the app.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Serve one hostname. www.networkninjas.app answered 200 alongside the apex,
  // and Search Console showed Google indexing the www copies of pages, which
  // splits their ranking signals. A permanent (308) redirect consolidates
  // everything on the canonical host (SITE_URL in src/lib/site.ts). It lives
  // here, not only in the Vercel dashboard, so the rule is versioned with the
  // code.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.networkninjas.app" }],
        destination: "https://networkninjas.app/:path*",
        permanent: true,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
