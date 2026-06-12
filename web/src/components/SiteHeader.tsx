import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-line/70 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-shell items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-display text-[15px] font-bold tracking-tight"
        >
          <Logo className="h-7 w-7 text-blade transition-transform duration-500 group-hover:rotate-[135deg]" />
          <span>
            Network<span className="text-blade">Ninja</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/paths/bgp-fundamentals"
            className="rounded-lg px-3 py-1.5 text-paper-muted transition-colors hover:bg-ink-glow hover:text-paper"
          >
            BGP Path
          </Link>
          <Link
            href="/paths/bgp-fundamentals"
            className="ml-2 rounded-lg border border-blade/30 bg-blade/10 px-3.5 py-1.5 font-medium text-blade transition-all hover:border-blade/60 hover:bg-blade/15"
          >
            Start training
          </Link>
        </nav>
      </div>
    </header>
  );
}
