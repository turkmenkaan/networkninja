"use client";

/**
 * Overall path progress bar. Client island: reads completion counts from the
 * progress store (localStorage today, Postgres later — see lib/progress/store.ts).
 */
import { useProgress } from "@/lib/progress/useProgress";
import { countComplete } from "@/lib/progress/store";

export function PathProgress({ unitIds }: { unitIds: string[] }) {
  const { state } = useProgress();
  const total = unitIds.length;
  const done = countComplete(state, unitIds);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="rounded-2xl border border-ink-line bg-ink-raised/60 p-5 shadow-panel">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-paper-faint">
          Your progress
        </span>
        <span className="font-display text-sm font-semibold text-paper">
          {done}
          <span className="text-paper-faint"> / {total} units</span>
        </span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-ink-inset"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Path completion"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-blade-dim to-blade transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-[0.7rem] text-paper-faint">
        {pct}% complete · saved in this browser
      </p>
    </div>
  );
}
