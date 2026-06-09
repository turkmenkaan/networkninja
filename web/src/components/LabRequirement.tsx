/**
 * LabRequirement — the "you need Containerlab installed" notice the unit page
 * shows on lab pages. `full` is the prominent version for the first lab in a
 * path; `compact` is a slim reminder for later labs. The setup details live in
 * the `lab-environment-setup` lesson; official install docs at containerlab.dev.
 */
import Link from "next/link";
import { FlaskIcon, ArrowIcon } from "@/components/ui";

const SETUP_HREF = "/units/lab-environment-setup";
const INSTALL_DOCS = "https://containerlab.dev/install/";

export function LabRequirement({ variant }: { variant: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="mt-6 flex items-center gap-2 rounded-lg border border-ember/25 bg-ember/[0.06] px-3.5 py-2.5 text-sm text-paper-muted">
        <FlaskIcon className="h-3.5 w-3.5 shrink-0 text-ember" />
        <span>
          Runs locally with Containerlab.{" "}
          <Link
            href={SETUP_HREF}
            className="font-medium text-ember underline decoration-ember/30 underline-offset-4 transition-colors hover:decoration-ember"
          >
            New to this? Set up your environment →
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-ember/30 bg-ember/[0.07] p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ember/30 bg-ember/10 text-ember">
          <FlaskIcon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-paper">
            Before you start: set up Containerlab
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-paper-muted">
            These labs run on your own machine with Docker and Containerlab, not
            in the browser. Set it up once and every lab just works.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href={SETUP_HREF}
              className="inline-flex items-center gap-2 rounded-lg border border-ember/40 bg-ember/15 px-3.5 py-2 text-sm font-medium text-ember transition-all hover:border-ember/70 hover:bg-ember/20"
            >
              <ArrowIcon className="h-4 w-4" />
              Set up your environment
            </Link>
            <a
              href={INSTALL_DOCS}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-paper-muted underline decoration-ink-line underline-offset-4 transition-colors hover:text-ember hover:decoration-ember/40"
            >
              Install Containerlab ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
