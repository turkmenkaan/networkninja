"use client";

/**
 * "Mark complete" control for a unit. Toggles the unit's completion flag in the
 * progress store. Hydration-safe: renders a stable disabled shell on the server
 * snapshot (always incomplete) and lights up once the store hydrates.
 */
import posthog from "posthog-js";
import { useProgress } from "@/lib/progress/useProgress";
import { isUnitComplete } from "@/lib/progress/store";
import { CheckIcon } from "@/components/ui";

export function MarkComplete({ unitId }: { unitId: string }) {
  const { state, setUnitComplete } = useProgress();
  const done = isUnitComplete(state, unitId);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !done;
        setUnitComplete(unitId, next);
        posthog.capture(next ? "unit_completed" : "unit_uncompleted", {
          unit_id: unitId,
        });
      }}
      aria-pressed={done}
      className={`group inline-flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
        done
          ? "border-blade/50 bg-blade/15 text-blade hover:bg-blade/20"
          : "border-ink-line bg-ink-raised text-paper hover:border-blade/40 hover:bg-ink-glow"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
          done
            ? "border-blade bg-blade text-ink"
            : "border-paper-faint text-transparent group-hover:border-blade"
        }`}
      >
        <CheckIcon className="h-3 w-3" />
      </span>
      {done ? "Completed" : "Mark complete"}
    </button>
  );
}
