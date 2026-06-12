# Path: OSPF Fundamentals

> Goal: take a learner from "how does a router actually pick a route" to confidently building single- and multi-area OSPF, controlling LSA flooding with stub/NSSA areas, redistributing external routes, and running OSPF as the IGP underlay that BGP rides on — all hands-on with FRR.

- **Prerequisites for the path:** comfort with IP addressing and subnets. The opening module teaches the routing-table mechanics, so no prior routing-protocol experience is assumed. Pairs naturally with (but does not require) the BGP Fundamentals path.
- **Network OS:** FRRouting (`frrouting/frr`).
- **Module rhythm:** theory → guided practice → blank-slate `challenge` capstone.
- **Out of scope (future "Advanced/Production OSPF" or "Interior Routing" path):** IS-IS, OSPFv3/IPv6, virtual links, OSPF authentication, BFD-accelerated convergence, graceful restart, and large-scale area design. The OSPF↔BGP underlay module here is an on-ramp, not the full SP design treatment.

Legend: `L` = lesson · `G` = guided lab · `C` = challenge lab

---

## Module 1 — Routing Foundations

*Before OSPF: how a router actually chooses a route, plus hands-on static routing. Conceptual + one guided lab, no challenge.*

**Learning objectives:** explain the RIB vs FIB and longest-prefix match; rank competing routes by administrative distance / route preference; configure static, default, and floating-static routes; contrast distance-vector with link-state and describe the LSDB + SPF model.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 1.1 | `ospf-routing-table-and-preference` | L | — | RIB vs FIB, longest-prefix match, administrative distance, how a router picks between routes from different sources. |
| 1.2 | `ospf-static-routing` | G | guided | Configure static routes, a default route, and a floating-static backup; read the FIB with `show ip route` / `show ip route json`. |
| 1.3 | `ospf-link-state-concept` | L | — | Distance-vector vs link-state; the link-state database and SPF (Dijkstra); why OSPF converges fast and loop-free. |

---

## Module 2 — Single-Area OSPF

*First OSPF configuration. Bring up adjacencies, flood one area, and watch SPF build the table.*

**Learning objectives:** describe areas, the backbone, and router roles; walk the OSPF neighbor state machine and the common LSA types; configure OSPF in a single area to Full adjacency; explain and influence DR/BDR election on a multi-access segment.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 2.1 | `ospf-areas-and-router-types` | L | — | Areas, the backbone (area 0), the router-id, and router roles (internal, ABR, ASBR). |
| 2.2 | `ospf-adjacencies-and-lsas` | L | — | Neighbor states (Down→Init→2-Way→ExStart→Exchange→Loading→Full), hello/dead timers, and the type-1 (router) and type-2 (network) LSAs. |
| 2.3 | `ospf-observe-a-session` | G | guided | A pre-built single-area OSPF boots **already converged**. Learner explores `show ip ospf neighbor`, `show ip ospf database`, `show ip route ospf` — pure observation, no config changes. |
| 2.4 | `ospf-enable-single-area` | G | guided | Enable OSPF on interfaces in area 0, reach Full with the neighbor, and confirm learned routes appear in the table. |
| 2.5 | `ospf-dr-bdr-election` | G | guided | On a shared multi-access segment, observe DR/BDR election and steer it with interface priority and router-id. |
| 2.6 | `ospf-single-area-capstone` | C | challenge | **Blank slate:** several routers with only addressing. Learner brings up a fully converged single-area OSPF with end-to-end reachability. |

---

## Module 3 — Multi-Area OSPF

*Scale OSPF with areas, engineer paths with cost, and shrink the table with summarization.*

**Learning objectives:** explain why multiple areas exist and the area-0 transit rule; describe inter-area (type-3 summary) routes and the ABR's role; compute OSPF cost and predict SPF path choice; summarize inter-area routes on an ABR.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 3.1 | `ospf-multi-area-design` | L | — | Why split into areas, the ABR, inter-area type-3 summary LSAs, and the "all areas touch area 0" rule. |
| 3.2 | `ospf-cost-and-path-selection` | L | — | OSPF cost, reference bandwidth, how SPF picks the lowest-cost path, and equal-cost multipath. |
| 3.3 | `ospf-build-multi-area` | G | guided | Split a topology into area 0 plus a non-backbone area across an ABR; verify inter-area routes flow both ways. |
| 3.4 | `ospf-route-summarization` | G | guided | Summarize an area's prefixes on the ABR with `area range`; watch the downstream table shrink. |
| 3.5 | `ospf-multi-area-capstone` | C | challenge | **Blank slate:** design and build a two-area network with ABR summarization and an engineered lowest-cost path that meets a stated requirement. |

---

## Module 4 — Stub Areas & Redistribution

*Control LSA flooding with area types, and bring external routes into OSPF.*

**Learning objectives:** describe the ASBR and external (type-5) / ASBR-summary (type-4) LSAs and E1 vs E2 metrics; choose the right stub/NSSA area type for a goal; redistribute external routes into OSPF with controlled metrics; convert an area to stub/totally-stubby and verify the LSDB shrinks.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 4.1 | `ospf-external-routes-and-lsas` | L | — | The ASBR, type-5 external and type-4 ASBR-summary LSAs, and E1 vs E2 external metrics. |
| 4.2 | `ospf-stub-and-nssa` | L | — | Stub, totally stubby, NSSA, and totally NSSA areas: what each blocks and how the default route is injected. |
| 4.3 | `ospf-redistribute-static` | G | guided | Redistribute static/connected routes into OSPF as externals; control `metric` and `metric-type`; confirm E1/E2 on the receivers. |
| 4.4 | `ospf-configure-stub-areas` | G | guided | Convert an area to stub and totally-stubby; observe the LSDB shrink and the injected default route. |
| 4.5 | `ospf-redistribution-capstone` | C | challenge | **Blank slate:** a multi-area network with an ASBR injecting externals and a stub area, meeting stated reachability and table-size constraints. |

---

## Module 5 — OSPF and BGP Together

*The path's payoff: OSPF as the IGP underlay that an iBGP overlay rides on. Directly backfills what the BGP path assumes.*

**Learning objectives:** explain why iBGP needs an IGP underlay to resolve next-hops; build an OSPF underlay and loopback-peer iBGP over it; avoid the classic OSPF↔BGP redistribution and default-origination pitfalls; pass an external prefix end-to-end across an OSPF core with correct next-hop resolution.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 5.1 | `ospf-as-bgp-underlay` | L | — | The underlay/overlay split: OSPF carrying loopbacks and next-hops so iBGP works. Ties back to the BGP path's `bgp-loopback-peering-and-igp` and `bgp-next-hop-self`. |
| 5.2 | `ospf-bgp-redistribution-and-default` | L | — | Originating a default into OSPF from the edge, OSPF↔BGP redistribution, and avoiding mutual-redistribution loops via administrative distance. |
| 5.3 | `ospf-underlay-for-ibgp` | G | guided | Build an OSPF underlay, then bring up loopback-to-loopback iBGP over it; confirm iBGP next-hops resolve via OSPF. |
| 5.4 | `ospf-bgp-edge-capstone` | C | challenge | **Blank slate:** a transit AS with an OSPF core, an iBGP overlay, and an eBGP edge. Learner builds all three layers and passes an external prefix end-to-end with correct next-hop resolution. |

---

## Path summary

| Module | Lessons | Guided labs | Challenge labs |
|--------|:-------:|:-----------:|:--------------:|
| 1 — Routing Foundations | 2 | 1 | 0 |
| 2 — Single-Area OSPF | 2 | 3 | 1 |
| 3 — Multi-Area OSPF | 2 | 2 | 1 |
| 4 — Stub Areas & Redistribution | 2 | 2 | 1 |
| 5 — OSPF and BGP Together | 2 | 1 | 1 |
| **Total** | **10** | **9** | **4** |

> Note: Module 1 has no challenge lab — it's foundations plus one hands-on static-routing lab. The first true blank-slate proof is `ospf-single-area-capstone`. Module 5 deliberately overlaps the BGP path so a learner who did BGP first gets the underlay they were missing, and a learner who does OSPF first is primed for iBGP.
