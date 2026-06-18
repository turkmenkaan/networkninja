import Link from "next/link";
import { Logo } from "./Logo";
import { AuthButton } from "./auth/AuthButton";

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
            Network<span className="text-blade">Ninjas</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/paths"
            className="hidden rounded-lg px-3 py-1.5 text-paper-muted transition-colors hover:bg-ink-glow hover:text-paper sm:inline-block"
          >
            Paths
          </Link>
          <Link
            href="/field-notes"
            className="hidden rounded-lg px-3 py-1.5 text-paper-muted transition-colors hover:bg-ink-glow hover:text-paper sm:inline-block"
          >
            Field Notes
          </Link>
          <Link
            href="/paths/bgp-fundamentals"
            className="ml-2 hidden rounded-lg border border-blade/30 bg-blade/10 px-3.5 py-1.5 font-medium text-blade transition-all hover:border-blade/60 hover:bg-blade/15 sm:inline-block"
          >
            Start training
          </Link>
          <span className="ml-1 hidden h-5 w-px bg-ink-line sm:block" aria-hidden />
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
