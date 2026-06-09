# Path: BGP Fundamentals

> Goal: take a learner from "what is BGP and why does it exist" to confidently configuring eBGP/iBGP, controlling path selection, and applying basic routing policy — all hands-on with FRR.

- **Prerequisites for the path:** comfort with IP addressing, subnets, and basic static/IGP routing concepts.
- **Network OS:** FRRouting (`frrouting/frr`).
- **Module rhythm:** theory → guided practice → blank-slate `challenge` capstone.
- **Out of scope (future "Advanced/Production BGP" path):** route reflectors, confederations, RPKI/security, multihoming & traffic engineering, route dampening, large-scale design.

Legend: `L` = lesson · `G` = guided lab · `C` = challenge lab

---

## Module 1 — BGP Foundations

*Build the mental model before touching config. Ends with an observation lab (read-only exploration of a working session).*

**Learning objectives:** explain why BGP exists and how it differs from IGPs; describe autonomous systems and ASN ranges; walk the BGP finite state machine; identify the four BGP message types.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 1.1 | `bgp-why-bgp-exists` | L | — | Routing the internet: IGP vs EGP, scale, policy, who runs BGP. |
| 1.2 | `bgp-autonomous-systems` | L | — | AS concept, public vs private ASNs, 16- vs 32-bit ASN ranges. |
| 1.3 | `bgp-path-vector` | L | — | Path-vector vs distance-vector/link-state; AS_PATH as loop prevention. |
| 1.4 | `bgp-sessions-and-messages` | L | — | TCP/179, neighbor relationship, Open/Update/Keepalive/Notification, the FSM (Idle→Connect→Active→OpenSent→OpenConfirm→Established). |
| 1.5 | `bgp-observe-a-session` | G | guided | A pre-built 2-router eBGP session boots **already up**. Learner explores `show ip bgp summary`, `show bgp neighbors`, watches states — pure observation, no config changes. |

---

## Module 2 — eBGP Fundamentals

*First real configuration. Bring up sessions between autonomous systems and advertise prefixes.*

**Learning objectives:** configure an eBGP neighbor; advertise prefixes via `network` statements and redistribution; verify session state and received routes; reason about the eBGP next-hop and AS_PATH behavior.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 2.1 | `bgp-ebgp-vs-ibgp` | L | — | The two flavors, AS-boundary rules, why they behave differently. |
| 2.2 | `bgp-advertising-prefixes` | L | — | `network` statement vs redistribution; what actually gets put in BGP. |
| 2.3 | `bgp-ebgp-peering` | G | guided | Two AS, base addressing pre-staged. Learner configures the eBGP session to Established. |
| 2.4 | `bgp-advertising-routes` | G | guided | Advertise local prefixes; verify they're received on the peer; inspect AS_PATH and next-hop. |
| 2.5 | `bgp-ebgp-capstone` | C | challenge | **Blank slate:** 3 autonomous systems, only IP addressing present. Learner builds full eBGP reachability across all three and advertises each AS's prefix. |

---

## Module 3 — iBGP Fundamentals

*The harder half. Why iBGP exists, the full-mesh requirement, next-hop and IGP interaction.*

**Learning objectives:** explain why iBGP is needed and why it has no AS_PATH loop protection inside an AS; describe the iBGP full-mesh rule and split-horizon; configure loopback-based peering over an IGP; fix next-hop reachability with `next-hop-self`.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 3.1 | `bgp-why-ibgp` | L | — | Carrying external routes across a transit AS; the iBGP split-horizon rule. |
| 3.2 | `bgp-ibgp-full-mesh` | L | — | Why iBGP needs a full mesh; the n(n-1)/2 scaling problem (motivates route reflectors later). |
| 3.3 | `bgp-loopback-peering-and-igp` | L | — | Peering on loopbacks for resilience; why you need an IGP underneath. |
| 3.4 | `bgp-ibgp-peering` | G | guided | Loopback-to-loopback iBGP over an OSPF underlay; verify sessions over loopbacks. |
| 3.5 | `bgp-next-hop-self` | G | guided | Diagnose unreachable iBGP next-hops; apply `next-hop-self`; confirm route installation. |
| 3.6 | `bgp-ibgp-capstone` | C | challenge | **Blank slate:** a transit AS with 3 internal routers + 2 eBGP edges. Learner builds the IGP underlay, full-mesh iBGP, and passes an external prefix end-to-end. |

---

## Module 4 — Path Attributes & Best-Path Selection

*The heart of BGP. Understand the attributes and the decision algorithm, then steer traffic with them.*

**Learning objectives:** categorize attributes (well-known mandatory/discretionary, optional transitive/non-transitive); walk the BGP best-path selection algorithm in order; influence inbound/outbound path choice with LOCAL_PREF, AS_PATH prepending, MED, and weight.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 4.1 | `bgp-attribute-types` | L | — | The attribute taxonomy and what "transitive" means on the wire. |
| 4.2 | `bgp-as-path-and-next-hop` | L | — | AS_PATH and NEXT_HOP in best-path and loop prevention. |
| 4.3 | `bgp-local-pref-and-med` | L | — | LOCAL_PREF (outbound, AS-wide) vs MED (inbound hint to a neighbor AS). |
| 4.4 | `bgp-weight-and-origin` | L | — | Cisco/FRR weight (local-only) and the origin code tie-breaker. |
| 4.5 | `bgp-best-path-algorithm` | L | — | The full decision tree, top to bottom, with worked examples. |
| 4.6 | `bgp-influence-local-pref` | G | guided | Prefer one exit over another for outbound traffic using LOCAL_PREF. |
| 4.7 | `bgp-as-path-prepend` | G | guided | Make a path less attractive inbound via AS_PATH prepending. |
| 4.8 | `bgp-med-and-tiebreakers` | G | guided | Use MED and walk down to the lower-order tie-breakers. |
| 4.9 | `bgp-path-selection-capstone` | C | challenge | **Blank slate:** dual-homed AS with two upstreams. Learner engineers specified inbound *and* outbound traffic patterns using the right attributes. |

---

## Module 5 — Route Filtering & Policy

*Control what you advertise and accept. The basics every operator needs.*

**Learning objectives:** filter prefixes with prefix-lists; build route-maps for match/set policy; tag and act on BGP communities; apply inbound/outbound policy to a neighbor.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 5.1 | `bgp-prefix-lists` | L | — | Prefix-lists, `le`/`ge` matching, applying them per-neighbor. |
| 5.2 | `bgp-route-maps` | L | — | Route-map structure: match + set, sequencing, default deny. |
| 5.3 | `bgp-communities` | L | — | Communities as tags; well-known communities; policy at scale. |
| 5.4 | `bgp-filter-with-prefix-lists` | G | guided | Permit/deny specific prefixes inbound and outbound; verify the effect. |
| 5.5 | `bgp-route-maps-and-communities` | G | guided | Tag routes with communities and act on them in a route-map. |
| 5.6 | `bgp-policy-capstone` | C | challenge | **Blank slate:** implement a stated peering policy (advertise only customer routes, tag-and-filter on communities) across an AS boundary. |

---

## Path summary

| Module | Lessons | Guided labs | Challenge labs |
|--------|:-------:|:-----------:|:--------------:|
| 1 — Foundations | 4 | 1 | 0 |
| 2 — eBGP Fundamentals | 2 | 2 | 1 |
| 3 — iBGP Fundamentals | 3 | 2 | 1 |
| 4 — Path Attributes & Best-Path | 5 | 3 | 1 |
| 5 — Route Filtering & Policy | 3 | 2 | 1 |
| **Total** | **17** | **10** | **4** |

> Note: Module 1 has no challenge lab — it's conceptual + observation only. The first true blank-slate proof is `bgp-ebgp-capstone`.
