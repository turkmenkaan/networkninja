"use client";

/**
 * Reveal-solution disclosure. The solution MDX is rendered on the server and
 * passed in as `children`; this client island only gates its visibility so a
 * learner has to opt in to see the answer. Uses a native-ish disclosure with
 * proper aria wiring.
 */
import { useState, type ReactNode } from "react";
import { ArrowIcon } from "@/components/ui";

export function SolutionReveal({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="not-prose my-10 overflow-hidden rounded-2xl border border-sakura/25 bg-sakura/[0.04]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="solution-body"
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-sakura/[0.06]"
      >
        <span>
          <span className="font-display text-lg font-semibold text-paper">
            Reveal the solution
          </span>
          <span className="mt-0.5 block text-sm text-paper-muted">
            Stuck, or want to check your work? The full answer and reasoning.
          </span>
        </span>
        <ArrowIcon
          className={`h-5 w-5 shrink-0 text-sakura transition-transform duration-300 ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id="solution-body"
          className="prose prose-invert max-w-none border-t border-sakura/20 px-5 py-6 sm:px-7"
        >
          {children}
        </div>
      )}
    </section>
  );
}
