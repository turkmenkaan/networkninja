import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  listFieldNoteSlugs,
  loadFieldNote,
  formatFieldNoteDate,
} from "@/lib/content/field-notes";
import { loadUnitMeta } from "@/lib/content/paths";
import { Mdx } from "@/components/Mdx";
import { ArrowIcon } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export function generateStaticParams() {
  return listFieldNoteSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const note = loadFieldNote(params.slug);
  if (!note) return { title: "Field note not found" };
  return {
    title: note.meta.title,
    description: note.meta.description,
    // Honor an external canonical (cross-posted) if set; otherwise self-canonical.
    alternates: {
      canonical: note.meta.canonical ?? `/field-notes/${note.meta.slug}`,
    },
  };
}

export default function FieldNotePage({
  params,
}: {
  params: { slug: string };
}) {
  const note = loadFieldNote(params.slug);
  if (!note) notFound();

  const { meta } = note;
  const postUrl = `${SITE_URL}/field-notes/${meta.slug}`;

  // Resolve the related lab/unit title (if any) for the "Related lab" footer.
  const relatedMeta = meta.relatedUnit ? loadUnitMeta(meta.relatedUnit) : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: meta.title,
        description: meta.description,
        url: postUrl,
        mainEntityOfPage: postUrl,
        inLanguage: "en",
        ...(meta.date ? { datePublished: meta.date } : {}),
        ...(meta.tags.length ? { keywords: meta.tags.join(", ") } : {}),
        author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Field Notes",
            item: `${SITE_URL}/field-notes`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: meta.title,
            item: postUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-shell px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
      <JsonLd data={structuredData} />
      {/* breadcrumb */}
      <nav className="mb-6 font-mono text-xs text-paper-faint">
        <Link href="/" className="transition-colors hover:text-blade">
          home
        </Link>
        <span className="px-1.5">/</span>
        <Link
          href="/field-notes"
          className="transition-colors hover:text-blade"
        >
          field-notes
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-blade-dim">{meta.slug}</span>
      </nav>

      <article className="mx-auto max-w-2xl">
        <header className="animate-fade-up border-b border-ink-line/70 pb-7">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-paper-faint">
            {meta.date && (
              <time dateTime={meta.date}>{formatFieldNoteDate(meta.date)}</time>
            )}
          </div>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight text-paper sm:text-[2.75rem]">
            {meta.title}
          </h1>
          {meta.description && (
            <p className="mt-3 text-lg leading-relaxed text-paper-muted">
              {meta.description}
            </p>
          )}
          {meta.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {meta.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-ink-line bg-ink-inset px-2 py-0.5 font-mono text-[0.72rem] text-paper-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* rendered content */}
        <div className="prose prose-invert mt-8 max-w-none">
          <Mdx source={note.contentSource} />
        </div>

        {/* related lab funnel */}
        {relatedMeta && (
          <div className="mt-12 border-t border-ink-line/70 pt-8">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-paper-faint">
              Related lab
            </h2>
            <Link
              href={`/units/${relatedMeta.id}`}
              className="group flex items-center gap-3 rounded-xl border border-ink-line bg-ink-raised/50 px-4 py-3.5 transition-all hover:border-blade/40 hover:bg-ink-glow/60"
            >
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-semibold text-paper transition-colors group-hover:text-blade">
                  {relatedMeta.title}
                </div>
                {relatedMeta.summary && (
                  <p className="mt-0.5 line-clamp-1 text-sm text-paper-muted">
                    {relatedMeta.summary}
                  </p>
                )}
              </div>
              <ArrowIcon className="h-4 w-4 shrink-0 text-paper-faint transition-all group-hover:translate-x-0.5 group-hover:text-blade" />
            </Link>
          </div>
        )}

        <div className="mt-12 border-t border-ink-line/70 pt-8">
          <Link
            href="/field-notes"
            className="group inline-flex items-center gap-2 font-mono text-xs text-paper-faint transition-colors hover:text-blade"
          >
            <ArrowIcon className="h-3.5 w-3.5 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            All field notes
          </Link>
        </div>
      </article>
    </div>
  );
}
