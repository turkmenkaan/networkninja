# Deploying NetworkNinjas to Vercel

The `web/` app is a Next.js 14 site that reads the curriculum from `../content` at **build time** and uses Supabase (Postgres) for the email signup. This guide gets it live on Vercel.

## What you're deploying
- **Static + SSG pages** (home, paths, units, topology downloads) — rendered at build.
- **One dynamic API route** (`/api/subscribe`) — runs as a serverless function, writes to Supabase.
- Content stays in **git**; Supabase holds only the subscriber list.

## Why this deploys cleanly
Every read of `../content` happens during `next build` (the routes are Static/SSG — see `npm run build` output). The only runtime function, `/api/subscribe`, talks to Supabase, **not** the filesystem. So the one Vercel-specific gotcha (content living outside `web/`) is purely a build-time concern, fixed by a single project setting below.

---

## Prerequisites
- A GitHub account and a Vercel account (free Hobby tier is fine).
- The Supabase project from Phase 1, with the `subscribers` table created and your `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SECRET_KEY` handy.

## Step 0 — Pre-deploy prep (recommended)
1. **Bump Next.js off the flagged version.** `14.2.18` has a security advisory. From `web/`: `npm i next@^14.2` (latest 14.2.x patch), then `npm run build` to confirm green. (Optional but recommended before a public URL.)
2. Confirm a clean production build: `cd web && npm run build` → should end with `✓ Compiled successfully` and the route table. **Do not** run `next dev` right before deploying locally — it overwrites `.next` with a dev build.
3. Secrets are already kept out of git by the root `.gitignore` (`node_modules`, `.next`, `.env*`, `web/.data`). `web/.env.local` stays local only.

## Step 1 — Put the repo on GitHub
This isn't a git repo yet. From the repo root (`networkninja/`):
```bash
git init
git add .
git commit -m "NetworkNinjas: BGP Foundations content + web app + Supabase subscribers"
git branch -M main
git remote add origin git@github.com:<you>/networkninja.git   # create the repo on GitHub first
git push -u origin main
```
Verify the push does **not** include `node_modules/`, `web/.next/`, or any `.env.local` (it won't, given `.gitignore`).

## Step 2 — Import into Vercel (the one critical setting)
1. Vercel dashboard → **Add New… → Project** → import the GitHub repo.
2. **Root Directory:** set to **`web`** (the Next app is in a subfolder).
3. **Expand "Root Directory" options and ENABLE "Include files outside of the Root Directory in the Build Step."**
   This is the make-or-break setting: it uploads the sibling `../content` directory so the build can read the curriculum. Without it, the build fails to find content.
4. Framework Preset: **Next.js** (auto-detected). Build command / output: leave as defaults (`next build`).

## Step 3 — Environment variables
In the import screen (or Project → Settings → Environment Variables), add for **Production** (and Preview if you want PR deploys):

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | your project URL | Needed at build (inlined) and runtime. |
| `SUPABASE_SECRET_KEY` | your `sb_secret_...` key | **Server-only.** Because it's not `NEXT_PUBLIC_`, Vercel never exposes it to the browser. |

(The publishable key isn't needed until Phase 2 auth. The service-role/secret key bypasses RLS, so treat it like a password.)

## Step 4 — Deploy and verify
1. Click **Deploy**. First build runs `next build` with `../content` present.
2. Open the deployment URL. Check:
   - Home, a path page, and a unit page render with diagrams.
   - On a lab page, the **Download topology** link returns the `.clab.yml`.
   - Submit the **email signup** with a test address → success state.
3. Confirm the row landed in Supabase (Table Editor → `subscribers`), then **delete the test row** so your real list stays clean.

## Custom domain (networkninjas.app, on GoDaddy)
The production domain is **networkninjas.app**, with the **apex** as primary and `www` redirecting to it.

1. **Vercel** → Project → Settings → **Domains** → add both `networkninjas.app` and `www.networkninjas.app`. Set `networkninjas.app` as **Primary** and accept the offer to redirect `www` → apex.
2. **GoDaddy** → the domain → **DNS → DNS Records**. Keep GoDaddy as the DNS host (do not change nameservers) and add:

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | `A` | `@` | `76.76.21.21` | 1 hour |
   | `CNAME` | `www` | `cname.vercel-dns.com` | 1 hour |

   - **Delete GoDaddy's default parked `@` A record** (points at their parking IP) so it doesn't conflict.
   - **Do not** use GoDaddy "Domain Forwarding" — use the records above.
   - If Vercel's panel shows different values or a TXT verification record, follow Vercel.
3. **HTTPS:** `.app` is an HSTS-preloaded TLD (HTTPS-only, no HTTP fallback). Vercel auto-issues the SSL cert once DNS verifies; the site won't load until that cert is valid (a few minutes after DNS resolves).
4. **Set the canonical URL env var** so SEO/canonical/OG/sitemap use the real domain. Project → Settings → Environment Variables → add for **Production**:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SITE_URL` | `https://networkninjas.app` |

   Then **redeploy** (env changes need a fresh build). The code reads this via `web/src/lib/site.ts` (which also defaults to `https://networkninjas.app` if unset). Verify `https://networkninjas.app/sitemap.xml` and `/robots.txt` show the real domain.
5. **Supabase (later, when auth ships):** set Authentication → URL Configuration → Site URL to `https://networkninjas.app` and add it to the redirect allowlist. Not needed yet (auth is deferred).

## Auth (GitHub sign-in + progress sync)
Optional but live: GitHub OAuth with cross-device progress sync (see `docs/plans/github-auth-progress-sync.md`). Anonymous browsing keeps working; signing in just syncs progress. Setup (do once, against the real domain):

1. **GitHub** → Settings → Developer settings → **OAuth Apps** → New. Authorization callback URL = `https://<your-project-ref>.supabase.co/auth/v1/callback` (the ref is the subdomain of `NEXT_PUBLIC_SUPABASE_URL`). Copy the **Client ID** and generate a **Client Secret**.
2. **Supabase** → Authentication → **Providers → GitHub** → enable, paste the Client ID + Secret.
3. **Supabase** → Authentication → **URL Configuration** → Site URL = `https://networkninjas.app`; add Redirect URLs `http://localhost:3000/**` and `https://networkninjas.app/**`.
4. **Supabase** → SQL Editor → run `supabase/migrations/0002_progress.sql` (creates the `progress` table + RLS so each user reads/writes only their own rows).
5. **Vercel** → Environment Variables → add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the `sb_publishable_...` key) for Production, then redeploy. (`NEXT_PUBLIC_*` is inlined at build, so it must be present at build time.)

Verify: sign in with GitHub (avatar appears in the header), mark a unit complete → a row appears in `progress` (only your rows, via RLS); sign in on another browser → progress follows you. The secret key must stay absent from the client bundle: `grep -r sb_secret_ web/.next/static` returns nothing.

## After it's live
- **Auto-deploys:** every push to `main` redeploys; PRs get preview URLs. Re-pushing content changes re-runs the build (content is read at build, so new lessons need a redeploy to appear).
- **Rollback:** Vercel → Deployments → pick a previous one → "Promote to Production."

## Known considerations
- **Supabase free-tier pausing:** free projects pause after ~1 week of no activity; the first request after a pause is slow until it wakes. Low-traffic risk only — mitigate with a keep-alive ping or upgrade to Pro ($25/mo) when there's steady traffic.
- **Content updates require a redeploy** (it's baked at build time) — this is intended; the curriculum is versioned in git.
- **Phase 2 (auth/progress)** will add `@supabase/ssr` + middleware; it doesn't change this deploy model (pages stay static with the offline-first plan).
