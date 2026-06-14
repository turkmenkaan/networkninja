# Pre-Public-Launch Preflight (NetworkNinjas)

A readiness checklist for taking NetworkNinjas public. Status: planning only,
nothing here is implemented yet.

## Context

NetworkNinjas (Next.js 14 in `web/`, content in `content/`, Vercel + Supabase) is a working Tier-1 product: 3 of 5 BGP Fundamentals modules are content-complete (17 units, 7 labs), email signup works, diagrams are all components, analytics is wired. It has never been exposed publicly, and an audit found gaps in correctness, legal, security, SEO, ops, and resilience.

**Launch posture (decided):**
- **Tier 1 only** (learners run labs locally with Containerlab). No hosted labs.
- **Partial content**: launch with Foundations + eBGP + iBGP; Path Attributes + Route Filtering shown as "coming soon."
- **Auth live at launch**: ship GitHub sign-in + cross-device progress sync (see `docs/plans/github-auth-progress-sync.md`).

---

## P0 - Blockers (must be done before going public)

1. **Verify all 7 published labs on real FRR.** The #1 credibility risk: configs and `tasks.yaml` assertions are *schema-derived, never run*. Deploy each lab via Containerlab, confirm every objective's output matches the lab text, fix any config/JSON-path bugs, and flip `docs/verification/` from PARTIAL to PASS. Labs: `bgp-observe-a-session`, `bgp-ebgp-peering`, `bgp-advertising-routes`, `bgp-ebgp-capstone`, `bgp-ibgp-peering`, `bgp-next-hop-self`, `bgp-ibgp-capstone`. Highest-risk assertions: loopback peer keys, `paths[].nexthops[].ip` (next-hop-self), the capstone transit AS_PATH strings.

2. **Real domain + production URLs.** Acquire the domain; add it in Vercel (HTTPS auto). Update `metadataBase` in `web/src/app/layout.tsx` (currently `networkninja.local`, which breaks canonical/OG). Set Supabase **Site URL** + redirect allowlist to the domain (also required by auth).

3. **GitHub auth + offline-first progress sync.** Execute `docs/plans/github-auth-progress-sync.md` (`@supabase/ssr`, browser/SSR clients, `web/src/middleware.ts`, `/auth/callback`, header `AuthButton`, `SessionBridge`, the `progress` table + RLS migration, the `progressStore` OR-merge). Depends on the domain (GitHub OAuth app + Supabase provider config). Keep pages static (client-side auth read).

4. **Legal + consent.** Add Privacy Policy + Terms pages (e.g. `web/src/app/legal/{privacy,terms}/page.tsx`), link them in `SiteFooter.tsx`. Add a privacy/consent line + policy link to the email form (`web/src/components/NotifySignup.tsx`, which currently only says "No spam"). Because **auth sets cookies**, add a short cookie notice. A contact/support email.

5. **Abuse protection on public endpoints.** `web/src/app/api/subscribe/route.ts` is unprotected (only an email regex) - public exposure invites DB spam and bot signups. Add rate limiting + a hidden honeypot field in `NotifySignup`. Confirm the auth flow has no equivalent open write path.

6. **Supabase free-tier pause mitigation.** A free project pauses after ~1 week idle; once auth is live, a paused DB breaks sign-in *and* progress, not just signups. Add a keep-alive (a tiny scheduled ping) **or** upgrade to Pro ($25/mo). Decide before launch.

7. **Security headers + dependency posture.** Add standard headers via `web/next.config.mjs` `headers()` (or middleware): CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS. Make a documented call on the residual Next 14.2.x advisories: bump to a patched/newer Next (15/16 is a separate, tested upgrade) or accept with rationale (most advisories cover features this app doesn't use).

8. **Partial-path polish.** Make the two "coming soon" modules read as intentional and growing (keep the email "get notified" hook prominent). Verify no dead links to unbuilt units, and that a learner finishing iBGP lands on a clear "more coming, subscribe" state, not a void.

---

## P1 - Important (do around launch)

- **SEO files:** `web/src/app/robots.ts`, `web/src/app/sitemap.ts` (home + paths + published units), an OG image (static `opengraph-image` or dynamic), favicon/app icons (`app/icon`), a web manifest.
- **Error resilience:** `web/src/app/error.tsx` + `global-error.tsx`, and graceful failure UI for the signup/auth calls. (404 already exists.)
- **CI guardrail:** a GitHub Actions workflow running `next build` + a **content-integrity lint** on PRs: every manifest unit resolves to files, lessons vs labs have the right file set, every `tasks.yaml` objective has both `display_command` and `check`, `prerequisites` ids exist (acyclic), image tag is `v8.4.1`, and **no em dashes**. High value since content is agent-authored and easy to regress.
- **Monitoring:** error tracking (Sentry) + an uptime monitor (so a paused Supabase / down site is noticed).
- **A11y + mobile QA pass:** skip-to-content link, run Lighthouse/axe on home/path/unit, verify mobile layout and diagram responsiveness.

---

## P2 - After launch

- Build the remaining 2 modules (**Path Attributes**, **Route Filtering**) - the "coming soon" promise.
- **Email program hygiene before the first send:** double opt-in + an unsubscribe route (CAN-SPAM / GDPR) - not needed to *capture* emails, required before you *email* them.
- Product analytics events (lab downloads, sign-ins, unit completions).
- Tier-2 hosted labs (the large future effort; a separate Go control plane).

---

## Verification (the launch-readiness gate)
- **Labs:** all 7 deploy on real FRR and every objective passes; `docs/verification/` says PASS.
- **Build/SEO:** `cd web && npm run build` green and still static (`○`/`●`); `robots`/`sitemap` resolve; social preview renders with the real domain (OG image + correct `metadataBase`).
- **Auth:** sign in/out works on the production domain; progress syncs across two browsers; RLS verified (a user can't read another's `progress` rows); secret key absent from the client bundle.
- **Legal/abuse:** privacy + terms pages live and linked; consent line on the form; rate-limit test on `/api/subscribe`; security headers green on securityheaders.com.
- **Ops:** Supabase keep-alive/Pro active; uptime + error monitors reporting; custom domain HTTPS valid.

## References
- Auth implementation detail: `docs/plans/github-auth-progress-sync.md`
- Deploy steps + Vercel/Supabase setup: `DEPLOY.md`
- Lab verification status: `docs/verification/bgp-labs-verification.md`
