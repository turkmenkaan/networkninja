# Deploying NetworkNinja to Vercel

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
git commit -m "NetworkNinja: BGP Foundations content + web app + Supabase subscribers"
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

## After it's live
- **Custom domain** (optional): Project → Settings → Domains → add your domain, follow the DNS instructions.
- **Auto-deploys:** every push to `main` redeploys; PRs get preview URLs. Re-pushing content changes re-runs the build (content is read at build, so new lessons need a redeploy to appear).
- **Rollback:** Vercel → Deployments → pick a previous one → "Promote to Production."

## Known considerations
- **Supabase free-tier pausing:** free projects pause after ~1 week of no activity; the first request after a pause is slow until it wakes. Low-traffic risk only — mitigate with a keep-alive ping or upgrade to Pro ($25/mo) when there's steady traffic.
- **Content updates require a redeploy** (it's baked at build time) — this is intended; the curriculum is versioned in git.
- **Phase 2 (auth/progress)** will add `@supabase/ssr` + middleware; it doesn't change this deploy model (pages stay static with the offline-first plan).
