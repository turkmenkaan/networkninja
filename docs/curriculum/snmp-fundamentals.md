# Path: SNMP Fundamentals

> Goal: take a learner from "why does a network even need a management protocol" to confidently polling devices with SNMPv2c, reading the right objects out of the MIB tree, locking access down with SNMPv3 (auth + privacy), and receiving traps — all hands-on with a standalone net-snmp manager and agent.

- **Prerequisites for the path:** comfort with IP addressing, subnets, and a Linux shell. No prior network-management or routing-protocol experience is assumed. Pairs naturally with (but does not require) the BGP and OSPF Fundamentals paths.
- **Network OS:** net-snmp (a manager node running the `snmp*` client tools + `snmptrapd`, and agent node(s) running `snmpd`). This is the first non-FRR path; the exact image tag is chosen and verified against the registry at authoring time.
- **Module rhythm:** theory → guided practice → blank-slate `challenge` capstone.
- **Out of scope (future "SNMP Monitoring/Operations" path):** wiring SNMP into a monitoring stack (Prometheus `snmp_exporter` + Grafana, or Zabbix), SNMP-over-TLS/DTLS, write-heavy `SET` provisioning workflows, vendor enterprise MIBs and MIB compilation at scale, and RMON. This path teaches the protocol itself against a clean net-snmp manager/agent.

Legend: `L` = lesson · `G` = guided lab · `C` = challenge lab

---

## Module 1 — SNMP Foundations

*Before touching a device: what SNMP is, the manager/agent model, how data is named in the MIB tree, and the version landscape. Conceptual, closing with a pure-observation lab.*

**Learning objectives:** explain why managing many devices needs a protocol and where SNMP fits in network operations; describe the manager/agent/MIB architecture and the poll-vs-trap model; read and navigate OIDs and MIB names; contrast SNMP v1, v2c, and v3 and the role (and weakness) of community strings.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 1.1 | `snmp-why-snmp-exists` | L | — | Why managing many devices by hand does not scale; the manager/NMS vs the agent; the polling model; poll vs trap; where SNMP sits in monitoring and observability. |
| 1.2 | `snmp-manager-agent-and-pdus` | L | — | Architecture: manager, agent, MIB. UDP 161 (polls) and 162 (traps). PDU types: GET, GETNEXT, GETBULK, SET, RESPONSE, TRAP/INFORM, and the request-response flow. |
| 1.3 | `snmp-oids-and-mibs` | L | — | The OID tree (iso.org.dod.internet.mgmt.mib-2), dotted-numeric OIDs vs MIB names, sysDescr / sysUpTime / sysName, scalar vs tabular objects, and what a MIB module is. |
| 1.4 | `snmp-versions-and-communities` | L | — | v1 vs v2c vs v3 at a glance; community strings as weak plaintext auth (read-only vs read-write); what v2c added (GETBULK, better errors); why v3 exists. |
| 1.5 | `lab-environment-setup` | L | — | (Reused from the BGP path.) Install Docker and Containerlab so the labs run locally. Prerequisite for every lab below. |
| 1.6 | `snmp-observe-a-walk` | G | guided | A pre-configured agent + manager boot **ready**. Learner tours the MIB: `snmpget` sysDescr, `snmpwalk` the system tree, `snmpwalk` the interface table — pure observation, no config changes. |

---

## Module 2 — Polling with SNMPv2c

*First real configuration. Turn on an agent, then GET, WALK, and BULKWALK the data a monitoring system actually cares about.*

**Learning objectives:** enable an SNMPv2c agent with a read-only community; choose the right operation (GET vs GETNEXT vs WALK vs BULKWALK) for a task; query by numeric OID and by MIB name and control output format; read the interface table and interpret counters.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 2.1 | `snmp-enable-the-agent` | G | guided | Configure `snmpd.conf` on the agent: a read-only community (`rocommunity`), sysLocation and sysContact. Verify from the manager with `snmpget sysName.0`. |
| 2.2 | `snmp-get-walk-bulk` | G | guided | GET vs GETNEXT vs WALK vs BULKWALK in practice with `snmpget` / `snmpgetnext` / `snmpwalk` / `snmpbulkwalk`; numeric OIDs vs names; the `-O` output options. |
| 2.3 | `snmp-interface-table` | G | guided | Poll the interface MIB: ifDescr, ifOperStatus, ifInOctets / ifOutOctets, and ifIndex; how a tabular object is indexed and how counters become rates. |
| 2.4 | `snmp-polling-capstone` | C | challenge | **Blank slate:** stand up `snmpd` with a read-only community that exposes the system and interface MIBs, and prove the manager can read sysName and a live interface counter. |

---

## Module 3 — Securing SNMP with v3

*Community strings travel in clear text. Replace them with the User-based Security Model: authentication and privacy.*

**Learning objectives:** explain the v3 User-based Security Model (USM) and the three security levels; describe authentication (SHA) and privacy (AES) and the role of the engine ID; configure a v3 user and query at the right security level; argue why v3 replaces v2c for any exposed network.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 3.1 | `snmp-v3-security-model` | L | — | USM; the three security levels (noAuthNoPriv, authNoPriv, authPriv); auth (SHA) and priv (AES); the engine ID; why v3 beats community strings. |
| 3.2 | `snmp-configure-v3-user` | G | guided | Create a v3 authPriv user (SHA + AES) on the agent; query it from the manager with `-v3 -l authPriv -a SHA -x AES`; read the same objects you reached over v2c, now encrypted. |
| 3.3 | `snmp-v3-capstone` | C | challenge | **Blank slate:** configure a v3 authPriv user and remove v2c access; prove an authPriv query succeeds and that a wrong-credential or lower-security-level query is rejected. |

---

## Module 4 — Traps & Notifications

*Polling asks; traps tell. Let the agent push asynchronous events and catch them on the manager.*

**Learning objectives:** contrast traps and informs and the polling model; describe the common standard notifications; configure an agent to send notifications to a manager; run a trap receiver and confirm a notification arrived.

| # | id | type | mode | What it covers |
|---|-----|------|------|----------------|
| 4.1 | `snmp-traps-and-informs` | L | — | Asynchronous notifications; trap vs inform (acknowledged); UDP 162; `snmptrapd`; common notifications (coldStart, linkDown / linkUp, authenticationFailure). |
| 4.2 | `snmp-receive-a-trap` | G | guided | Point the agent's trap destination at the manager (`trap2sink`), run `snmptrapd` on the manager, trigger a notification, and confirm it lands in the trap log. |
| 4.3 | `snmp-monitoring-capstone` | C | challenge | **Path capstone, blank slate:** an agent secured with a v3 user and sending traps to the manager; the manager polls an interface counter and catches a linkDown trap, end to end. |

---

## SNMP lab conventions

These are the deltas from the BGP/FRR lab pattern documented in `.claude/skills/network-ninja-module-creator/SKILL.md`. They are recorded here so the authoring pass is unambiguous; none are implemented yet (this path is staged as "coming soon").

- **Image:** one net-snmp image serves both roles — `snmpd` for the agent, the `snmp*` client tools plus `snmptrapd` for the manager. Select and verify a real tag against the registry before pinning (per the skill's no-invented-tags rule). Evaluate at build time: a maintained public net-snmp image vs a thin custom `alpine` + `net-snmp` image published to a registry. Do not pin a guessed tag.
- **Nodes / addressing:** `nms` (manager) and `agent` (plus `agent2`, ... for multi-agent labs) on a management LAN `10.0.0.0/24` — nms `10.0.0.10`, agent `10.0.0.11`, extending `.12`, `.13`, ... Mirrors the BGP r1/r2 addressing convention.
- **`configs/` layout differs:** no FRR `daemons` file and no `frr.conf`. Bind `configs/agent/snmpd.conf` to `/etc/snmp/snmpd.conf`, and (trap labs) `configs/nms/snmptrapd.conf` to `/etc/snmp/snmptrapd.conf`. Guided `snmpd.conf` carries base config plus `# TODO:` markers; challenge strips it to minimal.
- **Process startup:** the agent must actually run `snmpd`, and trap labs need the manager running `snmptrapd`. Drive this from the topology (`cmd:` / `exec:`) or the image entrypoint; nail it in the first lab's verification pass.
- **`tasks.yaml`:** `display_command` is the learner-facing `docker exec -it clab-<lab>-nms snmpget/snmpwalk ...` (human-readable text). The `check.command` runs on `nms` and wraps net-snmp text output as JSON for the future auto-grader, e.g. `snmpget -Oqv -v2c -c public 10.0.0.11 sysName.0 | jq -R '{value: .}'` with `assert: { path: "$.value", contains: "agent" }`. Standardize this wrapper, and mark every assertion schema-derived / TO-CONFIRM until it is run on a live net-snmp deploy.
- **Diagrams:** reuse `<HierarchyTree>` for the OID/MIB tree (tier-based, an ideal fit); reuse `<ASTopology nodeShape="router">` for the manager/agent layout; use `<MessageTimeline>` for poll-vs-trap chatter. Build a new diagram component only if a poll/trap request-response shape genuinely needs one; never hand-roll SVG or ASCII.
