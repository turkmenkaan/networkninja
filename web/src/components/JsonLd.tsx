/**
 * Renders a JSON-LD structured-data block. Server component: emitted into the
 * HTML at build time so crawlers see it without running JS. See the marketing
 * strategy (docs/marketing-strategy.md, section 1) for the SEO rationale.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Schema.org payload is built from trusted, already-rendered content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
