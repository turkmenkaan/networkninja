# Path: Network+ Hands-On Labs

> Goal: give a CompTIA Network+ (N10-009) candidate the thing video courses cannot: a keyboard. Every objective on the exam that can be built, broken, and fixed in a container gets a lab. Subnet a real network and address it, tag frames across a real 802.1Q trunk, hand out real DHCP leases, answer real DNS queries, drop real packets with a firewall rule, then walk into networks that are already broken and fix them with the methodology the exam tests.

- **Prerequisites for the path:** a Linux shell you are not afraid of. No prior networking knowledge is assumed; the path starts at the OSI model. It is designed to run *alongside* a video course or study guide, not instead of one.
- **Network OS:** mostly none. These labs are Linux hosts, Linux bridges acting as switches, and real open-source services (dnsmasq, nftables, rsyslog, chrony, net-snmp). A handful of routing labs use FRRouting (`frrouting/frr`) where router semantics are the point. The manifest's `network_os` is `linux + frr`.
- **Module rhythm:** theory → guided practice → break-fix → blank-slate capstone. Not every module runs all four beats, but every module with labs closes on a `challenge` or a `broken` capstone.
- **Out of scope, deliberately and permanently:** this path covers **only the objectives you can put your hands on**. It does not cover cabling, connectors, transceivers, or media types (1.5, and the physical half of 5.2); wireless standards, channels, antennas, or wireless troubleshooting (2.3, and the wireless half of 5.4); cloud service and deployment models (1.3); physical installation, racks, power, and environment (2.4); or organizational process: documentation, inventory, change and life-cycle management, SLAs, and disaster recovery (3.1, 3.3). Those are memorization topics. Learn them from the video course and come back here for the part of the blueprint that is actually a network.
- **Not affiliated with CompTIA.** "CompTIA" and "Network+" are trademarks of CompTIA, Inc. This path is an independent study supplement mapped to the published N10-009 objectives. It is not endorsed by or affiliated with CompTIA. Objective *numbers* are cited; objective *text* is always paraphrased, never copied.
- **Exam-revision durability:** N10-009 launched June 2024 and is expected to retire around 2027. Unit content teaches durable skills, and objective numbers live only in this doc, never in unit ids or lesson prose, so the next revision is a remap of the coverage map below, not a rewrite.

Legend: `L` = lesson · `G` = guided lab · `B` = broken lab (boots misconfigured; diagnose and fix) · `C` = challenge lab (blank slate)

> **About `B` labs.** A broken lab boots a network that is already wrong. You get symptoms, not `# TODO:` markers. The job is the one Domain 5 tests: form a theory, test it, fix it, prove the fix. Domain 5 is 24% of the exam, the largest single domain, so 7 of this path's 21 labs are break-fix.

---

## Module 1 - Foundations: The Stack and the Toolbox

*Before configuring anything: the model everything hangs off, the ports the exam asks about all day, the troubleshooting method, and a guided tour of the handful of commands that answer almost every networking question. Closes with a first, deliberately easy, broken network.*

**Learning objectives:** map the seven OSI layers to real protocols, devices, and PDU names, and explain encapsulation and decapsulation; recall the common ports, protocols, and IP protocol numbers, and recognize them in a capture; distinguish unicast, broadcast, multicast, and anycast; apply the seven-step troubleshooting methodology and choose top-down, bottom-up, or divide-and-conquer; read a live network with `ip`, `ping`, `traceroute`, `ip neigh`, `ss`, `dig`, and `tcpdump`; repair a single-fault network by working the stack bottom-up.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 1.1 | `netplus-osi-and-encapsulation` | L | - | The seven layers, what lives at each, PDU names, which device operates at which layer, encapsulation down and decapsulation up, and the mapping onto the four-layer TCP/IP model. |
| 1.2 | `netplus-ports-protocols-and-traffic-types` | L | - | The port table to know cold (FTP, SSH/SFTP, Telnet, SMTP, DNS, DHCP, TFTP, HTTP/S, NTP, SNMP, LDAP/S, SMB, syslog, SQL, RDP, SIP); TCP vs UDP; IP protocol numbers (ICMP, TCP, UDP, GRE, ESP, AH); unicast, broadcast, multicast, anycast. |
| 1.3 | `netplus-troubleshooting-methodology` | L | - | The seven steps in order and why the order matters; gathering information, duplicating the problem, separating multiple problems; top-down vs bottom-up vs divide-and-conquer; escalating, verifying, documenting. The spine of every `B` lab in the path. |
| 1.4 | `lab-environment-setup` | L | - | (Shared with the BGP and SNMP paths.) Install Docker and Containerlab. Prerequisite for every lab below. |
| 1.5 | `netplus-toolbox-tour` | G | guided | A healthy three-host, one-router network boots **already working**. Pure observation: read addressing, the routing table, the ARP cache, reachability, the path, listening sockets, and names, then watch one HTTP request in `tcpdump` and name every header. No configuration. |
| 1.6 | `netplus-layer-by-layer-triage` | B | broken | **First break-fix, deliberately easy.** Symptom: `h2` reaches nothing while `h1` and `h3` are fine. One fault, low in the stack. Work bottom-up (link, addressing, gateway, names) and stop the moment you find it. The lesson is the *method*. |

---

## Module 2 - Addressing: IPv4, Subnetting, and IPv6

*The most testable skill on the exam and the one a slide cannot teach. Do the binary arithmetic, then type the answer into a real interface and watch it work or fail.*

**Learning objectives:** derive network address, broadcast, and usable range from any address and mask; recall the special-use ranges (RFC 1918, loopback, APIPA/link-local, multicast, CGNAT space) and why private space needs NAT; apply CIDR and VLSM against a host-count requirement; read IPv6 addresses and scopes (global unicast, unique local, link-local) and explain SLAAC, dual stack, tunneling, and NAT64; recognize wrong-mask, wrong-gateway, and duplicate-address faults by their symptoms.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 2.1 | `netplus-ipv4-addressing-and-subnetting` | L | - | Dotted-quad to binary; the network/host boundary; classes and why classful is dead; special-use ranges; masks and CIDR; the network/broadcast/first/last drill; VLSM; subnet and host arithmetic done the fast way. |
| 2.2 | `netplus-ipv6-and-dual-stack` | L | - | 128-bit hex notation and zero compression; global unicast, ULA, and link-local scopes; the `/64` convention; SLAAC and RAs vs DHCPv6; no broadcast; dual stack, tunneling, and NAT64. |
| 2.3 | `netplus-build-an-addressing-plan` | G | guided | Carve a `10.0.0.0/24` against a requirements sheet with VLSM, address four hosts and a gateway, set default routes, and prove every segment reaches every other. Add an IPv6 `/64` to one segment and watch a host autoconfigure. |
| 2.4 | `netplus-broken-addressing` | B | broken | Symptoms: `h1` reaches its own subnet but nothing beyond; `h3` reaches nothing; `h4` intermittently vanishes. Three faults, one per host: wrong mask, wrong default gateway, duplicate IP. |
| 2.5 | `netplus-addressing-capstone` | C | challenge | **Blank slate:** interfaces up, no addresses. Design a VLSM plan from per-department host counts, address everything, route between segments, and prove full reachability. |

---

## Module 3 - Switching, VLANs, and the Layer-2 Path

*Where the exam spends its implementation points and where real networks break. Real Linux bridges, real 802.1Q tags on the wire, real inter-VLAN routing.*

**Learning objectives:** explain MAC learning, flooding, and forwarding, and collision vs broadcast domains; read a MAC table and an ARP cache together; describe access and trunk ports, native, default, and voice VLANs, and decode an 802.1Q tag; build a trunk and prove tagging with a capture; route between VLANs with subinterfaces; diagnose the common trunk faults; explain why a Layer 2 loop is catastrophic and what spanning tree does about it.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 3.1 | `netplus-switching-and-mac-learning` | L | - | Frames and MACs; how a switch builds its table; flood, forward, filter; collision vs broadcast domains; ARP as the Layer 3 to Layer 2 glue; why a Layer 2 loop has no TTL to save it. |
| 3.2 | `netplus-vlans-and-trunking` | L | - | A VLAN as a broadcast domain drawn in software; access vs trunk; 802.1Q tag anatomy (TPID, PCP, DEI, VID); the native VLAN mismatch trap; VLAN 1 hygiene; voice VLANs; router-on-a-stick vs Layer 3 switch SVI. |
| 3.3 | `netplus-build-vlans-and-a-trunk` | G | guided | Two VLAN-filtering Linux bridges (each an ordinary container node, so deploy stays one command). Put hosts into VLANs 10 and 20, trunk the bridges, and prove it with `bridge vlan show`, `tcpdump -e` on the trunk, and pings that show the VLANs cannot see each other. |
| 3.4 | `netplus-router-on-a-stick` | G | guided | One FRR router, one trunk, subinterfaces `eth1.10` and `eth1.20`, a gateway per VLAN. Two isolated broadcast domains start routing, and the frames gain and lose their tag at the router. |
| 3.5 | `netplus-broken-vlan-trunk` | B | broken | Symptoms: VLAN 20 works within switch 1 but not across to switch 2; VLAN 10 is fine; one host sits in the wrong broadcast domain. Two faults: a VLAN missing from the trunk, an access port in the wrong VLAN. |
| 3.6 | `netplus-switching-capstone` | C | challenge | **Blank slate:** two switches, four hosts, one router, and a spec. Three VLANs, correct trunking, routing between exactly two of them, the third isolated. Prove every required flow and every forbidden one. |

---

## Module 4 - Routing, NAT, and Path Selection

*How a packet leaves its subnet: static and default routes, how a router chooses between competing routes, and the translation that makes private addressing survivable.*

**Learning objectives:** predict the winning route by longest-prefix match; rank competing routes by administrative distance, then metric; contrast static and dynamic routing and name RIP, OSPF, EIGRP, and BGP and the IGP/EGP split; configure static, default, and floating static routes; explain static NAT, dynamic NAT, PAT, and CGNAT; describe first-hop redundancy and the virtual IP; place routers in hub-and-spoke, three-tier, collapsed-core, and spine-leaf designs and distinguish north-south from east-west traffic.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 4.1 | `netplus-routing-and-route-selection` | L | - | The routing table and longest-prefix match; connected, static, dynamic, and default routes; administrative distance between sources and metric within one; the four protocols in a paragraph each; common topologies and traffic directions. |
| 4.2 | `netplus-nat-pat-and-gateway-redundancy` | L | - | Why private addressing needs translation; static NAT, dynamic NAT, PAT; CGNAT and double NAT; port forwarding; FHRP, the virtual IP and MAC, and what a host notices on failover (nothing). |
| 4.3 | `netplus-static-routing-and-default-route` | G | guided | Three routers, four subnets, no dynamic routing. Add static routes hop by hop until end-to-end works, add a default route at the edge, then a floating static that takes over only when the primary dies. |
| 4.4 | `netplus-configure-nat-and-pat` | G | guided | A private `192.168.10.0/24` inside, a documentation-range "internet" outside. Configure PAT on the gateway, watch the outside host see only the gateway, read the translation table, then add a port forward to an inside web server. |
| 4.5 | `netplus-routing-capstone` | C | challenge | **Blank slate:** three sites, private addressing, one internet edge, and a reachability matrix. Build the routing and NAT, and prove inside-out works, outside-in is blocked except one forwarded port, and every internal subnet reaches every other. |

---

## Module 5 - Core Network Services: DHCP, DNS, and NTP

*The three services behind most of the world's help-desk tickets. Run them, then break them.*

**Learning objectives:** walk DHCP's DORA exchange with ports and broadcast behavior; configure a scope with lease time, exclusions, a reservation, and options, and explain relays; read what a 169.254 address is telling you; describe the DNS hierarchy, recursive vs authoritative servers, forward and reverse zones, the common record types, TTL, and DoH/DoT; resolve forward and reverse with `dig`; separate a name-resolution failure from a connectivity failure.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 5.1 | `netplus-dhcp-and-dora` | L | - | Discover, Offer, Request, Acknowledge on ports 67/68 and which are broadcast; scope, pool, exclusion, reservation, lease and renewal; the options that matter; relay agents; APIPA; how SLAAC solves the same problem for IPv6. |
| 5.2 | `netplus-dns-fundamentals` | L | - | Root, TLD, authoritative; recursive resolvers vs authoritative servers; forward and reverse zones; A, AAAA, CNAME, MX, TXT, NS, PTR, SRV; TTL and caching; the full resolution walk; DNS over HTTPS and over TLS. |
| 5.3 | `netplus-configure-dhcp-and-dns` | G | guided | One dnsmasq node doing both jobs. A scope with an exclusion and a MAC reservation, options handed to a client, the DORA exchange captured live; then a forward zone with matching PTR records, queried with `dig` and `dig -x`. |
| 5.4 | `netplus-broken-name-resolution` | B | broken | Symptom: "the internet is down" while pinging by IP works; a second client sits on a 169.254 address. Faults: a resolver pointed at the wrong server, a missing PTR record, and an exhausted DHCP pool. |
| 5.5 | `netplus-services-capstone` | C | challenge | **Blank slate:** two subnets, one services host, one router. DHCP for both subnets (so a relay across the router), a server reservation, forward and reverse DNS, and NTP. A freshly booted client must come up with address, gateway, working resolver, and correct time. |

---

## Module 6 - Network Security

*Filtering, segmentation, and the attacks the exam expects you to recognize by their signatures.*

**Learning objectives:** define risk, vulnerability, threat, exploit, and CIA, and apply least privilege; explain the authentication and authorization stack (MFA, SSO, 802.1X, RADIUS, TACACS+, LDAP, SAML); explain encryption in transit and at rest, certificates, and PKI at Network+ depth; design trusted and untrusted zones and a screened subnet, and segment guest, IoT/OT, and BYOD traffic; recognize the network attacks by mechanism and symptom; write and order ACL rules including the implicit deny, and distinguish stateful from stateless filtering; harden a host by closing what it does not need.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 6.1 | `netplus-security-concepts-and-zones` | L | - | CIA and the risk vocabulary; least privilege and RBAC; MFA, SSO, and AAA; encryption in transit vs at rest, certificates and PKI; zones and the screened subnet; segmentation for guest, BYOD, IoT, and OT networks. |
| 6.2 | `netplus-common-attacks` | L | - | ARP poisoning, MAC flooding, DNS poisoning, rogue DHCP and rogue APs, evil twin, VLAN hopping, DoS/DDoS including reflection and amplification, on-path attacks. For each: mechanism, the symptom you would see, the control that stops it. |
| 6.3 | `netplus-acls-and-segmentation` | G | guided | An nftables gateway between a trusted LAN, a screened subnet with a web server, and an untrusted outside. Write rules to a stated policy and learn rule order, stateful return traffic, and the implicit deny by watching each probe succeed or hang. Then close the server's unused ports and prove it with `ss` and `nmap`. |
| 6.4 | `netplus-broken-firewall-policy` | B | broken | **Module capstone.** Symptoms: the app tier times out reaching the database while the web tier connects fine, and a guest host can reach the internal file server. Faults: a rule order that shadows a permit, a rule on the wrong port, and a missing segmentation deny. |

---

## Module 7 - Operations, Monitoring, and Remote Access

*How you see the network when you are not next to it, and reach it when you are not in the building.*

**Learning objectives:** choose the right monitoring method for a question (SNMP, syslog, flow data, packet capture, port mirroring, API integration) and explain baselines and anomaly alerting; read syslog severities and facilities; compare console, SSH, GUI, API, and jump-host access, and in-band vs out-of-band management; contrast site-to-site and client-to-site VPNs and split vs full tunneling.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 7.1 | `netplus-monitoring-and-logging` | L | - | SNMP at Network+ depth (cross-links the SNMP path for the full treatment); syslog severities and facilities; log aggregation and SIEM; flow data vs packet capture; port mirroring and TAPs; baselines and anomaly alerting; availability vs performance vs configuration monitoring. |
| 7.2 | `netplus-remote-access-and-vpn` | L | - | Console, SSH, GUI, and API access; the jump host; in-band vs out-of-band management; site-to-site, client-to-site, and clientless VPN; split vs full tunnel; where IPsec (AH and ESP) fits. |
| 7.3 | `netplus-syslog-and-snmp-monitoring` | G | guided | Point three devices' logs at an rsyslog collector, watch a link-down event arrive with its severity, then poll the same devices over SNMP for interface counters and catch a trap. |
| 7.4 | `netplus-operations-capstone` | C | challenge | **Blank slate:** two sites and a spec. A site-to-site tunnel, every device logging to one collector, SNMP exposed for polling, and management reachable only through a single jump host with key-based SSH. Prove site-to-site traffic works and direct access is refused. |

---

## Module 8 - The Troubleshooting Gauntlet

*Everything built so far, now broken by someone else. Domain 5 gets paid off here.*

**Learning objectives:** distinguish bandwidth, latency, jitter, and packet loss from a user complaint; diagnose from interface counters (CRC errors, runts, giants, drops); recognize duplex and MTU mismatches by symptom pattern; explain why a Layer 2 loop is unbounded and how spanning tree prevents it; run a multi-fault incident end to end with the seven-step method, fixing in priority order and verifying each fix.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 8.1 | `netplus-performance-and-interface-errors` | L | - | Congestion, bottlenecks, and the difference between bandwidth, throughput, latency, jitter, and loss; interface counters and what each implies; duplex mismatch; MTU, jumbo frames, fragmentation, and PMTUD blackholes. |
| 8.2 | `netplus-broken-layer2-loop` | B | broken | Symptoms: intermittent connectivity, duplicate ping replies, flapping ARP entries, pinned CPU. A redundant switch link was added with spanning tree off. Diagnose the storm, understand root election and port roles and states, restore a single loop-free active path. |
| 8.3 | `netplus-troubleshooting-gauntlet` | B | broken | **Path capstone.** Six nodes, four independent faults across four layers: an interface problem, an MTU mismatch that lets SSH connect but hangs large transfers, a routing fault that blackholes a subnet, and a DNS or DHCP fault. Work the method, fix in priority order, verify each fix, document what you found. |

---

## Path summary

| Module | Lessons | Guided | Broken | Challenge | Total |
|--------|:-------:|:------:|:------:|:---------:|:-----:|
| 1 - Foundations | 4 | 1 | 1 | 0 | 6 |
| 2 - Addressing | 2 | 1 | 1 | 1 | 5 |
| 3 - Switching | 2 | 2 | 1 | 1 | 6 |
| 4 - Routing & NAT | 2 | 2 | 0 | 1 | 5 |
| 5 - Core Services | 2 | 1 | 1 | 1 | 5 |
| 6 - Security | 2 | 1 | 1 | 0 | 4 |
| 7 - Operations | 2 | 1 | 0 | 1 | 4 |
| 8 - Troubleshooting Gauntlet | 1 | 0 | 2 | 0 | 3 |
| **Total** | **17** | **9** | **7** | **5** | **38** |

One of the 17 lessons (`lab-environment-setup`) is shared, so 37 units are new. 21 of the 38 units are labs, and 7 of those are break-fix, which puts troubleshooting at roughly a quarter of the path to match its exam weight. Modules 1, 6, and 8 close on a `broken` capstone because break-fix *is* the proof there; every other module closes blank-slate.

---

## Objective coverage map

> **Objective numbering is TO-CONFIRM against CompTIA's published N10-009 objectives document.** The five domains and their weights (23 / 20 / 19 / 14 / 24) are verified. The objective numbers below match two independent recollections but have not yet been diffed against the official PDF; do that before this map is used in any public copy. Paraphrase only, never CompTIA's wording.

### Per module

| Module | Primary objectives | Secondary / partial |
|---|---|---|
| 1 - Foundations | 1.1 OSI, 1.4 ports/protocols/traffic types, 5.1 methodology, 5.5 software tools | 1.2 device-to-layer mapping, 5.3 first fault |
| 2 - Addressing | 1.7 IPv4 addressing, 5.3 mask/gateway/duplicate-IP faults | 1.8 IPv6, 3.4 SLAAC, 5.5 |
| 3 - Switching | 2.2 switching, 5.3 VLAN and STP faults | 1.1, 1.6 topologies, 2.1 subinterfaces, 4.2 VLAN hopping (concept) |
| 4 - Routing & NAT | 2.1 routing, route selection, NAT/PAT, FHRP; 5.3 routing faults | 1.6 architectures, 1.7 public vs private |
| 5 - Core Services | 3.4 network services, 5.3 pool exhaustion | 1.4 ports 53/67/68/123, 5.5 `dig` |
| 6 - Security | 4.1 concepts, 4.2 attacks, 4.3 features, 5.3 ACL faults | 1.2 firewalls, 2.2 port security (concept) |
| 7 - Operations | 3.2 monitoring, 3.5 access and management | 1.4 ports 22/161/162/514, 4.1 encryption in transit |
| 8 - Gauntlet | 5.1, 5.3, 5.4 wired performance, 5.5 | 5.2 interface counters only, 2.2 MTU and STP |

### Honest coverage, by domain (estimates)

The first figure is the estimated share of the domain's exam value the path reaches. The second is the share of the domain's *labbable* content it reaches, which is the fair test of the path against its own promise.

| Domain | Weight | Path reaches | Of the labbable part |
|---|:---:|:---:|:---:|
| 1.0 Networking Concepts | 23% | ~55% | ~95% |
| 2.0 Network Implementation | 20% | ~40% | ~85% |
| 3.0 Network Operations | 19% | ~45% | ~90% |
| 4.0 Network Security | 14% | ~60% | ~85% |
| 5.0 Network Troubleshooting | 24% | ~75% | ~95% |
| **Blended** | **100%** | **~57%** | **~90%** |

These are design-time estimates, not measurements. Public copy should say something no stronger than "most of the blueprint you can practice hands-on", never a percentage.

### Deliberately skipped

- **Whole objectives:** 1.3 cloud, 1.5 media and transceivers, 2.3 wireless, 2.4 physical installation, 3.1 organizational processes, 3.3 disaster recovery.
- **Within covered objectives:** SDN, SD-WAN, VXLAN, SASE/SSE, and infrastructure as code (1.8); IDS/IPS, load balancers, NAS/SAN, CDN as hands-on devices (1.2); three-tier and spine-leaf as built topologies (1.6); link aggregation and PoE (2.2); flow data and SIEM hands-on (3.2); PTP and NTS (3.4); physical security, deception technology, and compliance (4.1); social engineering and malware (4.2); 802.1X and MAC filtering hands-on (4.3); all physical cabling faults (5.2); all wireless performance faults (5.4); all hardware tools (5.5).
- **Best v1.1 additions** if the path does well: an 802.1X lab (hostapd + FreeRADIUS) for Domain 4, a VRRP/keepalived FHRP lab and an LACP bonding lab for Domain 2.

---

## Network+ lab conventions

These are the deltas from the FRR/BGP pattern in `.claude/skills/network-ninja-module-creator/SKILL.md`. They are larger than the SNMP path's deltas because most of these labs are not routers. None are implemented yet.

### Broken-mode authoring contract

- `configs/` is **fully populated and deliberately wrong.** No `# TODO:` markers and no comment hinting at the fault. Someone reading every file should see a plausible, complete, professional config.
- `content.mdx` presents **symptoms only**: what the user reported, what works, what does not, and the desired end state. It may recap the methodology; it may not narrow the search space.
- `tasks.yaml` objectives describe the **end state, never the fault** ("VLAN 20 traffic crosses the trunk", not "VLAN 20 is added to the trunk"), so any correct fix passes. Every broken lab also carries at least one **negative** objective (a flow that must stay blocked) so opening everything up cannot pass.
- Hints nudge toward a *method* ("compare the mask on both ends of this link"), never a file or a node. The objectives UI renders hints behind a toggle, so write them assuming they will be read.
- `solution/solution.mdx` opens with a **fault list** (node, file, what was wrong, the symptom it caused), then walks symptom -> evidence -> root cause -> fix, with corrected files under `solution/<node>/`.
- Fault count: one for the first broken lab, two or three for module labs, four for the gauntlet. Faults in a multi-fault lab must be **independently discoverable**; verify by fixing them in a different order.
- Every fault must be one the exam names. No exotic kernel flags, no image bugs.

### Images

- **Never pin a tag that has not been checked against the registry at authoring time.** The skill's FRR precedent (`frrouting/frr:v8.4.1`, with the `v`) is why.
- The decision to make before Module 2: **pre-baked images** published to a registry vs **Alpine plus boot-time `apk add`** (the `snmp-observe-a-walk` precedent, whose own TO-CONFIRM block calls the boot-time CDN dependency a fragility). With 21 labs averaging several nodes each, boot-time installs will be the dominant source of "lab does not work" reports. Recommended: three thin images from a verified Alpine base.

| Image | Contents | Used by |
|---|---|---|
| `nn-host` | iproute2, iputils, traceroute, mtr, tcpdump, bind-tools, curl, nmap, iperf3, ethtool, jq | every host, client, attacker |
| `nn-services` | `nn-host` + dnsmasq, chrony, rsyslog, net-snmp, net-snmp-tools | service nodes |
| `nn-gateway` | `nn-host` + nftables, conntrack-tools, wireguard-tools | NAT gateways and firewalls |

- Routers where router semantics are the lesson use `frrouting/frr:v8.4.1` with the shared `configs/daemons` copied from `content/units/bgp-ebgp-peering/configs/daemons`.
- **Confirm busybox vs iputils `ping`:** the MTU labs need `ping -M do`, which busybox's `ping` may not support.

### Nodes and addressing

| Prefix | Role |
|---|---|
| `h1`, `h2`, ... | hosts and clients |
| `sw1`, `sw2` | Linux bridges acting as switches (ordinary container nodes, not containerlab `bridge` kinds, which require a pre-created host bridge and break one-command deploy) |
| `r1`, `r2` | routers (FRR, or Linux with forwarding on) |
| `gw` | NAT / firewall gateway |
| `srv`, `dns`, `dhcp`, `www`, `db` | role-named servers |
| `nms`, `log` | management plane (matches the SNMP path) |
| `atk` | attacker node in security labs |
| `net` | the "outside world" in NAT labs |

| Purpose | Block | Convention |
|---|---|---|
| VLAN / LAN segments | `10.0.<vlan>.0/24` | gateway `.1`, hosts `.11`+, servers `.20`+ |
| Router-to-router links | `10.0.<a><b>.0/24` | inherited from BGP: r1-r2 is `10.0.12.0/24` |
| Management / services | `10.0.0.0/24` | inherited from SNMP: `nms` `.10`, agents `.11`+ |
| NAT inside | `192.168.10.0/24` | a different RFC 1918 block, so "private" reads as a category |
| NAT outside | `203.0.113.0/24` | RFC 5737 TEST-NET-3 |
| IPv6 | `2001:db8:0:<vlan>::/64` | RFC 3849 documentation prefix; ULA examples in `fd00::/8` |

### Containerlab and Linux gotchas

- **Management default route.** Containerlab attaches `eth0` to its management network with a default route out of it. A host that "cannot reach its gateway" may still reach things, and NAT may translate nothing. Every `boot.sh` must `ip route del default` before installing the intended default via `eth1`. Confirm on the first deploy.
- **Forwarding.** Any Linux node acting as a router needs `net.ipv4.ip_forward=1` (and `net.ipv6.conf.all.forwarding=1` for dual stack). Watch `rp_filter`, which drops asymmetric return traffic.
- **Bind-mount guard.** Keep the `snmp-observe-a-walk` FATAL guard at the top of every `boot.sh`: Docker silently creates an empty directory when it cannot see a bind source, and the service then starts on defaults with nothing in the logs.
- **Foreground PID 1.** End each `boot.sh` with the service in the foreground (`dnsmasq -k`, `rsyslogd -n`, `chronyd -d`, `snmpd -f`), or `tail -f /dev/null` after a daemonizing command like `nft -f`. Flags are TO-CONFIRM except `snmpd`, which is proven in `snmp-observe-a-walk`.

### `configs/` layout

Move long boot commands out of `topology.clab.yml` into a bound `configs/<node>/boot.sh`. It keeps five-node topologies readable, and it makes the guided / challenge / broken difference a clean diff on one file.

```
configs/
  daemons             # FRR labs only
  <node>/boot.sh      # every non-FRR node: addressing, sysctls, service start
  <node>/frr.conf     # FRR nodes only
  sw1/vlans.sh        # bridge + vlan_filtering + port membership
  dns/dnsmasq.conf    # -> /etc/dnsmasq.conf
  gw/nftables.conf    # -> /etc/nftables.conf
  log/rsyslog.conf    # -> /etc/rsyslog.conf
```

| Mode | `configs/` content |
|---|---|
| `guided` | base addressing; the taught config carries `# TODO:` markers |
| `challenge` | addressing only |
| `broken` | complete and wrong, per the contract above |

### `tasks.yaml` without `vtysh`

**Prefer a native-JSON command; fall back to the SNMP path's `| jq -R '{value: .}'` wrapper only when there is none.** `jq` must be on whichever node runs the check.

| Tool | Native JSON | Use |
|---|---|---|
| `ip` | `ip -j ...` | addresses, routes, links, neighbors, counters |
| `bridge` | `bridge -j ...` | VLAN membership, FDB, port state |
| `nft` | `nft -j list ruleset` | rules (prefer behavioral probes, see below) |
| `iperf3` | `iperf3 -J` | throughput |
| `ping`, `dig`, `ss`, `traceroute`, `nmap` | none | wrap with `jq -R` |

Reachability probe (the most common check in the path):

```yaml
check:
  node: h2
  command: "sh -c 'ping -c 3 -W 2 10.0.20.14 >/dev/null 2>&1 && echo reachable || echo unreachable' | jq -R '{value: .}'"
  parse: json
  assert: { path: "$.value", equals: "reachable" }
```

- **Grade behavior, not rule text.** Firewall and NAT objectives assert on probes in each direction of the policy matrix rather than on `nft -j` output, which is deeply nested and rewards memorizing rule shapes.
- **`tcpdump` teaches, it never grades.** It blocks and depends on live traffic. Use it in `display_command` and prose; grade on the durable artifact it explains (the lease in `ip -j addr`, the MAC in `bridge -j fdb`, the VLAN in `bridge -j vlan`).
- **`dig -x` returns a trailing dot**, so reverse-lookup checks use `contains`, not `equals`.
- **`iperf3` generates traffic**, so it is not strictly read-only. Use sparingly, with generous thresholds; prefer `ping -M do -s 1472` for MTU.
- **TO-CONFIRM before any lab ships:** `ip -j addr` ordering of entries in `addr_info` (IPv4 vs IPv6 link-local), the `bridge -j vlan show` schema across iproute2 versions, and whether `vlan_filtering` works inside a node. Roughly a dozen assertions depend on these. Pin them in one baseline deploy and record it in `docs/verification/`.

Every assertion is schema-derived until a real `containerlab deploy` proves it. Mark them TO-CONFIRM, and per the skill's honesty rule a clean static review is PARTIAL, never PASS.

### Diagrams

- **Existing components cover most needs:** `<ASTopology>` with `groups` for VLAN and security-zone boundaries; `<HierarchyTree>` for the DNS hierarchy and three-tier designs; `<StateMachine>` for spanning tree port states and the troubleshooting steps; `<MessageTimeline>` for broadcast storms.
- **`<PacketExchange>`** (built): sequence diagrams for DORA, ARP, DNS, the TCP handshake, SNMP polls and traps. Proposed extension: a `broadcast` flag that draws a fan arrow, since which DORA messages are broadcast is directly examinable.
- **`<LayerStack>`** (to build): the OSI stack, plus a frame-anatomy mode for encapsulation and the 802.1Q tag. Needed before unit 1.1.
- **`<AddressBlock>`** (to build): a 32-bit address with the network/host boundary drawn, plus a VLSM mode showing subnets as proportional slices of the parent block. Needed before unit 2.1.
- **Proposed `<ASTopology>` extensions:** a per-node `shape` (host, switch, server, firewall) so a Network+ diagram does not draw every device as a router, and a link `style` (access, trunk, tunnel).

---

## Reuse and cross-links

- **Reused directly:** only `lab-environment-setup` (unit 1.4). Its `meta.yaml` no longer claims a single path.
- **Cross-link, do not duplicate:** `netplus-monitoring-and-logging` → the SNMP path's four Module 1 lessons (the highest-value link in the path). `netplus-syslog-and-snmp-monitoring` → `snmp-observe-a-walk`; lift its `snmpd.conf` and `jq -R` checks rather than re-deriving them. `netplus-routing-and-route-selection` → `bgp-why-bgp-exists` and `bgp-ebgp-vs-ibgp`. Troubleshooting units → `content/field-notes/bgp-stuck-in-active.mdx` as a worked example of the method. Module 1 → `content/field-notes/containerlab-vs-gns3-vs-eve-ng.mdx` for the "why not Packet Tracer?" question.
- **Separate units, by decision:** this path's routing units are its own, not shared with the planned OSPF Module 1 (`ospf-routing-table-and-preference`, `ospf-static-routing`). The Network+ versions are Linux- and exam-oriented; the OSPF versions are FRR-oriented and set up link-state. When the OSPF units are authored, clone this path's topology and addressing so the two visibly rhyme and cross-link rather than restate. If they ever contradict each other, consolidate.

---

## Open technical questions

Decide or verify these before the module that depends on them:

- **Spanning tree on a Linux bridge is 802.1D**, and it reports port *states*, while the exam teaches RSTP port *roles*. `netplus-broken-layer2-loop` may need Open vSwitch, or the lesson teaches roles conceptually and states empirically. Settle in a Module 3 spike.
- **VLAN hopping by double tagging** may not be reproducible on a Linux bridge. Teach it conceptually; do not promise a lab until one is proven.
- **IPv6 SLAAC in a container** needs `accept_ra=2` where forwarding is on, plus an RA source (radvd or dnsmasq's RA). Unverified.
