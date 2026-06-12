# Path: Production BGP

> Goal: take an engineer who has finished BGP Fundamentals from "I can configure eBGP/iBGP and basic policy" to running BGP the way a real network operator does: scaling iBGP with route reflectors, engineering traffic across multiple upstreams, securing the edge with filtering and RPKI, making the network converge fast and fail gracefully, and operating it day to day. All hands-on with FRR.

- **Prerequisites for the path:** the entire **BGP Fundamentals** path (eBGP, iBGP, path attributes / best-path, route filtering & policy). This path assumes that fluency and does not re-teach it.
- **Network OS:** FRRouting (`frrouting/frr`), plus two small free helper containers in a couple of labs (an RPKI validator and a BMP collector, noted inline).
- **Module rhythm:** theory -> guided practice -> blank-slate `challenge` capstone, closing every lab-bearing module with a challenge.
- **Out of scope (covered by other paths):** BGP/EVPN and VXLAN (the Data Center Fabrics path), MPLS L3VPN and Segment Routing (the service-provider path), SRv6, flowspec / DDoS scrubbing and IRR (a future deeper routing-security path), and network automation. This path is the "operate BGP itself, at production scale" track.

Legend: `L` = lesson · `G` = guided lab · `C` = challenge lab

---

## Module 1 — Scaling iBGP: Route Reflectors & Confederations

*Fundamentals ended iBGP at the full mesh and flagged the n(n-1)/2 wall. This module breaks through it.*

**Learning objectives:** explain why the iBGP full mesh does not scale and the two ways out; configure a route reflector and its clients, and describe how cluster-id / originator-id / cluster-list prevent loops; design redundant and hierarchical RR topologies and understand the path-diversity tradeoff; describe confederations and when to choose them over RRs.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 1.1 | `bgp-ibgp-scaling-problem` | L | — | The full-mesh wall (n(n-1)/2 sessions) and the two escape hatches: route reflectors and confederations. |
| 1.2 | `bgp-route-reflector-concepts` | L | — | RR / client / non-client roles; cluster-id, originator-id, and cluster-list loop prevention; how an RR bends the iBGP re-advertisement rule. |
| 1.3 | `bgp-configure-route-reflector` | G | guided | Configure one RR with clients; verify clients no longer need a full mesh; read originator-id and cluster-list. |
| 1.4 | `bgp-route-reflector-design` | L | — | Redundant RRs, clusters, hierarchical RR, RR placement, and the path-diversity loss that motivates ADD-PATH. |
| 1.5 | `bgp-redundant-route-reflectors` | G | guided | Two RRs with a sane cluster-id design; verify redundancy and survival of an RR failure. |
| 1.6 | `bgp-confederations` | L | — | Sub-AS, confederation identifier / peers, and the RR-vs-confederation tradeoff. |
| 1.7 | `bgp-scaling-capstone` | C | challenge | **Blank slate:** scale a transit-AS core with redundant route reflectors so every internal router has the external routes without a full mesh. |

---

## Module 2 — Multihoming & Traffic Engineering

*Goes well beyond the LOCAL_PREF / prepend / MED basics from Fundamentals.*

**Learning objectives:** design single/dual-homed and dual-multihomed edges; use upstream-published BGP communities to signal LOCAL_PREF and prepending to a provider; build backup links with conditional advertisement; load-balance with multipath and propagate path diversity with ADD-PATH.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 2.1 | `bgp-multihoming-design` | L | — | Dual-homed vs dual-multihomed, transit vs peering, and primary/backup design goals. |
| 2.2 | `bgp-communities-for-te` | L | — | Upstream community catalogs (signal LOCAL_PREF / prepend to your provider), the blackhole community, and custom schemes. |
| 2.3 | `bgp-community-traffic-engineering` | G | guided | Steer inbound and outbound traffic using an upstream's published communities. |
| 2.4 | `bgp-conditional-advertisement` | L | — | `advertise-map` / `non-exist-map`; backup links that only activate when the primary fails. |
| 2.5 | `bgp-conditional-advertisement-lab` | G | guided | Build a primary/backup upstream design with conditional advertisement; prove failover. |
| 2.6 | `bgp-multipath-and-add-path` | L | — | `maximum-paths`, `bestpath as-path multipath-relax`, and ADD-PATH for path diversity through an RR. |
| 2.7 | `bgp-traffic-engineering-capstone` | C | challenge | **Blank slate:** meet a stated inbound *and* outbound traffic pattern on a multihomed edge using the right levers. |

---

## Module 3 — Securing BGP: Filtering, RPKI & RTBH

*The must-haves that make a BGP edge production-grade. See the overlap note at the bottom of this doc.*

**Learning objectives:** describe the BGP threat model (hijacks, route leaks, RFC 8212); build robust ingress/egress prefix and AS-path filters with max-prefix limits; explain RPKI / route-origin validation and apply it with a validator cache; implement remote-triggered blackholing.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 3.1 | `bgp-security-threat-model` | L | — | Prefix hijacks, route leaks, the RFC 8212 default, and the layered defenses that follow. |
| 3.2 | `bgp-filtering-at-scale` | L | — | Prefix-list and AS-path filter strategy, max-prefix limits, bogon filtering, and MANRS expectations. |
| 3.3 | `bgp-robust-edge-filtering` | G | guided | Build full inbound/outbound filters plus a max-prefix limit on an eBGP edge; prove a leak is dropped. |
| 3.4 | `bgp-rpki-and-rov` | L | — | ROAs, the validator cache, valid/invalid/notfound states, and exactly what ROV does and does not stop. |
| 3.5 | `bgp-rpki-origin-validation` | G | guided | FRR + a StayRTR or Routinator cache container; drop RPKI-invalid routes. *(Adds one free helper container.)* |
| 3.6 | `bgp-rtbh-blackhole` | G | guided | Remote-triggered blackhole using the blackhole community to drop attack traffic at the edge. |
| 3.7 | `bgp-security-capstone` | C | challenge | **Blank slate:** harden a peering/transit edge to a security checklist (filters, max-prefix, RPKI, RTBH-ready). |

---

## Module 4 — Convergence, Stability & Fast Failover

*Make the network notice failures fast and leave them gracefully.*

**Learning objectives:** explain why default BGP convergence is slow and separate failure detection from path hunting; accelerate detection with BFD and timer tuning; use graceful restart and graceful shutdown (RFC 8326) for hitless maintenance; describe route flap damping and why it is largely discouraged today.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 4.1 | `bgp-convergence-explained` | L | — | Why default convergence is slow: hold timers, detection vs path hunting, next-hop tracking. |
| 4.2 | `bgp-bfd-and-timers` | L | — | BFD, hold/keepalive tuning, `fast-external-failover`, and next-hop tracking. |
| 4.3 | `bgp-bfd-fast-failover` | G | guided | Add BFD to a dual-path design and measure the convergence improvement on failure. |
| 4.4 | `bgp-graceful-restart-and-shutdown` | L | — | Graceful restart (control/forwarding separation) and graceful shutdown (RFC 8326) for maintenance. |
| 4.5 | `bgp-graceful-shutdown-maintenance` | G | guided | Drain a router for maintenance with no blackholing using graceful shutdown. |
| 4.6 | `bgp-route-flap-damping` | L | — | RFD mechanics, and an honest account of why operators mostly avoid it now. |
| 4.7 | `bgp-resilience-capstone` | C | challenge | **Blank slate:** build a dual-path design that fails over sub-second and can be drained gracefully for maintenance. |

---

## Module 5 — Operating BGP at Scale (Day-2)

*The operational skills: managing many sessions, seeing what BGP is doing, and fixing it when it breaks.*

**Learning objectives:** use peer groups, update groups, and dynamic neighbors to manage sessions at scale, with session authentication; observe BGP with BMP, logging, and looking glasses; apply a structured troubleshooting methodology.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 5.1 | `bgp-peer-groups-and-dynamic-neighbors` | L | — | Peer groups, update-group efficiency, dynamic neighbors (listen range), and MD5 session auth. |
| 5.2 | `bgp-peer-groups-lab` | G | guided | Refactor a sprawling per-neighbor config into peer groups plus dynamic neighbors. |
| 5.3 | `bgp-observability` | L | — | BMP, logging, looking glasses, and soft-reconfiguration vs route-refresh. |
| 5.4 | `bgp-bmp-monitoring` | G | guided | Stream BGP state to a collector. *(Adds one free helper container, e.g. OpenBMP/pmacct.)* |
| 5.5 | `bgp-troubleshooting-methodology` | L | — | A structured approach to "session won't come up", "routes missing", and "policy not applied". |
| 5.6 | `bgp-operations-capstone` | C | challenge | **Blank-slate "fix it":** inherit a broken transit AS, diagnose the faults, and repair it to a working spec. |

---

## Module 6 — Capstone: Run a Transit AS

*One integrative challenge that pulls the whole path together.*

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 6.1 | `bgp-production-capstone` | C | challenge | **Blank slate, the finale:** stand up a realistic small ISP, a route-reflector core, two multihomed edges, RPKI-validated peers, community-based traffic engineering, BFD failover, and graceful maintenance, built and verified end to end. The heaviest lab in the catalog (6-8 nodes). |

---

## Path summary

| Module | Lessons | Guided labs | Challenge labs |
|--------|:-------:|:-----------:|:--------------:|
| 1 — Scaling iBGP | 4 | 2 | 1 |
| 2 — Multihoming & Traffic Engineering | 4 | 2 | 1 |
| 3 — Securing BGP | 3 | 3 | 1 |
| 4 — Convergence & Fast Failover | 4 | 2 | 1 |
| 5 — Operating BGP (Day-2) | 3 | 2 | 1 |
| 6 — Capstone: Run a Transit AS | 0 | 0 | 1 |
| **Total** | **18** | **11** | **6** |

35 units total, comparable in size to BGP Fundamentals (32).

---

## Build notes (decisions to make before authoring)

- **Phase it.** This is a big path. Suggested order of authoring: **Modules 1-2 first** (scaling and traffic engineering are the most-requested "I finished Fundamentals, now what" topics), then 3-5, then the Module 6 grand capstone.
- **The security overlap is a real decision.** The roadmap (`/Users/.../plans`) floated a *separate* "Routing Security: RPKI & BGP Hardening" path, while this path includes a security module. Recommendation: keep **Module 3 lean** here (the must-haves to call an edge production-grade) and let any future standalone security path go *broader* (cross-vendor, flowspec, DDoS scrubbing, MANRS auditing, IRR) rather than duplicate. Do not build both at this depth.
- **FRR feasibility is good, with two heavier labs.** Almost everything is FRR-native (route-reflector-client, confederations, BFD via `bfdd`, graceful-restart/shutdown, `bgp dampening`, peer-groups, dynamic neighbors, ADD-PATH, the RPKI module). The RPKI lab (3.5) needs a validator container (StayRTR or Routinator) and the BMP lab (5.4) needs a collector container; both are free/redistributable but are the labs most likely to need real-deploy iteration before their `tasks.yaml` assertions are trustworthy. Flag them as such in `docs/verification/`.
- **Higher resource bar.** RR-with-clients and the transit-AS capstones run 5-8 nodes, so the `runtime` RAM estimates climb above the Fundamentals labs. Call this out alongside `lab-environment-setup` in the labs' prerequisites.
