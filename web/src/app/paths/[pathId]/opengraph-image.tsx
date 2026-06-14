import { listPathIds, loadPath } from "@/lib/content/paths";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

// Reads content from the filesystem, so it needs the Node runtime.
export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "NetworkNinjas learning path";

// Prerender one card per path (matches the path page's params).
export function generateStaticParams() {
  return listPathIds().map((pathId) => ({ pathId }));
}

export default function Image({ params }: { params: { pathId: string } }) {
  const path = loadPath(params.pathId);
  const title = path?.title ?? params.pathId;
  return renderOgImage({
    eyebrow: "Learning path",
    title,
    subtitle: path?.summary,
  });
}
