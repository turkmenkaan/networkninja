/**
 * Topology download.
 *
 * Streams a lab unit's raw topology.clab.yml as a file attachment so the lab
 * page's "Download topology" button can save it directly. Returns 404 when the
 * unit doesn't exist or has no topology (e.g. lessons).
 */
import { listUnitIds, loadUnit } from "@/lib/content/paths";

export const dynamic = "force-static";

/** Pre-render this handler for every built unit id at build time. */
export function generateStaticParams() {
  return listUnitIds().map((id) => ({ id }));
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const unit = loadUnit(params.id);
  const yaml = unit?.lab?.topologyYaml;

  if (!unit || !yaml) {
    return new Response("No topology for this unit.", { status: 404 });
  }

  const filename = unit.lab?.topologyFilename ?? "topology.clab.yml";

  return new Response(yaml, {
    status: 200,
    headers: {
      "Content-Type": "application/yaml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
