import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ArrowIcon } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-shell flex-col items-center px-5 py-28 text-center sm:px-8">
      <Logo className="h-16 w-16 text-blade/70" />
      <p className="mt-8 font-mono text-sm uppercase tracking-[0.2em] text-blade-dim">
        404 · route not in the table
      </p>
      <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-paper">
        No path to this destination.
      </h1>
      <p className="mt-3 max-w-md text-paper-muted">
        That unit or path isn&apos;t advertised here. Head back and pick up the
        BGP Fundamentals path.
      </p>
      <Link
        href="/paths/bgp-fundamentals"
        className="group mt-8 inline-flex items-center gap-2 rounded-xl border border-blade/40 bg-blade/15 px-5 py-3 font-medium text-blade transition-all hover:border-blade/70 hover:bg-blade/20"
      >
        Go to BGP Fundamentals
        <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
