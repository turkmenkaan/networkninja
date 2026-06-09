"use client";

/**
 * Lab self-verify checklist (Tier 1).
 *
 * Each objective shows its description, the read-only verification command in
 * mono (the same command Tier 2 will run to auto-grade), and a learner-driven
 * checkbox persisted via the progress store. An optional hint is revealed on
 * demand. Checkbox state is purely local self-assessment — no execution here.
 */
import { useState } from "react";
import type { Objective } from "@/lib/content/types";
import { useProgress } from "@/lib/progress/useProgress";
import { objectiveChecked } from "@/lib/progress/store";
import { CheckIcon } from "@/components/ui";

export function ObjectivesChecklist({
  unitId,
  objectives,
}: {
  unitId: string;
  objectives: Objective[];
}) {
  const { state, toggleObjective } = useProgress();
  const done = objectives.filter((o) => objectiveChecked(state, unitId, o.id)).length;

  return (
    <section aria-labelledby="objectives-heading" className="not-prose">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="objectives-heading"
          className="font-display text-xl font-semibold text-paper"
        >
          Objectives
        </h2>
        <span className="font-mono text-xs text-paper-faint">
          {done}/{objectives.length} verified
        </span>
      </div>
      <p className="mb-5 text-sm text-paper-muted">
        Run each read-only check on the live lab and tick it off. These are the
        exact commands the auto-grader will run later.
      </p>

      <ul className="space-y-3">
        {objectives.map((o) => (
          <ObjectiveRow
            key={o.id}
            unitId={unitId}
            objective={o}
            checked={objectiveChecked(state, unitId, o.id)}
            onToggle={(v) => toggleObjective(unitId, o.id, v)}
          />
        ))}
      </ul>
    </section>
  );
}

function ObjectiveRow({
  objective,
  checked,
  onToggle,
}: {
  unitId: string;
  objective: Objective;
  checked: boolean;
  onToggle: (v: boolean) => void;
}) {
  const [showHint, setShowHint] = useState(false);
  const cmd = objective.check?.command;
  const node = objective.check?.node;

  return (
    <li
      className={`rounded-xl border p-4 transition-colors ${
        checked ? "border-blade/40 bg-blade/[0.06]" : "border-ink-line bg-ink-raised/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          onClick={() => onToggle(!checked)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
            checked
              ? "border-blade bg-blade text-ink"
              : "border-paper-faint text-transparent hover:border-blade"
          }`}
        >
          <CheckIcon className="h-3 w-3" />
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm leading-relaxed ${
              checked ? "text-paper" : "text-paper-muted"
            }`}
          >
            {objective.description}
          </p>

          {cmd && (
            <div className="mt-2.5 overflow-x-auto rounded-lg border border-ink-line bg-ink-inset px-3 py-2 font-mono text-[0.78rem] text-paper-muted">
              {node && <span className="select-none text-blade-dim">{node}$ </span>}
              <span className="text-paper">{cmd}</span>
            </div>
          )}

          {objective.hint && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowHint((s) => !s)}
                aria-expanded={showHint}
                className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-blade-dim transition-colors hover:text-blade"
              >
                {showHint ? "− hide hint" : "+ hint"}
              </button>
              {showHint && (
                <p className="mt-2 rounded-lg border-l-2 border-ember/50 bg-ember/[0.06] py-2 pl-3 pr-3 text-sm leading-relaxed text-paper-muted">
                  {objective.hint}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
