/**
 * Loaders for the Field Notes blog. Posts live at the repo root under
 * content/field-notes/<slug>.mdx as MDX files with a YAML frontmatter block.
 * This is the SEO blog from the marketing strategy: each post can funnel to a
 * related lab via the `relatedUnit` frontmatter field.
 *
 * Like the units/paths loaders, this reads the content directory directly at
 * build/request time. Pure filesystem + YAML, no DB.
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { CONTENT_DIR } from "./paths";

const FIELD_NOTES_DIR = path.join(CONTENT_DIR, "field-notes");

/** Parsed frontmatter for a field note. */
export interface FieldNoteMeta {
  /** URL slug (defaults to the filename if the frontmatter omits it). */
  slug: string;
  title: string;
  /** Meta description / SEO summary. */
  description: string;
  /** ISO date string, e.g. "2026-06-17". */
  date: string;
  tags: string[];
  /** Optional unit slug this post funnels to (rendered as a "Related lab"). */
  relatedUnit?: string;
  /** Optional external canonical URL if the post is cross-posted. */
  canonical?: string;
}

/** A fully loaded field note: frontmatter + raw MDX body. */
export interface FieldNote {
  meta: FieldNoteMeta;
  /** Raw MDX source (frontmatter stripped), compiled at render time. */
  contentSource: string;
}

function readFileOrNull(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

/**
 * Split a `---`-delimited YAML frontmatter block off the top of an MDX file.
 * Returns the parsed frontmatter object plus the remaining MDX body. If there
 * is no frontmatter block, the whole file is treated as body.
 */
function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  // Normalize CRLF so the regex below is reliable on any platform.
  const text = raw.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) return { data: {}, body: text };
  const data = (parseYaml(match[1]) as Record<string, unknown>) ?? {};
  return { data, body: text.slice(match[0].length) };
}

/** Normalize raw frontmatter into the typed FieldNoteMeta shape. */
function normalizeMeta(
  data: Record<string, unknown>,
  fallbackSlug: string,
): FieldNoteMeta {
  const tags = Array.isArray(data.tags)
    ? data.tags.map((t) => String(t))
    : [];
  return {
    slug: typeof data.slug === "string" ? data.slug : fallbackSlug,
    title: typeof data.title === "string" ? data.title : fallbackSlug,
    description: typeof data.description === "string" ? data.description : "",
    date: typeof data.date === "string" ? data.date : "",
    tags,
    relatedUnit:
      typeof data.relatedUnit === "string" ? data.relatedUnit : undefined,
    canonical:
      typeof data.canonical === "string" ? data.canonical : undefined,
  };
}

/** All field-note slugs (one per `<slug>.mdx` file in the directory). */
export function listFieldNoteSlugs(): string[] {
  let entries: string[];
  try {
    entries = fs.readdirSync(FIELD_NOTES_DIR);
  } catch {
    return [];
  }
  return entries
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/** Load a single field note (frontmatter + MDX source). Null if not found. */
export function loadFieldNote(slug: string): FieldNote | null {
  const raw = readFileOrNull(path.join(FIELD_NOTES_DIR, `${slug}.mdx`));
  if (raw == null) return null;
  const { data, body } = parseFrontmatter(raw);
  return { meta: normalizeMeta(data, slug), contentSource: body };
}

/** All field notes, sorted newest first (by frontmatter date, then slug). */
export function listFieldNotes(): FieldNote[] {
  return listFieldNoteSlugs()
    .map((slug) => loadFieldNote(slug))
    .filter((n): n is FieldNote => n != null)
    .sort((a, b) => {
      const d = b.meta.date.localeCompare(a.meta.date);
      return d !== 0 ? d : a.meta.slug.localeCompare(b.meta.slug);
    });
}

/** Format an ISO date string for display, e.g. "June 17, 2026". Falls back to raw. */
export function formatFieldNoteDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
