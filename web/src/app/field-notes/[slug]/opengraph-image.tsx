import { listFieldNoteSlugs, loadFieldNote } from "@/lib/content/field-notes";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

// Reads content from the filesystem, so it needs the Node runtime.
export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "NetworkNinjas field note";

// Prerender one card per post (matches the post page's params).
export function generateStaticParams() {
  return listFieldNoteSlugs().map((slug) => ({ slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const note = loadFieldNote(params.slug);
  const title = note?.meta.title ?? params.slug;
  return renderOgImage({
    eyebrow: "Field Notes",
    title,
    subtitle: note?.meta.description,
  });
}
