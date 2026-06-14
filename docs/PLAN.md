# NetworkNinjas — Project Plan

A website offering networking education + hands-on labs (Containerlab-based), starting with BGP. Begins as a personal learning tool, evolves into a public, monetizable platform.

---

## 1. Feasibility & Strategy

Containerlab is a Linux tool that spins up real network OS containers wired together with virtual links. It needs a Linux host with Docker, elevated/privileged permissions, and real CPU/RAM per node. **None of that runs in a browser**, so the central design question is always: *who runs the actual lab?*

### Three delivery tiers

| Tier | Who runs the lab | Cost | Effort | Notes |
|------|------------------|------|--------|-------|
| **Tier 1** | User runs locally | ~$0 (static site) | Low–Med | Site hosts content + downloadable `.clab.yml`. User installs Containerlab themselves. **Start here.** |
| **Tier 2** | We host, one-click in-browser | Real $$ + ops | High | Per-session isolated sandbox + web terminal. This is a real product. |
| **Tier 3** | Hybrid | — | — | Launch Tier 1, design so flagship labs can graduate to Tier 2 later. |

### Chosen path
- **v1 = Tier 1.** Audience initially just the author; eventually public + monetized.
- **Architect Tier 1 so Tier 2 is an addition, not a rewrite.**
- **Content first, compute last.** Do not build the lab runner until real labs exist and there are users.

### Key constraint: image licensing
Standardize on **free, redistributable** network OS images: **FRR**, **Nokia SR Linux**, BIRD, VyOS, Arista cEOS (free but registration-gated). Avoid anything that can't be legally hosted (most Cisco/Juniper images). For BGP specifically: **FRR + SR Linux** are excellent and fully legit. This constraint should shape which labs get authored now.

---

## 2. Architecture

### Tier 1 (ship first)
- **Frontend:** Next.js, content-driven, cheap to host (Vercel/Cloudflare).
- **Content as files in git** (MDX + YAML). Git *is* the CMS while it's just the author.
- **Auth + DB from day one anyway:** `users`, `labs`, `progress` schema — so Tier 2 + monetization slot in without migration. Postgres (Supabase/Neon).
- **Per-lab deliverable:** lesson page, topology diagram, downloadable `.clab.yml`, copy-paste verification commands.

### Tier 2 (design now, build later)
- **Isolation boundary is the key early decision.** Default: **VM-per-session** (Firecracker microVMs or cloud VM per user) — strong isolation for privileged container workloads from untrusted users.
- **Orchestration:** control plane that, on "Start lab," boots a sandbox, runs `containerlab deploy`, exposes a **web terminal (ttyd/Wetty over WebSocket)** + topology view to the browser.
- **Session lifecycle is the whole economic game:** idle timeouts, max duration, hard RAM caps, one-active-lab-per-user.
- **Images:** FRR + Nokia SR Linux only (free/redistributable).

### Monetization shape
- **Free:** read lessons, download topologies, run locally (Tier 1).
- **Paid:** one-click hosted labs, progress tracking, auto-graded objectives (Tier 2).
- Compute = the paid feature, which is also the main cost → economics line up.
- Keep `users` / `progress` / `subscription` schema from the start so paywalling is a flag, not a refactor.

---

## 3. Content Model

The **lab + lesson library is the durable, compounding asset.** Design it as structured data independent of delivery.

### Taxonomy (three levels, no more)
```
Path  →  Module  →  Unit
```
- **Path** — a full journey, e.g. "BGP from Zero to Production." The sellable thing.
- **Module** — a coherent chunk, e.g. "eBGP Fundamentals."
- **Unit** — the atomic piece. A unit is **either** a *lesson* (theory) **or** a *lab* (hands-on). Same primitive, a `type` field distinguishes them. Progress = "which units are complete."

### Module rhythm
Every module follows: **theory → guided practice → blank-slate proof.**
```
Module: eBGP Fundamentals
  ├─ lesson:  what-is-an-as            (theory)
  ├─ lesson:  ebgp-vs-ibgp            (theory)
  ├─ lab:     ebgp-peering   [guided]
  ├─ lab:     advertising-routes [guided]
  └─ lab:     ebgp-capstone   [challenge]   ← blank slate, "prove you got it"
```
Soft rule: **every module needs at least one `challenge` lab to close it.**

### Unit directory schema

Lesson unit:
```
units/bgp-what-is-an-as/
  meta.yaml
  content.mdx
```

Lab unit:
```
units/bgp-01-ebgp-peering/
  meta.yaml
  content.mdx          # teaching walkthrough
  topology.clab.yml    # containerlab topology
  configs/             # per-node startup configs
  tasks.yaml           # objectives + verification
  solution/            # answer-key configs + solution.mdx
```

`meta.yaml`:
```yaml
id: bgp-01-ebgp-peering
type: lab                  # lab | lesson
title: "Your First eBGP Peering"
summary: "Bring up an eBGP session between two autonomous systems."
difficulty: beginner       # beginner | intermediate | advanced
estimated_minutes: 30
prerequisites: [bgp-what-is-an-as, bgp-tcp-179]   # other unit ids → dependency graph
tags: [bgp, ebgp, frr]
mode: guided               # guided | challenge   (labs only)
runtime:                   # ignored in Tier 1, consumed in Tier 2
  nodes: 2
  est_ram_mb: 768
  images: [frrouting/frr]
  est_boot_seconds: 20
status: published          # draft | published
version: 1
```
`prerequisites` across all units forms a **dependency graph** that drives ordering, unlocks, and "what's next" — derived, not hand-maintained.

### Lab modes
- **`guided`** — nodes boot partially configured (base connectivity present, protocol config to complete), stepwise tasks, hints inline.
- **`challenge`** — blank slate: nodes boot with only base addressing. Same `tasks.yaml`, pure objectives, hints collapsed/hidden. The capstone.
- Challenge mode is the **same schema with emptier `configs/`** — the grader is identical.

### Verification model (most important part)
**Prefer structured JSON output over regex on CLI text** (brittle). FRR: `vtysh -c "... json"`. SR Linux: JSON/gNMI native. A check = run command on a node, parse JSON, assert on a field.

`tasks.yaml`:
```yaml
objectives:
  - id: session-established
    description: "eBGP session between r1 and r2 is Established"
    check:
      node: r1
      command: "vtysh -c 'show ip bgp summary json'"
      parse: json
      assert:
        path: "$.ipv4Unicast.peers['10.0.0.2'].state"
        equals: "Established"
    hint: "Did you configure the right remote-as? eBGP needs different AS numbers."
```
- **Tier 1:** rendered as a checklist with commands shown; learner self-verifies.
- **Tier 2:** identical file becomes the auto-grader — zero rework.
- ~5 `assert` operators (`equals`, `contains`, `exists`, `greater_than`) cover ~90% of checks.
- **Checks must be idempotent and read-only** — observe state, never change it.

### Theory ↔ labs
Lessons hold concepts; labs reference them via `prerequisites` and deep-link back. **Capturing current BGP study in this format = content production.**

---

## 4. Sequence

1. Nail the lab content format on 1 lab.
2. Author 3–5 BGP labs in that format (also = studying).
3. Build the Tier 1 site that renders them, with auth + progress schema already in place.
4. Use it, then soft-launch publicly to build an audience.
5. Add Tier 2 for flagship labs once demand justifies the compute.

---

## 5. Decisions Locked

- **Content format:** MDX, kept light (components only where they earn it).
- **Diagrams:** reusable MDX components (`<ASTopology>`, `<MessageTimeline>`, …) in
  `web/src/components/diagrams/`. No ASCII or hand-rolled inline SVG in content.
- **Unit types:** lessons + labs only. No quiz type (plenty exist online).
- **Lab modes:** guided throughout + one blank-slate `challenge` capstone per module.
- **Images:** FRR + Nokia SR Linux.

---

## 6. Review Items (revisit later)

1. ~~**Diagrams** — Containerlab-generated now; revisit hand-authored for teaching clarity.~~
   **Resolved.** Diagrams are authored as reusable MDX React/SVG components
   (`<ASTopology>`, `<MessageTimeline>`) in `web/src/components/diagrams/`, registered in
   `web/src/components/Mdx.tsx`, and styled with the design tokens. Add new shapes as new
   components there. (Possible future addition: auto-generating lab topology graphs from
   `topology.clab.yml` — not yet needed.)
