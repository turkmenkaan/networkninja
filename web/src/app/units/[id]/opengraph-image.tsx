import { listUnitIds, loadUnitMeta } from "@/lib/content/paths";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

// Reads content from the filesystem, so it needs the Node runtime.
export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "NetworkNinjas lesson";

// Prerender one card per built unit (matches the unit page's params).
export function generateStaticParams() {
  return listUnitIds().map((id) => ({ id }));
}

export default function Image({ params }: { params: { id: string } }) {
  const meta = loadUnitMeta(params.id);
  const title = meta?.title ?? params.id;
  const eyebrow =
    meta?.type === "lab"
      ? meta.mode === "challenge"
        ? "Challenge lab"
        : "Guided lab"
      : "Lesson";
  return renderOgImage({ eyebrow, title, subtitle: meta?.summary });
}
