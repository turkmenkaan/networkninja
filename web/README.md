# NetworkNinja — web (Tier 1)

The Next.js (App Router) frontend for **NetworkNinja**: a hands-on
networking-education platform. It renders the content library and tracks learner
progress. Read the theory, then boot real FRRouting labs with Containerlab.

This app is a **renderer** — it does not own content. The source of truth is the
sibling `../content` directory (path manifests + units). Nothing is copied; the
content is read from disk at build/request time.

## Run it

```bash
npm install      # install pinned deps
npm run dev      # dev server on http://localhost:3000
```

Production build:

```bash
npm run build    # next build (fully static — every page/route is prerendered)
npm run start    # serve the production build
```

## Where content comes from

By default the loaders read from `../content` (the repo's `content/` directory,
sibling to `web/`). Override the location with an env var:

```bash
CONTENT_DIR=/abs/path/to/content npm run build
```

The content schema (path manifests, unit `meta.yaml`, `content.mdx`,
`tasks.yaml`, `topology.clab.yml`, `solution/solution.mdx`) is documented in
`../content/README.md` and `../docs/PLAN.md`. Loaders live in
`src/lib/content/`.

## Route map

| Route                              | What it renders |
| ---------------------------------- | --------------- |
| `/`                                | Landing page. Brand moment + live stats pulled from `loadPath('bgp-fundamentals')`. |
| `/paths/[pathId]`                  | A learning path: modules and units **in order**, with type/difficulty/minutes badges, a **locked "coming soon"** state for `planned` units, and an overall **progress bar**. Static-generated from `listPathIds()`. |
| `/units/[id]`                      | A unit. Renders `content.mdx`; shows metadata, tags, prerequisite links, prev/next nav, and a **mark-complete** control. **Labs** also get a self-verify **objectives checklist**, a **Download topology** button, and a **reveal-solution** disclosure. Static-generated from `listUnitIds()`. |
| `/api/units/[id]/topology`         | Route handler that returns the unit's `topology.clab.yml` as a file download (`Content-Disposition: attachment`). 404 if the unit has no topology. |

## MDX pipeline

`src/components/Mdx.tsx` is a server component using `next-mdx-remote/rsc`:

- **remark-gfm** — tables, task lists, autolinks.
- **rehype-slug** — heading anchor ids.
- **rehype-pretty-code** (+ **shiki**) — syntax-highlighted fenced code blocks
  (CLI snippets, FRR configs). Token colors are themed to the terminal palette
  via `--shiki-*` CSS variables in `globals.css`.
- A custom components map styles headings/links/tables/inline-code. Fenced
  blocks with **no language** (the curriculum's ASCII topology diagrams) are
  lifted out of the highlighter into a dedicated `.nn-ascii` well.

`@tailwindcss/typography` (`prose prose-invert`) is the base; the component map
and `globals.css` refine it.

## Progress

Learner progress (unit completion + per-objective checkboxes) lives behind a
backend-agnostic abstraction in `src/lib/progress/`:

- `store.ts` — a `useSyncExternalStore`-compatible store. **Tier 1 persists to
  `localStorage`** and syncs across tabs.
- `useProgress.ts` — the React hook every progress UI consumes.

Pages stay server components; interactivity lives in small `"use client"`
islands (`MarkComplete`, `ObjectivesChecklist`, `SolutionReveal`, `PathProgress`,
`UnitCompleteDot`) that talk to the store.

> **Tier 2 (TODO):** swap the `localStorage` read/write in `store.ts` for
> `fetch()` calls to a Postgres-backed `/api/progress`, keyed on the
> authenticated user. The `ProgressState` shape maps 1:1 to the planned
> `progress` rows and the `subscribe()` contract is unchanged, so no UI edits
> are needed. No database/auth/payments exist in Tier 1 by design.

## Design system

"Midnight dojo / terminal" — deep ink canvas, warm paper text, one katana-steel
(`blade`) accent, sakura used sparingly, amber (`ember`) for "coming soon".
Tokens live in `tailwind.config.ts`; fonts (Bricolage Grotesque / Hanken Grotesk
/ JetBrains Mono) are wired in `src/app/layout.tsx`.
