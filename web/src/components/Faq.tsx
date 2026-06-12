import { JsonLd } from "./JsonLd";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * A visible FAQ section that also emits FAQPage JSON-LD built from the SAME
 * items, so the structured data always matches what the user sees (a Google
 * requirement). Uses native <details> so it works with zero client JS and
 * stays statically rendered. One FAQPage per page max, so render this once.
 */
export function Faq({
  items,
  heading = "Frequently asked",
  className = "",
}: {
  items: FaqItem[];
  heading?: string;
  className?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <section className={className}>
      <JsonLd data={data} />
      <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-blade-dim">
        {heading}
      </h2>
      <div className="mt-8 space-y-3">
        {items.map((it) => (
          <details
            key={it.q}
            className="group rounded-xl border border-ink-line bg-ink-raised/40 px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-medium text-paper transition-colors group-open:text-blade">
              {it.q}
              <span
                aria-hidden
                className="shrink-0 text-lg leading-none text-paper-faint transition-transform duration-200 group-open:rotate-45 group-open:text-blade"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-paper-muted">
              {it.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
