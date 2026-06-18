import Link from "next/link";
import type { Metadata } from "next";
import { listPathIds, loadPath, pathStats } from "@/lib/content/paths";
import { AvailablePathCard, ComingSoonPathCard } from "@/components/PathCard";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "Every NetworkNinjas learning path: hands-on, lab-driven networking courses you run yourself with Containerlab. Read the theory, boot real routers, verify your work.",
  alternates: { canonical: "/paths" },
};

type PathEntry = {
  path: NonNullable<ReturnType<typeof loadPath>>;
  stats: ReturnType<typeof pathStats>;
};

export default function PathsIndexPage() {
  const entries: PathEntry[] = listPathIds()
    .map((id) => loadPath(id))
    .filter((p): p is PathEntry["path"] => p != null)
    .map((path) => ({ path, stats: pathStats(path) }));

  // A path is "available" once it has at least one live unit; otherwise it is
  // advertised as coming soon. Available paths sort by how much is live.
  const available = entries
    .filter((e) => e.stats.published > 0)
    .sort((a, b) => b.stats.published - a.stats.published);
  const comingSoon = entries
    .filter((e) => e.stats.published === 0)
    .sort((a, b) => a.path.title.localeCompare(b.path.title));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Learning Paths",
        url: `${SITE_URL}/paths`,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: entries.map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: e.path.title,
            url: `${SITE_URL}/paths/${e.path.id}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Learning Paths",
            item: `${SITE_URL}/paths`,
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-shell px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
      <JsonLd data={structuredData} />

      {/* breadcrumb */}
      <nav className="mb-6 font-mono text-xs text-paper-faint">
        <Link href="/" className="transition-colors hover:text-blade">
          home
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-blade-dim">paths</span>
      </nav>

      <header className="animate-fade-up">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-blade-dim">
          All learning paths
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-paper sm:text-5xl">
          Learning Paths
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-paper-muted">
          Each path is a self-paced journey from first principles to real
          configuration: read the theory, then boot genuine routers with
          Containerlab and verify your own work. Pick a path and start training.
        </p>
      </header>

      {available.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-blade-dim">
            Available now
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {available.map(({ path, stats }) => (
              <AvailablePathCard key={path.id} path={path} stats={stats} />
            ))}
          </div>
        </section>
      )}

      {comingSoon.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-blade-dim">
            Coming soon
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {comingSoon.map(({ path, stats }) => (
              <ComingSoonPathCard key={path.id} path={path} stats={stats} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
