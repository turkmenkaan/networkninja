"use client";

import posthog from "posthog-js";
import { DownloadIcon } from "@/components/ui";

export function LabDownloadButton({ unitId }: { unitId: string }) {
  return (
    <a
      href={`/api/units/${unitId}/lab`}
      download={`${unitId}.zip`}
      onClick={() => posthog.capture("lab_downloaded", { unit_id: unitId })}
      className="inline-flex items-center gap-2 rounded-xl border border-blade/40 bg-blade/15 px-4 py-2.5 text-sm font-medium text-blade transition-all hover:border-blade/70 hover:bg-blade/20"
    >
      <DownloadIcon className="h-4 w-4" />
      Download lab (.zip)
    </a>
  );
}
