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
  return { title: path.title, description: path.summary };
}

export default function PathPage({ params }: { params: { pathId: string } }) {
  const path = loadPath(params.pathId);
  if (!path) notFound();

  const flat = flattenPath(path);
  const stats = pathStats(path);
  const flatIds = flat.map((u) => u.id);

  return (
    <div className="mx-auto max-w-shell px-5 pb-12 pt-12 sm:px-8 sm:pt-16">
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

function prettifyId(id: string): string {
  return id
    .replace(/^bgp-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
