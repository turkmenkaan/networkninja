---
name: network-ninja-module-creator
description: >
  Author new curriculum content for NetworkNinjas, the hands-on networking-education
  platform. Use whenever creating, scaffolding, or expanding learning content (paths,
  modules, lessons, or Containerlab/FRR labs) so it follows the established content
  model, directory layout, FRR/Containerlab conventions, tasks.yaml verification schema,
  content style, and the parallel-agent build workflow. Trigger on requests like
  "create a new module", "add a BGP/OSPF/etc. unit", "scaffold a lab", or "expand the
  curriculum".
---

# NetworkNinjas Module Creator

This skill encodes how content is authored for NetworkNinjas so every new module matches
the existing ones. Read it fully before authoring, then follow the workflow.

**Authoritative context to skim first (do not duplicate it here, it can drift):**
- `docs/PLAN.md`: the full content model, verification model, and architecture.
- `content/README.md`: directory conventions.
- `docs/curriculum/<path>.md`: the human-readable curriculum outline for the path you're extending.
- **The canonical reference units (clone their shape and quality):**
  - Lesson: `content/units/bgp-why-bgp-exists/`
  - Guided lab: `content/units/bgp-ebgp-peering/`
  - Observation lab (boots pre-configured): `content/units/bgp-observe-a-session/`

---

## 1. The content model (quick reference)

**Taxonomy (three levels, no more):** `Path → Module → Unit`.

- **Path**: a full journey (e.g. "BGP Fundamentals"). The sellable thing.
- **Module**: a coherent chunk (e.g. "eBGP Fundamentals").
- **Unit**: the atomic piece. A unit is **either** a `lesson` (theory) **or** a `lab` (hands-on).

**Units are flat and id-keyed**, not nested under paths:

```
content/
  paths/<path-id>.yaml          # manifest: ordered modules -> unit ids, each with a status
  units/<unit-id>/              # every unit, keyed by a stable kebab-case id
    meta.yaml                   # the spine (always)
    content.mdx                 # teaching content (always)
    # labs only:
    topology.clab.yml
    configs/                    # GUIDED starting state (+ shared daemons)
    tasks.yaml                  # objectives + read-only JSON verification
    solution/                   # answer key (solution.mdx [+ per-node configs])
```

A path manifest references units **by id**; ordering and unlocks are derived from each
unit's `prerequisites`, not from position. The same unit could be reused across paths.

**Module rhythm:** `theory → guided practice → blank-slate proof`. Every module that has
labs should **close with at least one `challenge` (blank-slate) capstone**. Purely
conceptual modules (like Foundations) may have no challenge lab; an observation lab is
an acceptable closer instead.

---

## 2. Workflow for creating a module

### Step 1: Plan the module
- Add/confirm the module in `docs/curriculum/<path>.md` (human-readable outline): list its
  units with stable `bgp-...`-style ids, each tagged L (lesson) / G (guided) / C (challenge),
  a one-line description, and the module's learning objectives.
- Sequence units so `prerequisites` form a clean chain (1.1→1.2→…). Theory before the lab
  that exercises it.

### Step 2: Author the units (parallel agents)
For a full module, **spin out one general-purpose agent per unit, in parallel** (this is the
proven workflow and what the user expects for batches). Each agent prompt MUST:
- Point the agent at the authoritative context (Step 0 files above) **and the matching
  canonical reference unit** to clone for shape/quality.
- Give the exact `meta.yaml` field values (see §3), the unit's learning objectives, and the
  specific technical points to cover (be precise; these are educational and accuracy matters).
- For labs: specify topology, addressing, AS numbers, FRR conventions (§4), the `tasks.yaml`
  objectives + JSON assertions (§5), and the guided-vs-challenge starting state.
- Restate the content style rules from §7, notably: **no em dash (`—`) characters**, and use
  the diagram components rather than ASCII or hand-rolled SVG.
- **CRITICAL COORDINATION RULES** (put these in every agent prompt):
  - Work ONLY inside `content/units/<that-unit-id>/`.
  - Do **NOT** edit `content/paths/<path>.yaml`; the parent updates the manifest afterward,
    so concurrent agents never collide on that shared file.
  - Do not run git. Do not run docker/containerlab (verification is a separate pass).
  - Report a one-paragraph summary, and for labs flag any JSON-path assumptions to confirm
    during verification.

For a single unit, just author it directly instead of spawning an agent.

### Step 3: Update the path manifest (parent only)
After the agents finish, **you** (not the agents) flip the new units in
`content/paths/<path>.yaml` from `status: planned` → `status: published`. Doing this from one
place is what prevents write conflicts during the parallel build.

### Step 4: Verify labs
Run the verification pass on any new labs (see §6). Confirm the FRR session/route state and
that every `tasks.yaml` JSON path matches real FRR output; fix assertions in place. Record
results in `docs/verification/`.

### Step 5: Quick sanity check
`find content/units/<new-ids> -type f` to confirm every expected file landed, and that
lessons have exactly `meta.yaml` + `content.mdx` while labs have the full set.

---

## 3. `meta.yaml` schema

**Lesson** (no `mode`, no `runtime`, no topology):
```yaml
id: bgp-autonomous-systems
type: lesson
title: "Crisp, engaging title"
summary: "One sentence."
path: bgp-fundamentals
module: foundations
difficulty: beginner          # beginner | intermediate | advanced
estimated_minutes: 12
prerequisites: [bgp-why-bgp-exists]   # other unit ids -> dependency graph
tags: [bgp, fundamentals, asn]
status: published             # draft | planned | published
version: 1
```

**Lab** adds:
```yaml
type: lab
mode: guided                  # guided | challenge
runtime:                      # ignored in Tier 1; consumed by the Tier 2 runner
  nodes: 2
  est_ram_mb: 512
  images: [frrouting/frr]
  est_boot_seconds: 20
```

- **`guided`**: nodes boot partially configured (base addressing present, protocol config to
  complete); stepwise tasks; hints shown inline.
- **`challenge`**: blank slate, only base addressing. **Same `tasks.yaml`**, pure objectives,
  hints collapsed. It's the same schema with emptier `configs/`; the grader is identical.

---

## 4. FRR & Containerlab conventions

- Image: **`frrouting/frr:v8.4.1`** (pinned, for reproducibility). `kind: linux`.
  **Verify any image tag actually exists before pinning it** — check the registry, e.g. the
  Docker Hub tags API `https://hub.docker.com/v2/repositories/frrouting/frr/tags/`. Never
  invent a plausible-looking version: `frrouting/frr` tops out at `v8.4.1` (note the `v`
  prefix), and a made-up tag like `9.1.0` fails `containerlab deploy` with `not found`. Same
  rule for any external dependency (package versions, etc.): confirm against the real source.
- **`frr defaults traditional`**: keeps `bgp default ipv4-unicast` ON, so a single
  `neighbor <ip> remote-as <asn>` (and `network <prefix>`) auto-activates IPv4-unicast. This
  keeps beginner configs short. (Later modules may move to the `datacenter` profile with
  explicit `address-family` blocks; that's a deliberate progression, not an inconsistency.)
- **Shared `configs/daemons`** bound into every node (`zebra=yes`, `bgpd=yes`, rest `no`). Copy
  it verbatim from `content/units/bgp-ebgp-peering/configs/daemons`. Enable other daemons
  (e.g. `ospfd=yes`) when a lab needs an IGP underlay.
- Bind per-node config: `configs/<node>/frr.conf:/etc/frr/frr.conf` and the shared
  `configs/daemons:/etc/frr/daemons`.
- **eBGP peers on interface addresses.** Loopback peering needs an IGP underlay (OSPF) and
  belongs in iBGP modules; don't introduce it before then.
- **eBGP route exchange needs `no bgp ebgp-requires-policy`.** FRR enforces RFC 8212 by
  default (even under `frr defaults traditional`): an eBGP peer with no in/out policy has its
  routes filtered and shows `(Policy)` in `show ip bgp summary` instead of a prefix count. Any
  lab where routes must flow over eBGP needs `no bgp ebgp-requires-policy` under `router bgp`.
  Teach real policy / RFC 8212 in the route-filtering module.
- Topology `name:` sets container names: `clab-<name>-<node>` (e.g. `clab-bgp-ebgp-peering-r1`).
- Convention used so far: r1=AS 65001 (eth1 .1, lo 1.1.1.1/32), r2=AS 65002 (eth1 .2,
  lo 2.2.2.2/32), link subnet 10.0.12.0/24. Extend the pattern consistently for more nodes.
- **Guided** starting configs include base addressing + a `! TODO:` marker where the learner
  adds config. The full answer goes in `solution/<node>/frr.conf`. **Challenge** starting
  configs strip protocol config down to addressing only.
- **Every lab requires the `lab-environment-setup` lesson.** Add `lab-environment-setup` to the
  lab's `meta.yaml` `prerequisites`. The web app automatically renders a Containerlab setup
  notice on lab pages (`web/src/components/LabRequirement.tsx`): prominent on the path's first
  lab, compact on later ones. So do **not** hand-write Docker/Containerlab install instructions
  in lab content; the dedicated setup lesson and that notice cover it.

---

## 5. `tasks.yaml` verification schema

Checks **run a command on a node, parse JSON, and assert on a field.** Prefer JSON output
(`vtysh -c '... json'`) over regex on CLI text; it's robust to whitespace/ordering. Checks
must be **read-only and idempotent** (observe state, never change it). In Tier 1 they render
as a self-verify checklist; in Tier 2 the identical file is the auto-grader.

```yaml
objectives:
  - id: ebgp-session-established
    description: "The eBGP session from r1 to r2 (10.0.12.2) reaches Established."
    # display_command = what the LEARNER runs (full docker exec, human-readable
    # output). The Tier-1 checklist shows this, NOT the JSON `check` below.
    display_command: "docker exec -it clab-<lab-name>-r1 vtysh -c 'show ip bgp summary'"
    check:                                  # JSON + assert for the Tier-2 auto-grader
      node: r1
      command: "vtysh -c 'show ip bgp summary json'"
      parse: json
      assert:
        path: "$.ipv4Unicast.peers['10.0.12.2'].state"
        equals: "Established"
    hint: "eBGP peers are in different ASes; remote-as must match the OTHER router's AS."
```

Every objective needs **both**: a `display_command` (the real `docker exec ... vtysh -c '...'`
the learner runs, matching the lab's deploy/exec instructions, no `json`) and a `check` (the
`json` command + `assert` the future auto-grader runs). The learner-facing UI shows only the
`display_command`.

**FRR BGP JSON paths (schema-derived; verify on a real deploy):**
- Session state: `show ip bgp summary json` → `$.ipv4Unicast.peers['<peer-ip>'].state` == `"Established"`.
- Learned route + AS_PATH: `show ip bgp <prefix> json` → best-path-first `paths[]` array; each
  path has `aspath.string`. Assert `$.paths[0].aspath.string` **contains** the origin ASN.

**Assert operators:** `equals`, `contains`, `exists`, `greater_than` (covers ~90% of checks).
For any NEW command's JSON shape, mark the assertion as TO-CONFIRM and verify it in the
verification pass before relying on it.

---

## 6. Verifying labs

Goal: prove the FRR configs work (session Established, expected routes learned) and that every
`tasks.yaml` JSON path matches real output. Containerlab needs Linux netns/veth; it works
inside Docker Desktop's Linux VM but not natively on macOS. If Containerlab can't run, fall
back to plain Docker (two `frrouting/frr:v8.4.1` containers on a user bridge) to validate the
same things. If no runtime is reachable (e.g. a restricted sandbox), do static + schema review
and document what's blocked plus the exact commands to finish on a Linux+Docker host. Always
tear down created containers/networks. Write results to `docs/verification/`.

**Honesty rule:** never label configs or `tasks.yaml` assertions "confirmed" or "verified"
unless they were actually run through a live FRR and observed. Until a real deploy passes,
they are *schema-derived* — say exactly that (in the `tasks.yaml` comments and the report) and
flag them as needing a real run. A clean static/schema review is **PARTIAL**, not **PASS**.

```bash
cd content/units/<unit-id>
containerlab deploy -t topology.clab.yml
docker exec -it clab-<name>-r1 vtysh -c 'show ip bgp summary json'
containerlab destroy -t topology.clab.yml
```

---

## 7. Content style (`content.mdx`)

- **Punctuation: never use the em dash (`—`) character** anywhere in content (prose, captions,
  labels, headings, component props). Use a comma, colon, parentheses, or a hyphen (`-`)
  instead. Also avoid the en dash (`–`); use a hyphen for ranges, e.g. `700-1100`.
- **Light MDX**: mostly markdown; reach for components only where they earn it (diagrams are
  the main sanctioned use).
- Engaging, **second-person**, confident, lightly playful (the "ninja" angle). Match the
  reference units' voice.
- **Diagrams: use the reusable MDX diagram components, not ASCII or hand-rolled inline SVG.**
  They live in `web/src/components/diagrams/` and are registered in `web/src/components/Mdx.tsx`,
  so authors call them by name in `content.mdx`:
  - `<ASTopology>`: autonomous-system / router topologies. Place nodes on a `col`/`row` grid
    and connect them with `links`; supports `eyebrow`, `legend`, `caption`, `muted` nodes, and
    `faint` links. (See `content/units/bgp-why-bgp-exists/content.mdx` for a worked example.)
    Use `groups` to draw a labelled box around a set of node ids — e.g. one box per AS to show
    which routers live in which AS. Rule of thumb: when **any** AS in the topology has more than
    one router, box **all** ASes (single-router ones included) and drop the per-node `asn` so the
    box label carries the AS and you don't show it twice. If every AS has exactly one router,
    skip `groups`. (See `content/units/bgp-next-hop-self/content.mdx` for a worked example.)
  - `<MessageTimeline>`: "protocol chattiness over time" charts (`burst` / `flat` / `pulse`
    phases).
  - `<HierarchyTree>`: top-down tiered hierarchy / delegation trees (e.g. IANA -> RIRs ->
    operators, route-reflector hierarchies). Nodes carry a `tier`; `edges` connect them.
    (See `content/units/bgp-autonomous-systems/content.mdx` for a worked example.)
  - `<ASPathFlow>`: the AS_PATH itself. Pass `hops` (+ `prefix`, `showGrowingPath`) to show a
    prefix propagating and the path growing per hop; or pass `asPath` (+ `highlightIndex`,
    `rejectLabel`) to show an AS_PATH as ASN pills with a loop-rejection highlight.
    (See `content/units/bgp-path-vector/content.mdx` for both modes.)
  - `<StateMachine>`: vertical finite-state-machine diagrams (e.g. the BGP FSM). `states` carry
    a `row` and optional `lane` (1 = side/retry column); `transitions` connect them and route by
    geometry. (See `content/units/bgp-sessions-and-messages/content.mdx`.)

  `<ASTopology>` also takes `nodeShape="router"` to draw router glyphs instead of AS cards
  (used for device-level diagrams, e.g. `content/units/bgp-path-vector/content.mdx`).
  Props use the design tokens, so diagrams match the brand automatically. **Need a diagram shape
  that doesn't exist yet?** Add a new component under `web/src/components/diagrams/`, register it
  in the `Mdx.tsx` components map, then use it; do **not** embed raw `<svg>` or ASCII in content.
  Keep real CLI/config in fenced code blocks (those still render as terminal wells).
- **Lessons:** ~700-1100 words, clear section headers, a hook, accurate technical depth, and a
  "What's next" pointer to the next unit id.
- **Labs:** Scenario → topology diagram (`<ASTopology>`) → Deploy (`containerlab deploy` +
  `docker exec ... vtysh`) → guided steps with real commands → Verify (state the ✅ objective)
  → Troubleshooting → Tear down (`containerlab destroy`) → "What you learned" + "Next".
  Observation labs are framed as a guided *tour* of an already-running session, not a
  configuration task.

---

## 8. Definition of done (per module)
- [ ] Module + units listed in `docs/curriculum/<path>.md`.
- [ ] Each unit authored: lessons have `meta.yaml` + `content.mdx`; labs have the full set.
- [ ] `prerequisites` chain is correct and acyclic.
- [ ] Module closes with a `challenge` lab (or, for conceptual modules, an observation lab).
- [ ] Manifest `content/paths/<path>.yaml` updated to `published` (by the parent, not agents).
- [ ] New labs verified (or verification status documented in `docs/verification/`).
- [ ] No em dash (`—`) characters anywhere in the authored content.
- [ ] `find` sanity check confirms all files landed.
```
