import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listPathIds, listUnitIds, loadUnitMeta } from "@/lib/content/paths";
import { listFieldNotes } from "@/lib/content/field-notes";

/**
 * Static sitemap: the home page, every learning path (including "coming soon"
 * ones, which are real indexable pages), and every PUBLISHED unit. Unbuilt
 * units have no page, so they are excluded. Generated at build time.
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

  for (const id of listUnitIds()) {
    const meta = loadUnitMeta(id);
    if (meta?.status !== "published") continue;
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
