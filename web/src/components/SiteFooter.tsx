import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink-line/70">
      <div className="mx-auto max-w-shell px-5 py-12 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 font-display font-bold">
              <Logo className="h-6 w-6 text-blade" />
              Network<span className="-ml-1.5 text-blade">Ninja</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-paper-faint">
              Hands-on networking education. Read the theory, then run real
              labs yourself with Containerlab. Content lives in git — this app
              renders it.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <span className="col-span-2 mb-1 font-mono text-xs uppercase tracking-[0.18em] text-paper-faint">
              Learn
            </span>
            <Link
              href="/paths/bgp-fundamentals"
              className="text-paper-muted transition-colors hover:text-blade"
            >
              BGP Fundamentals
            </Link>
            <a
              href="https://docs.frrouting.org"
              target="_blank"
              rel="noreferrer"
              className="text-paper-muted transition-colors hover:text-blade"
            >
              FRRouting docs
            </a>
            <a
              href="https://containerlab.dev"
              target="_blank"
              rel="noreferrer"
              className="text-paper-muted transition-colors hover:text-blade"
            >
              Containerlab
            </a>
            <a
              href="https://bgp.tools"
              target="_blank"
              rel="noreferrer"
              className="text-paper-muted transition-colors hover:text-blade"
            >
              bgp.tools
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-ink-line/60 pt-6 font-mono text-xs text-paper-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} NetworkNinja</span>
        </div>
      </div>
    </footer>
  );
}
