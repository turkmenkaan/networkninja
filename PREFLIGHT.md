# Pre-Public-Launch Preflight (NetworkNinjas)

A readiness checklist for taking NetworkNinjas public. Refreshed to reflect current state.

## Context

NetworkNinjas (Next.js 14 in `web/`, content in `content/`, Vercel + Supabase) is deployed at **networkninjas.app**. All 5 BGP Fundamentals modules are content-complete (32 units, 14 labs), with OSPF and Production BGP paths stubbed as "coming soon." Auth, SEO, abuse protection, and analytics are shipped. The remaining gaps are lab correctness, legal, security headers, and ops.

## Done (since the original checklist)

- **Domain + production URLs** - networkninjas.app live; `metadataBase`/canonical/sitemap on the real domain. (Remaining dashboard step: set Supabase Site URL + redirect allowlist.)
- **GitHub auth + offline-first progress sync** - shipped (`@supabase/ssr`, middleware, `/auth/callback`, `progress` table + RLS, OR-merge). (Remaining: the one-time Supabase/GitHub OAuth dashboard config.)
- **SEO** - robots, sitemap, canonical, JSON-LD (Organization/WebSite/Course+`hasPart`/LearningResource/BreadcrumbList/FAQPage), per-page OG images, favicon, web manifest.
- **Abuse protection** - hidden honeypot + per-IP rate limit on `/api/subscribe`.
- **Analytics** - PostHog (client + server), identity tied to the Supabase user, key events wired.
- **All 5 modules built** (was P2).

## P0 - Blockers (before going fully public)

1. **Verify all 14 labs on real FRR.** Still the #1 risk: configs + `tasks.yaml` assertions are *schema-derived, never run*. `TODO.md` already notes a real one: `bgp-ibgp-peering` shows `1.1.1.1 (inaccessible)` / `invalid, internal` on r2 (an iBGP next-hop reachability problem). Deploy each lab via Containerlab, confirm every objective, fix config/JSON-path bugs, and record PASS in `docs/verification/`.
2. **Legal + consent.** Privacy Policy + Terms pages, footer links, a privacy/consent line + cookie notice on the signup form (cookies are now set by **both** auth and PostHog), and a contact email.
3. **Security headers + dependency posture.** CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS via `web/next.config.mjs` (which now also has a PostHog `/ingest` rewrite - add headers alongside it). CSP must allow the PostHog + Supabase origins. Document the Next 14.2.x advisory call (bump or accept-with-rationale).
4. **Supabase free-tier pause mitigation.** A paused DB now breaks sign-in *and* progress, not just signups. Add a keep-alive ping (a tiny scheduled hit) or upgrade to Pro.
5. **Partial-path polish.** All 5 modules are done, so verify a learner finishing the path lands on a clear "more paths coming, subscribe" state, the coming-soon paths read as intentional, and there are no dead links.

## P1 - Important (around launch)

- **Error resilience:** `web/src/app/error.tsx` + `global-error.tsx`, and graceful failure UI for the signup/auth calls.
- **CI guardrail:** a GitHub Actions workflow running `next build` + a content-integrity lint (every manifest unit resolves, labs vs lessons have the right file set, every `tasks.yaml` objective has both `display_command` and `check`, image tag `v8.4.1`, no em dashes).
- **A11y + mobile QA:** skip-to-content link; Lighthouse/axe pass on home/path/unit.
- **Monitoring:** PostHog now covers product analytics; still want error tracking (Sentry) + an uptime monitor.

## P2 - After launch

- **Email program hygiene before the first send:** double opt-in + an unsubscribe route (CAN-SPAM / GDPR).
- Build the **OSPF** and **Production BGP** paths (the "coming soon" promise).
- Tier-2 hosted labs (the large future effort).

## Verification (the launch-readiness gate)

- **Labs:** all 14 deploy on real FRR and every objective passes; `docs/verification/` says PASS.
- **Build/SEO:** `cd web && npm run build` green and still static; `robots`/`sitemap` resolve on networkninjas.app; per-page social previews render.
- **Auth:** sign in/out on the production domain; progress syncs across two browsers; RLS verified; secret key absent from the client bundle.
- **Legal/abuse/security:** privacy + terms live and linked; consent line on the form; rate-limit + honeypot tested; security headers green on securityheaders.com (with PostHog/Supabase allowed in CSP).
- **Ops:** Supabase keep-alive/Pro active; uptime + error monitors reporting; custom domain HTTPS valid.

## References
- Auth: `docs/plans/github-auth-progress-sync.md` · Deploy: `DEPLOY.md` · Lab verification: `docs/verification/`
