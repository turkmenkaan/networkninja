/**
 * Lab bundle download.
 *
 * Zips a lab unit's runnable files (topology.clab.yml + the whole configs/
 * tree) into <id>.zip, nested under an <id>/ folder so unzipping yields a
 * clean directory. The topology's bind mounts are relative (configs/...), so
 * the configs MUST ship with it — downloading the YAML alone is not runnable.
 * Returns 404 for non-lab units.
 */
import JSZip from "jszip";
import {
  listUnitIds,
  loadUnitMeta,
  loadLabBundleFiles,
} from "@/lib/content/paths";

export const dynamic = "force-static";

/** Pre-render the zip for every built LAB at build time. */
export function generateStaticParams() {
  return listUnitIds()
    .filter((id) => loadUnitMeta(id)?.type === "lab")
    .map((id) => ({ id }));
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const files = loadLabBundleFiles(params.id);
  if (!files) {
    return new Response("No lab bundle for this unit.", { status: 404 });
  }

  const zip = new JSZip();
  const root = zip.folder(params.id)!;
  for (const f of files) root.file(f.path, f.data);
  const data = await zip.generateAsync({ type: "uint8array" });

  return new Response(data, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${params.id}.zip"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
