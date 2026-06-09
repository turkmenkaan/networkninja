"use client";

/**
 * A tiny completion indicator for a single unit, used in the path's unit list.
 * Reflects `complete` from the progress store. Purely presentational — the
 * actual toggle lives on the unit page (MarkComplete).
 */
import { useProgress } from "@/lib/progress/useProgress";
import { isUnitComplete } from "@/lib/progress/store";
import { CheckIcon } from "@/components/ui";

export function UnitCompleteDot({ unitId }: { unitId: string }) {
  const { state } = useProgress();
  const done = isUnitComplete(state, unitId);
  return (
    <span
      aria-label={done ? "Completed" : "Not started"}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
        done
          ? "border-blade/50 bg-blade/15 text-blade"
          : "border-ink-line bg-ink-inset text-transparent"
      }`}
    >
      <CheckIcon className="h-3.5 w-3.5" />
    </span>
  );
}
