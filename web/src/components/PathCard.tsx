import Link from "next/link";
import type { LearningPath } from "@/lib/content/types";
import type { pathStats } from "@/lib/content/paths";
import { ArrowIcon } from "@/components/ui";

type PathStats = ReturnType<typeof pathStats>;

export interface PathCardProps {
  path: LearningPath;
  stats: PathStats;
}

/**
 * A path that has at least one live unit: rendered as an active, clickable
 * card with live content stats. Shared by the landing page and /paths index so
 * the two never drift on what counts as "available".
 */
export function AvailablePathCard({ path, stats }: PathCardProps) {
  return (
    <Link
      href={`/paths/${path.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-line bg-ink-raised/60 p-6 shadow-panel transition-colors hover:border-blade/40 hover:bg-ink-glow/40"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-blade-dim">
          Learning path · {path.status}
        </span>
        <ArrowIcon className="h-4 w-4 shrink-0 text-paper-faint transition-all group-hover:translate-x-0.5 group-hover:text-blade" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-paper transition-colors group-hover:text-blade">
        {path.title}
      </h3>
      <p className="mt-2 flex-1 leading-relaxed text-paper-muted">
        {path.summary}
      </p>
      <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs text-paper-faint">
        <span className="rounded-full border border-ink-line px-2.5 py-1">
          {stats.published} live units
          {stats.planned > 0 ? ` · ${stats.planned} coming` : ""}
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
    </Link>
  );
}

/**
 * A path with no live units yet: rendered as a dashed "coming soon" card.
 */
export function ComingSoonPathCard({ path, stats }: PathCardProps) {
  const plannedCount = stats.published + stats.planned;
  return (
    <Link
      href={`/paths/${path.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-dashed border-ink-line bg-ink-raised/40 p-6 transition-colors hover:border-blade/40 hover:bg-ink-raised/60"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ember">
          Coming soon
        </span>
        <ArrowIcon className="h-4 w-4 text-paper-faint transition-all group-hover:translate-x-0.5 group-hover:text-blade" />
      </div>
      <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-paper transition-colors group-hover:text-blade">
        {path.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-paper-muted">
        {path.summary}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-paper-faint">
        <span className="rounded-full border border-ink-line px-2.5 py-1">
          {path.modules.length} modules · {plannedCount} units planned
        </span>
        {path.network_os && (
          <span className="rounded-full border border-ink-line px-2.5 py-1">
            {path.network_os}
          </span>
        )}
      </div>
    </Link>
  );
}
