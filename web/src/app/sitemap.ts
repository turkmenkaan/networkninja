import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { flattenPath, listPathIds, loadPath } from "@/lib/content/paths";
import { listFieldNotes } from "@/lib/content/field-notes";

/**
 * Static sitemap: the home page, every learning path (including "coming soon"
 * ones, which are real indexable pages), and every unit a path manifest marks
 * published. Generated at build time.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // The paths index, then every individual path (including "coming soon" ones,
  // which are real indexable pages).
  entries.push({
    url: `${SITE_URL}/paths`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  });

  for (const pathId of listPathIds()) {
    entries.push({
      url: `${SITE_URL}/paths/${pathId}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Units: the path manifests are the source of truth for what is live, the
  // same thing the path pages use to lock or link a unit. A unit's own
  // meta.yaml status is deliberately NOT consulted, so the two can never drift
  // into indexing a page its path still shows as "coming soon". flattenPath()
  // keeps only units that are published in the manifest AND built on disk; the
  // Set dedupes units shared across paths (e.g. lab-environment-setup).
  const liveUnitIds = new Set<string>();
  for (const pathId of listPathIds()) {
    const p = loadPath(pathId);
    if (!p) continue;
    for (const unit of flattenPath(p)) liveUnitIds.add(unit.id);
  }
  for (const id of liveUnitIds) {
    entries.push({
      url: `${SITE_URL}/units/${id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Field Notes blog: the index plus every post.
  entries.push({
    url: `${SITE_URL}/field-notes`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  });
  for (const note of listFieldNotes()) {
    entries.push({
      url: `${SITE_URL}/field-notes/${note.meta.slug}`,
      lastModified: note.meta.date ? new Date(note.meta.date) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
