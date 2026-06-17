import Link from "next/link";
import type { Metadata } from "next";
import {
  listFieldNotes,
  formatFieldNoteDate,
} from "@/lib/content/field-notes";
import { ArrowIcon } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITLE = "Field Notes";
const DESCRIPTION =
  "Short, practical write-ups on BGP, FRR, and Containerlab: troubleshooting, gotchas, and the steps that actually fix a broken session. Each post links to a lab you can run yourself.";

export function generateMetadata(): Metadata {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/field-notes" },
  };
}

export default function FieldNotesIndexPage() {
  const notes = listFieldNotes();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        name: `${SITE_NAME} Field Notes`,
        description: DESCRIPTION,
        url: `${SITE_URL}/field-notes`,
        inLanguage: "en",
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
        blogPost: notes.map((n) => ({
          "@type": "BlogPosting",
          headline: n.meta.title,
          description: n.meta.description,
          url: `${SITE_URL}/field-notes/${n.meta.slug}`,
          ...(n.meta.date ? { datePublished: n.meta.date } : {}),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: TITLE,
            item: `${SITE_URL}/field-notes`,
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-shell px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
      <JsonLd data={structuredData} />
      {/* breadcrumb */}
      <nav className="mb-6 font-mono text-xs text-paper-faint">
        <Link href="/" className="transition-colors hover:text-blade">
          home
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-blade-dim">field-notes</span>
      </nav>

      <header className="animate-fade-up max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-blade-dim">
          The blog
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-paper sm:text-5xl">
          {TITLE}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-paper-muted">
          {DESCRIPTION}
        </p>
      </header>

      <div className="mt-12 space-y-4">
        {notes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-line/80 bg-ink-raised/30 px-5 py-8 text-center text-paper-faint">
            No field notes yet. Check back soon.
          </p>
        ) : (
          notes.map((n) => (
            <article key={n.meta.slug}>
              <Link
                href={`/field-notes/${n.meta.slug}`}
                className="group block rounded-2xl border border-ink-line bg-ink-raised/50 p-5 transition-all hover:border-blade/40 hover:bg-ink-glow/60 sm:p-6"
              >
                <div className="flex items-center gap-3 font-mono text-xs text-paper-faint">
                  {n.meta.date && (
                    <time dateTime={n.meta.date}>
                      {formatFieldNoteDate(n.meta.date)}
                    </time>
                  )}
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-paper transition-colors group-hover:text-blade">
                  {n.meta.title}
                </h2>
                {n.meta.description && (
                  <p className="mt-2 max-w-2xl leading-relaxed text-paper-muted">
                    {n.meta.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between gap-4">
                  {n.meta.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {n.meta.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-ink-line bg-ink-inset px-2 py-0.5 font-mono text-[0.72rem] text-paper-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span />
                  )}
                  <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-paper-faint transition-colors group-hover:text-blade">
                    Read
                    <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
