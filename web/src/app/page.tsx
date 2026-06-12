import Link from "next/link";
import {
  loadPath,
  pathStats,
  listPathIds,
} from "@/lib/content/paths";
import { Logo } from "@/components/Logo";
import { ArrowIcon, FlaskIcon, BookIcon } from "@/components/ui";
import { NotifySignup } from "@/components/NotifySignup";
import { JsonLd } from "@/components/JsonLd";
import { Faq } from "@/components/Faq";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const HOME_FAQ = [
  {
    q: "Is NetworkNinja free?",
    a: "Yes. Every lesson and every lab is free right now. The labs run on your own machine with Containerlab, so there is nothing to pay for and no account required to start.",
  },
  {
    q: "Do I need to install anything?",
    a: "The lessons need only a browser. To run a lab you need Docker and Containerlab, on Linux directly or through Docker Desktop's Linux VM on macOS and Windows. Each lab deploys with a single containerlab command, and the lab-environment-setup lesson walks you through it once.",
  },
  {
    q: "What is Containerlab, and are these real routers?",
    a: "Containerlab is an open-source tool that boots real network-OS containers and wires them together with virtual links. NetworkNinja labs run genuine FRRouting routers, so you practice on the same vtysh CLI and real BGP that production networks use, not a simplified simulator.",
  },
  {
    q: "Do I need prior networking experience?",
    a: "Comfort with IP addressing and subnets is enough to begin. The BGP path starts from why BGP exists and builds up to configuring eBGP and iBGP, steering path selection, and writing routing policy.",
  },
  {
    q: "Is this videos or multiple-choice quizzes?",
    a: "Neither. You read tight, operator-grade theory, then boot real routers, break things, and verify your work with the same read-only checks a grader would run. The CLI you learn is the CLI production runs.",
  },
];

export default function HomePage() {
  const path = loadPath("bgp-fundamentals");
  const stats = path ? pathStats(path) : null;
  const moduleCount = path?.modules.length ?? 0;

  // Every other path (e.g. OSPF) is advertised as "coming soon" until its units
  // are authored. Driven by the manifest directory so new paths appear here
  // automatically without touching this file.
  const upcomingPaths = listPathIds()
    .filter((id) => id !== "bgp-fundamentals")
    .map((id) => loadPath(id))
    .filter((p): p is NonNullable<typeof p> => p != null)
    .map((p) => ({ path: p, stats: pathStats(p) }));

  const orgId = `${SITE_URL}/#organization`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        description:
          "Hands-on networking education: learn by running real FRR routers with Containerlab.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": orgId },
        description:
          "Learn networking the way operators actually work: read the theory, then drop into real FRR labs you run yourself with Containerlab.",
      },
    ],
  };

  return (
    <div className="mx-auto max-w-shell px-5 sm:px-8">
      <JsonLd data={structuredData} />
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden pb-16 pt-16 sm:pt-24">
        {/* atmospheric blade sweep behind the headline */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 right-0 hidden h-72 w-72 rounded-full bg-blade/10 blur-3xl lg:block"
        />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="min-w-0 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-line bg-ink-raised/70 px-3 py-1 font-mono text-xs text-paper-muted">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-blade" />
              hands-on networking · FRR + Containerlab
            </span>

            <h1 className="mt-6 font-display text-[2.1rem] font-extrabold leading-[1.05] tracking-tight text-paper break-words min-[400px]:text-[2.6rem] sm:text-6xl">
              Stop reading
              <br />
              about networks.
              <br />
              <span className="relative inline-block text-blade">
                Run them.
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[3px] w-full bg-gradient-to-r from-blade to-transparent"
                />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper-muted">
              NetworkNinja pairs sharp, no-fluff theory with{" "}
              <span className="text-paper">real labs you boot yourself</span>:
              actual FRRouting routers wired up with Containerlab. Read it,
              break it, fix it. Master BGP the way operators actually work.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/paths/bgp-fundamentals"
                className="group inline-flex items-center gap-2 rounded-xl border border-blade/40 bg-blade/15 px-5 py-3 font-medium text-blade transition-all hover:border-blade/70 hover:bg-blade/20"
              >
                Start the BGP path
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#paths"
                className="inline-flex items-center gap-2 rounded-xl border border-ink-line bg-ink-raised px-5 py-3 font-medium text-paper transition-colors hover:bg-ink-glow"
              >
                See Learning Paths
              </Link>
            </div>
          </div>

          {/* terminal vignette */}
          <div className="min-w-0 animate-fade-up [animation-delay:120ms]">
            <TerminalCard />
          </div>
        </div>
      </section>

      {/* ───────────────────── Live stats strip ───────────────────── */}
      {stats && (
        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-line bg-ink-line sm:grid-cols-4">
          <Stat label="Modules" value={moduleCount} />
          <Stat label="Live units" value={stats.published} />
          <Stat label="Hands-on labs" value={stats.labs} accent />
          <Stat label="Minutes of content" value={stats.totalMinutes} />
        </section>
      )}

      {/* ───────────────────── How it works ───────────────────── */}
      <section className="py-20">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-blade-dim">
          The loop
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Step
            n="01"
            icon={<BookIcon className="h-5 w-5" />}
            title="Read the theory"
            body="Tight, operator-grade lessons. No 40-minute videos, just the mental model you need, with the protocol mechanics made concrete."
          />
          <Step
            n="02"
            icon={<FlaskIcon className="h-5 w-5" />}
            title="Boot a real lab"
            body="Download a Containerlab topology and bring up genuine FRR routers on your own machine. The CLI you learn is the CLI production runs."
          />
          <Step
            n="03"
            icon={<ArrowIcon className="h-5 w-5" />}
            title="Verify yourself"
            body="Each lab ships a self-verify checklist of real read-only checks, the same ones a future auto-grader will run. Prove it's Established."
          />
        </div>
      </section>

      {/* ───────────────────── Hero path card ───────────────────── */}
      {path && stats && (
        <section id="paths" className="scroll-mt-20 pb-8">
          <Link
            href={`/paths/${path.id}`}
            className="group block overflow-hidden rounded-3xl border border-ink-line bg-ink-raised/60 shadow-panel transition-colors hover:border-blade/40"
          >
            <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-blade-dim">
                  Featured path · {path.status}
                </span>
                <h3 className="mt-3 font-display text-3xl font-bold tracking-tight text-paper">
                  {path.title}
                </h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-paper-muted">
                  {path.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs text-paper-faint">
                  <span className="rounded-full border border-ink-line px-2.5 py-1">
                    {stats.published} live · {stats.planned} coming
                  </span>
                  <span className="rounded-full border border-ink-line px-2.5 py-1">
                    {stats.labs} labs
                  </span>
                  <span className="rounded-full border border-ink-line px-2.5 py-1">
                    {path.network_os}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start lg:self-center">
                <Logo className="h-16 w-16 text-blade/80 transition-transform duration-700 group-hover:rotate-[135deg]" />
                <ArrowIcon className="h-6 w-6 text-paper-faint transition-all group-hover:translate-x-1 group-hover:text-blade" />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ───────────────────── Upcoming paths ───────────────────── */}
      {upcomingPaths.length > 0 && (
        <section className="pb-8">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-blade-dim">
            More paths landing soon
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {upcomingPaths.map(({ path: p, stats: s }) => (
              <ComingSoonPathCard
                key={p.id}
                id={p.id}
                title={p.title}
                summary={p.summary}
                moduleCount={p.modules.length}
                plannedCount={s.published + s.planned}
                networkOs={p.network_os}
              />
            ))}
          </div>
        </section>
      )}

      {/* ───────────────────────── FAQ ───────────────────────── */}
      <Faq items={HOME_FAQ} heading="Frequently asked" className="pb-8" />

      {/* ───────────────────── Notify signup ───────────────────── */}
      <section className="pb-20">
        <div className="overflow-hidden rounded-3xl border border-ink-line bg-ink-raised/60 p-8 shadow-panel sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-blade-dim">
                Stay in the loop
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
                Get pinged when new lessons &amp; labs land
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-paper-muted">
                The BGP path is filling in module by module, with more paths on
                the way. Drop your email and we&apos;ll let you know when fresh
                content drops.
              </p>
            </div>
            <NotifySignup source="landing" className="w-full lg:w-[24rem]" />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="bg-ink px-5 py-6 text-center">
      <div
        className={`font-display text-3xl font-bold tracking-tight ${
          accent ? "text-blade" : "text-paper"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-paper-faint">
        {label}
      </div>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-line bg-ink-raised/50 p-6 transition-colors hover:border-ink-line hover:bg-ink-glow/50">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blade/25 bg-blade/10 text-blade">
          {icon}
        </span>
        <span className="font-mono text-sm text-paper-faint">{n}</span>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-paper">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-paper-muted">{body}</p>
    </div>
  );
}

function ComingSoonPathCard({
  id,
  title,
  summary,
  moduleCount,
  plannedCount,
  networkOs,
}: {
  id: string;
  title: string;
  summary: string;
  moduleCount: number;
  plannedCount: number;
  networkOs?: string;
}) {
  return (
    <Link
      href={`/paths/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-dashed border-ink-line bg-ink-raised/40 p-6 transition-colors hover:border-blade/40 hover:bg-ink-raised/60"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ember">
          Coming soon
        </span>
        <ArrowIcon className="h-4 w-4 text-paper-faint transition-all group-hover:translate-x-0.5 group-hover:text-blade" />
      </div>
      <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-paper transition-colors group-hover:text-blade">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-paper-muted">
        {summary}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-paper-faint">
        <span className="rounded-full border border-ink-line px-2.5 py-1">
          {moduleCount} modules · {plannedCount} units planned
        </span>
        {networkOs && (
          <span className="rounded-full border border-ink-line px-2.5 py-1">
            {networkOs}
          </span>
        )}
      </div>
    </Link>
  );
}

/** A static, decorative terminal showing a BGP session coming up. */
function TerminalCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-line bg-ink-inset shadow-panel">
      <div className="flex items-center gap-2 border-b border-ink-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sakura/60" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-ember/60" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blade/60" />
        <span className="ml-2 truncate font-mono text-[0.7rem] text-paper-faint">
          clab-bgp-ebgp-peering-r1: vtysh
        </span>
      </div>
      <pre className="!my-0 overflow-x-auto !rounded-none !border-0 !bg-transparent !px-4 !py-4 font-mono text-[0.78rem] leading-relaxed">
        <code className="block text-paper-muted">
          <span className="text-blade-dim">r1#</span> show ip bgp summary{"\n"}
          {"\n"}
          Neighbor        V    AS   MsgRcvd  Up/Down  State{"\n"}
          <span className="text-paper">10.0.12.2</span>       4 65002        12{" "}
          <span className="text-blade">00:00:48 </span>
          <span className="text-blade">Established</span>
          {"\n"}
          {"\n"}
          <span className="text-blade-dim">r1#</span> show ip bgp 2.2.2.2/32{"\n"}
          {"  "}<span className="text-ember">2.2.2.2/32</span> via 10.0.12.2,
          AS_PATH <span className="text-paper">65002</span>
          {"\n"}
          <span className="inline-block h-3.5 w-2 translate-y-0.5 animate-pulse-dot bg-blade" />
        </code>
      </pre>
    </div>
  );
}
