import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  listPathIds,
  loadPath,
  flattenPath,
  pathStats,
} from "@/lib/content/paths";
import type { PathModule, PathUnitRef } from "@/lib/content/types";
import {
  DifficultyBadge,
  TypeBadge,
  StatusBadge,
  MinutesBadge,
  ArrowIcon,
} from "@/components/ui";
import { PathProgress } from "@/components/progress/PathProgress";
import { UnitCompleteDot } from "@/components/progress/UnitCompleteDot";
import { JsonLd } from "@/components/JsonLd";
import { Faq, type FaqItem } from "@/components/Faq";
import { SITE_URL, SITE_NAME } from "@/lib/site";

type PathFaqStats = { moduleCount: number; unitCount: number; minutes: number };

/**
 * Per-path FAQ content, keyed by path id. Paths without an entry render no FAQ
 * section. Answers may use live stats, but an entry for a path that is still
 * "coming soon" should avoid them, since its counts are zero.
 */
const PATH_FAQS: Record<string, (stats: PathFaqStats) => FaqItem[]> = {
  "bgp-fundamentals": ({ moduleCount, unitCount, minutes }) => [
    {
      q: "What do I need to run the BGP labs?",
      a: "Docker and Containerlab. Each lab downloads as a Containerlab topology plus the FRR router configs, and deploys with a single containerlab command. The first lab links a one-time environment-setup guide.",
    },
    {
      q: "Do the labs use real BGP?",
      a: "Yes. Every lab boots genuine FRRouting routers (frrouting/frr) running production BGP, and you drive them with the same vtysh CLI used in the field, not a simulator.",
    },
    {
      q: "Does this cover both eBGP and iBGP?",
      a: "Both, in dedicated modules. The path moves from eBGP fundamentals to iBGP (full mesh, loopback peering over an IGP, next-hop-self), then path attributes and best-path selection, and finally route filtering and policy.",
    },
    {
      q: "How long is the BGP Fundamentals path?",
      a: `${moduleCount} modules covering ${unitCount} hands-on lessons and labs, roughly ${minutes} minutes of content. It is self-paced, so you can work through a module at a time.`,
    },
    {
      q: "Will this help with CCNP or other certs?",
      a: "It is hands-on BGP practice that complements cert study such as CCNP or JNCIA. It is not a certification course, but the real configuration and troubleshooting skills transfer directly to the exams and to the job.",
    },
  ],
  "network-plus-labs": () => [
    {
      q: "Is this an official CompTIA course?",
      a: "No. NetworkNinjas is not affiliated with or endorsed by CompTIA. These are independent hands-on labs mapped to the Network+ (N10-009) exam objectives, built to sit alongside whatever course or study guide you learn the theory from.",
    },
    {
      q: "Does this cover the whole Network+ exam?",
      a: "No, deliberately. It covers the objectives you can actually practice at a keyboard: addressing and subnetting, switching and VLANs, routing, network services like DHCP and DNS, edge security, and troubleshooting. Topics that are memorization rather than practice, such as cabling, connectors, wireless standards, and cloud service models, are better learned from a video course or book.",
    },
    {
      q: "What do I need to run the labs?",
      a: "Docker and Containerlab, the same as every NetworkNinjas lab. Each lab downloads as a Containerlab topology and deploys with a single command. A one-time setup guide walks you through installing both.",
    },
    {
      q: "What is a break-fix lab?",
      a: "A lab that boots already broken. Instead of steps to follow, you get the symptoms, then diagnose and fix the fault with the same tools you would use on the job. Troubleshooting is the largest domain on the exam, so the path is built around these.",
    },
  ],
};

function pathFaqItems(
  pathId: string,
  moduleCount: number,
  unitCount: number,
  minutes: number,
): FaqItem[] {
  return PATH_FAQS[pathId]?.({ moduleCount, unitCount, minutes }) ?? [];
}

export function generateStaticParams() {
  return listPathIds().map((pathId) => ({ pathId }));
}

export function generateMetadata({
  params,
}: {
  params: { pathId: string };
}): Metadata {
  const path = loadPath(params.pathId);
  if (!path) return { title: "Path not found" };
  return {
    title: path.title,
    description: path.summary,
    alternates: { canonical: `/paths/${path.id}` },
  };
}

export default function PathPage({ params }: { params: { pathId: string } }) {
  const path = loadPath(params.pathId);
  if (!path) notFound();

  const flat = flattenPath(path);
  const stats = pathStats(path);
  const flatIds = flat.map((u) => u.id);
  const faqItems = pathFaqItems(
    path.id,
    path.modules.length,
    stats.published,
    stats.totalMinutes,
  );

  const course = {
    "@type": "Course",
    name: path.title,
    description: path.summary,
    url: `${SITE_URL}/paths/${path.id}`,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    teaches: path.modules.map((m) => m.title),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      category: "Free",
    },
    ...(stats.totalMinutes > 0
      ? {
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "online",
            courseWorkload: `PT${stats.totalMinutes}M`,
          },
        }
      : {}),
    // The path's live units, in order, as parts of the course.
    ...(flat.length
      ? {
          hasPart: flat.map((u) => ({
            "@type": "LearningResource",
            name: u.meta.title,
            url: `${SITE_URL}/units/${u.id}`,
            learningResourceType:
              u.meta.type === "lab" ? "Lab exercise" : "Lesson",
          })),
        }
      : {}),
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      course,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: path.title,
            item: `${SITE_URL}/paths/${path.id}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-shell px-5 pb-12 pt-12 sm:px-8 sm:pt-16">
      <JsonLd data={structuredData} />
      {/* breadcrumb */}
      <nav className="mb-6 font-mono text-xs text-paper-faint">
        <Link href="/" className="transition-colors hover:text-blade">
          home
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-paper-muted">paths</span>
        <span className="px-1.5">/</span>
        <span className="text-blade-dim">{path.id}</span>
      </nav>

      <header className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="animate-fade-up">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-blade-dim">
            Learning path · {path.status}
          </span>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-paper sm:text-5xl">
            {path.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-paper-muted">
            {path.summary}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs text-paper-faint">
            <span className="rounded-full border border-ink-line px-2.5 py-1">
              {stats.published} live units
            </span>
            <span className="rounded-full border border-ink-line px-2.5 py-1">
              {stats.labs} labs · {stats.lessons} lessons
            </span>
            <span className="rounded-full border border-ink-line px-2.5 py-1">
              ~{stats.totalMinutes} min
            </span>
            {path.network_os && (
              <span className="rounded-full border border-ink-line px-2.5 py-1">
                {path.network_os}
              </span>
            )}
          </div>
        </div>

        <div className="animate-fade-up lg:sticky lg:top-20 [animation-delay:100ms]">
          <PathProgress unitIds={flatIds} />
        </div>
      </header>

      {/* modules */}
      <div className="mt-14 space-y-12">
        {path.modules.map((mod, i) => (
          <ModuleSection key={mod.id} mod={mod} index={i} />
        ))}
      </div>

      {faqItems.length > 0 && (
        <Faq items={faqItems} heading="Path FAQ" className="mt-16" />
      )}
    </div>
  );
}

function ModuleSection({ mod, index }: { mod: PathModule; index: number }) {
  const liveCount = mod.units.filter(
    (u) => u.status === "published" && u.meta,
  ).length;

  return (
    <section>
      <div className="mb-5 flex items-baseline gap-4">
        <span className="font-mono text-sm text-blade-dim">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 className="font-display text-2xl font-bold tracking-tight text-paper">
          {mod.title}
        </h2>
        <span className="font-mono text-xs text-paper-faint">
          {liveCount} / {mod.units.length} ready
        </span>
      </div>

      <ol className="space-y-2.5">
        {mod.units.map((u) => (
          <UnitRow key={u.id} unit={u} />
        ))}
      </ol>
    </section>
  );
}

function UnitRow({ unit }: { unit: PathUnitRef }) {
  const live = unit.status === "published" && unit.meta;

  if (!live) {
    // Locked / coming-soon treatment.
    return (
      <li className="flex items-center gap-4 rounded-xl border border-dashed border-ink-line/80 bg-ink-raised/30 px-4 py-3.5 opacity-80">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink-line bg-ink-inset text-ember">
          <LockGlyph />
        </span>
        <div className="min-w-0 flex-1">
          <span className="font-display text-base font-medium text-paper-muted">
            {unit.meta?.title ?? prettifyId(unit.id)}
          </span>
          {unit.meta?.summary && (
            <p className="mt-0.5 truncate text-sm text-paper-faint">
              {unit.meta.summary}
            </p>
          )}
        </div>
        <StatusBadge status={unit.status} />
      </li>
    );
  }

  const meta = unit.meta!;
  return (
    <li>
      <Link
        href={`/units/${unit.id}`}
        className="group flex items-center gap-4 rounded-xl border border-ink-line bg-ink-raised/50 px-4 py-3.5 transition-all hover:border-blade/40 hover:bg-ink-glow/60"
      >
        <UnitCompleteDot unitId={unit.id} />

        <div className="min-w-0 flex-1">
          <span className="font-display text-base font-semibold text-paper transition-colors group-hover:text-blade">
            {meta.title}
          </span>
          <p className="mt-0.5 line-clamp-1 text-sm text-paper-muted">
            {meta.summary}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2.5 sm:flex">
          <TypeBadge type={meta.type} mode={meta.mode} />
          <DifficultyBadge difficulty={meta.difficulty} />
          <MinutesBadge minutes={meta.estimated_minutes} />
        </div>

        <ArrowIcon className="h-4 w-4 shrink-0 text-paper-faint transition-all group-hover:translate-x-0.5 group-hover:text-blade" />
      </Link>
    </li>
  );
}

// Acronyms rendered fully uppercased when a planned unit id is prettified.
const ACRONYMS = new Set([
  // routing
  "BGP", "OSPF", "ISIS", "MPLS", "RPKI", "EVPN", "VXLAN", "IGP", "AS",
  "DR", "BDR", "NSSA", "LSA", "MED", "VRF", "L3VPN", "ECMP", "BFD",
  // management
  "SNMP", "MIB", "OID", "PDU", "NMS",
  // core networking
  "OSI", "TCP", "UDP", "IP", "ICMP", "ARP", "MAC", "MTU",
  "LAN", "WAN", "VLAN", "STP", "CIDR", "VLSM",
  "DHCP", "DNS", "NTP", "ACL", "NAT", "PAT", "VPN", "VRRP", "SSH", "TLS",
  "DORA",
]);

// Acronyms that are not uniformly uppercase, keyed by their uppercased form.
const MIXED_CASE_ACRONYMS = new Map([
  ["IPV4", "IPv4"],
  ["IPV6", "IPv6"],
  ["QOS", "QoS"],
]);

function prettifyId(id: string): string {
  return id
    .replace(/^(bgp|ospf|isis|mpls|rpki|snmp|netplus)-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w+/g, (w) => {
      const upper = w.toUpperCase();
      const mixed = MIXED_CASE_ACRONYMS.get(upper);
      if (mixed) return mixed;
      if (ACRONYMS.has(upper)) return upper;
      // Pluralized acronyms: "vlans" -> "VLANs", "acls" -> "ACLs".
      const singular = upper.slice(0, -1);
      if (upper.endsWith("S") && ACRONYMS.has(singular)) return `${singular}s`;
      return w.charAt(0).toUpperCase() + w.slice(1);
    });
}

function LockGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
      <rect
        x="3.5"
        y="7"
        width="9"
        height="6.5"
        rx="1.3"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
