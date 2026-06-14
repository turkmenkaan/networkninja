/**
 * Refreshes the Supabase auth session cookie on each request (the standard
 * @supabase/ssr middleware). This does NOT make pages dynamic — they stay
 * statically rendered; the middleware only rotates the session cookie so it
 * stays valid for the callback route and any future server-side reads.
 *
 * If the auth env is not configured (e.g. a preview without the publishable
 * key), it is a no-op pass-through.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the session so an expiring token gets refreshed into the cookie.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on pages, but skip static assets, SEO files, and API routes (the
  // subscribe route uses the secret key and needs no session refresh).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest|api/).*)",
  ],
};
