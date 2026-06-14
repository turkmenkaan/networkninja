"use client";

/**
 * Frames a diagram (figure styling) and adds an "expand" affordance: a button
 * that opens the same diagram in a large modal (~70% of the viewport). Useful
 * for dense topologies that are hard to read inline. The diagram SVG scales
 * with its container (viewBox + w-full), so the modal copy is simply bigger.
 *
 * Server components (e.g. <ASTopology>) pass their rendered content as children;
 * this client island handles the interactivity, so pages stay statically rendered.
 */
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ExpandIcon, CloseIcon } from "@/components/ui";

export function ZoomableFigure({
  children,
  label = "diagram",
}: {
  children: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <figure className="relative my-7 rounded-xl border border-ink-line bg-ink-inset px-4 pb-3.5 pt-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      {children}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Expand ${label}`}
        title="Expand"
        className="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-ink-line bg-ink-raised/80 text-paper-faint opacity-70 transition-all hover:border-blade/50 hover:text-blade hover:opacity-100"
      >
        <ExpandIcon className="h-3.5 w-3.5" />
      </button>

      {open && mounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={label}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm sm:p-8"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[86vh] w-[92vw] overflow-auto rounded-2xl border border-ink-line bg-ink-inset p-6 shadow-panel sm:w-[70vw] sm:p-10"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-line bg-ink-raised text-paper-muted transition-colors hover:border-blade/50 hover:text-blade"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
                <div className="[&_svg]:w-full">{children}</div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </figure>
  );
}
