# Plan: GitHub Auth + Offline-First Progress Sync (Supabase free tier)

> **Status: DEFERRED.** Approved and ready to implement, but parked until the site
> has a real domain. Reason: GitHub OAuth + Supabase redirect-URL/Site-URL config
> are easiest to set up once against the final domain (otherwise the callback
> allowlist has to be reconfigured when the domain changes). Nothing has been
> built yet; `@supabase/ssr` was installed during scoping and then removed.
> Decisions locked with the product owner: **auth + progress sync now**;
> **identity only** (nothing gated, all content stays free).

## Context

NetworkNinjas' web app (`web/`, Next.js 14 App Router) has no accounts: learner progress lives in `localStorage` (per-browser, anonymous) behind a backend-agnostic `progressStore`, and Supabase is used only for the email subscriber list (a server-only **secret** key in `web/src/lib/supabase/server.ts`). An earlier feasibility study chose **GitHub OAuth** + **offline-first progress sync** as the next phase; this is that implementation plan.

Goal: let users sign in with GitHub so progress follows them across devices, while keeping anonymous browsing fully working and pages statically rendered.

Two facts shape the design:
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is already in `web/.env.local`, "waiting for auth." The existing secret-key client (`server.ts`) is for subscribers only and stays untouched.
- Pages are fully static (SSG); the progress store reads client-side via `useSyncExternalStore`. So **auth and progress are read/written client-side** to preserve static rendering (no server component reads cookies for rendering).

---

## Approach

### A. GitHub auth (via `@supabase/ssr`)
Add `@supabase/ssr` and use the **publishable** key (never the secret key) for cookie-based sessions.
- `web/src/lib/supabase/client.ts` *(new)*: singleton browser client via `createBrowserClient(url, publishableKey)`.
- `web/src/lib/supabase/ssr-server.ts` *(new)*: `createServerClient` with `cookies` from `next/headers`, for the callback route + middleware. Separate from `server.ts` (secret/service, subscribers).
- `web/src/middleware.ts` *(new)*: refresh the session cookie each request (standard Supabase SSR middleware: `createServerClient` with `getAll`/`setAll`), matcher excluding static assets. Middleware refreshes cookies; it does NOT make pages dynamic (they stay SSG).
- `web/src/app/auth/callback/route.ts` *(new)*: OAuth return: read `code`, `exchangeCodeForSession(code)` (sets cookie), redirect to `next` (the page the user was on) or `/`.
- **Sign in**: a client control calls `supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: <origin>/auth/callback?next=<path> } })`. **Sign out**: `supabase.auth.signOut()`.
- `web/src/components/auth/AuthButton.tsx` *(new, "use client")*: uses the browser client's `getUser()` + `onAuthStateChange` to render "Sign in with GitHub" (GitHub icon) when signed out, or the GitHub avatar (`user.user_metadata.avatar_url`) + a sign-out action when signed in. Rendered in `SiteHeader.tsx` (right of the nav). **No `profiles` table**: read name/avatar from `user_metadata`.

### B. Offline-first progress sync
Keep the `progressStore` public API identical (so `MarkComplete`, `ObjectivesChecklist`, `PathProgress`, `UnitCompleteDot`, and `useProgress` are **unchanged**); add a Supabase layer inside it.
- **Schema** `supabase/migrations/0002_progress.sql` *(new)*: row-per-unit
  ```sql
  create table public.progress (
    user_id uuid not null references auth.users(id) on delete cascade,
    unit_id text not null,
    complete boolean not null default false,
    objectives jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now(),
    primary key (user_id, unit_id)
  );
  alter table public.progress enable row level security;
  -- select/insert/update/delete policies, all: auth.uid() = user_id
  ```
  RLS means the authenticated browser client reads/writes **only its own rows** directly, so **no `/api/progress` route is needed**.
- **Store changes** (`web/src/lib/progress/store.ts`): add `setSupabase(client)` + `setUser(userId | null)` and internal sync:
  - localStorage stays the always-on cache/offline layer (anonymous users unchanged).
  - On **sign-in** (or first load with a session): fetch the user's rows, **OR-merge** with local (`mergeProgress`: `complete = a || b`, objectives OR'd; monotonic, "complete wins"), set the store, upsert the merged result back to Supabase, persist to localStorage.
  - On **mutation** (`setUnitComplete`/`toggleObjective`): write localStorage always; if signed in, upsert that unit's row (fire-and-forget, tolerant of transient errors). `resetAll` also deletes the user's remote rows.
  - On **sign-out**: keep localStorage, stop remote writes.
- `web/src/components/auth/SessionBridge.tsx` *(new, "use client", mounted once in `layout.tsx`)*: wires `onAuthStateChange` to the store (`setSupabase` + `setUser` + merge-sync on `SIGNED_IN`, `setUser(null)` on `SIGNED_OUT`). Renders nothing.

### C. Keep it static
No server component reads the session for rendering. `AuthButton`/`SessionBridge` are client islands; home/path/unit pages stay `○`/`●` in the build. Verify this didn't change.

---

## Critical files
- New: `web/src/lib/supabase/client.ts`, `web/src/lib/supabase/ssr-server.ts`, `web/src/middleware.ts`, `web/src/app/auth/callback/route.ts`, `web/src/components/auth/AuthButton.tsx`, `web/src/components/auth/SessionBridge.tsx`, `supabase/migrations/0002_progress.sql`, plus a `GithubIcon` in `web/src/components/ui.tsx`.
- Edit: `web/src/lib/progress/store.ts` (add Supabase sync, **stable public API**), `web/src/components/SiteHeader.tsx` (render `<AuthButton/>`), `web/src/app/layout.tsx` (mount `<SessionBridge/>`), `web/package.json` (`@supabase/ssr`), `web/.env.example` + `DEPLOY.md` (publishable key now required + GitHub OAuth setup).
- Reuse / do NOT touch: `web/src/lib/supabase/server.ts` (secret/subscribers), `web/src/lib/progress/useProgress.ts` and all progress UI components (API stays stable), design tokens.

## Setup the owner must do (dashboards) — do this once the real domain exists
1. **GitHub** → Developer settings → OAuth Apps → New: Authorization callback URL = `https://<project-ref>.supabase.co/auth/v1/callback`. Copy Client ID + a Client Secret.
2. **Supabase** → Authentication → Providers → GitHub → enable, paste Client ID/Secret.
3. **Supabase** → Authentication → URL Configuration → set Site URL to the real domain; add redirect URLs `http://localhost:3000/**` and `https://<your-domain>/**`.
4. Run `supabase/migrations/0002_progress.sql` in the SQL editor.
5. Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to Vercel env (URL + secret already there).

## Verification
1. `cd web && npm install && npm run build` → green; route table still shows `○ (Static)` / `● (SSG)` (auth didn't force dynamic).
2. `npm run dev`: click **Sign in with GitHub** → GitHub consent → back signed in, avatar shows; sign out works.
3. Signed in, mark a unit complete + tick an objective → a row appears in Supabase `progress` (RLS: only your rows); reload persists from Supabase.
4. **Offline-first**: signed out in a fresh browser, complete a unit (localStorage); then sign in → local progress merges up (row appears, nothing lost). On a second browser, sign in → progress appears (merge down).
5. **Anonymous still works**: incognito, no sign-in, progress tracks in localStorage as before.
6. Secret key absent from client bundle (`grep -r sb_secret_ web/.next/static` → none); publishable key present (expected).

## Risks / notes
- **New API key format**: `@supabase/ssr` takes the publishable key as the apikey; the `sb_publishable_...` format is recent, so confirm it authenticates on the first real run (treat as verify-on-run, with the legacy anon key as fallback).
- **OAuth gotcha**: the GitHub OAuth app callback points at **Supabase** (`/auth/v1/callback`), not the app; the app's `/auth/callback` is where Supabase redirects back. The redirect-URL allowlist must include localhost and the real domain or sign-in fails. (This is the main reason to wait for the domain.)
- **Merge is monotonic** (OR / "complete wins"): progress only moves forward across devices; `resetAll` clears both local + remote for the signed-in user.
- **Free tier**: 50k MAU is ample; the main annoyance is project pausing after ~1 week idle (first request wakes it).
