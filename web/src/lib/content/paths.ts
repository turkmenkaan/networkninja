/**
 * Loaders for the content library. Treats ../content as the source of truth and
 * reads it at build/request time. Pure filesystem + YAML — no DB, no copying.
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type {
  LearningPath,
  Objective,
  PathFlatUnit,
  PathModule,
  PathUnitRef,
  Unit,
  UnitMeta,
} from "./types";

/**
 * Resolve the content directory. Default is the sibling ../content of the web/
 * app, but it can be overridden with CONTENT_DIR for non-standard checkouts.
 */
export const CONTENT_DIR =
  process.env.CONTENT_DIR ?? path.join(process.cwd(), "..", "content");

const PATHS_DIR = path.join(CONTENT_DIR, "paths");
const UNITS_DIR = path.join(CONTENT_DIR, "units");

function readFileOrNull(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

/** Load and lightly normalize a unit's meta.yaml. Returns null if not built. */
export function loadUnitMeta(id: string): UnitMeta | null {
  const metaPath = path.join(UNITS_DIR, id, "meta.yaml");
  const raw = readFileOrNull(metaPath);
  if (raw == null) return null;
  const data = parseYaml(raw) as Partial<UnitMeta>;
  return {
    id: data.id ?? id,
    type: data.type ?? "lesson",
    title: data.title ?? id,
    summary: data.summary ?? "",
    path: data.path,
    module: data.module,
    difficulty: data.difficulty ?? "beginner",
    estimated_minutes: data.estimated_minutes ?? 0,
    prerequisites: data.prerequisites ?? [],
    tags: data.tags ?? [],
    mode: data.mode,
    runtime: data.runtime,
    status: data.status ?? "published",
    version: data.version ?? 1,
  };
}

/** Fully load a built unit: meta + content + (labs) objectives/topology/solution. */
export function loadUnit(id: string): Unit | null {
  const meta = loadUnitMeta(id);
  if (!meta) return null;

  const unitDir = path.join(UNITS_DIR, id);
  const contentSource = readFileOrNull(path.join(unitDir, "content.mdx")) ?? "";

  const unit: Unit = { meta, contentSource };

  if (meta.type === "lab") {
    const tasksRaw = readFileOrNull(path.join(unitDir, "tasks.yaml"));
    let objectives: Objective[] = [];
    if (tasksRaw) {
      const parsed = parseYaml(tasksRaw) as { objectives?: Objective[] };
      objectives = parsed.objectives ?? [];
    }
    const topologyYaml = readFileOrNull(path.join(unitDir, "topology.clab.yml"));
    const solutionSource = readFileOrNull(
      path.join(unitDir, "solution", "solution.mdx"),
    );
    unit.lab = {
      objectives,
      topologyYaml,
      topologyFilename: "topology.clab.yml",
      solutionSource,
    };
  }

  return unit;
}

/** All built unit ids (directories with a meta.yaml). */
export function listUnitIds(): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(UNITS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((id) => fs.existsSync(path.join(UNITS_DIR, id, "meta.yaml")));
}

interface RawManifestUnit {
  id: string;
  status?: string;
}
interface RawManifestModule {
  id: string;
  title: string;
  units: RawManifestUnit[];
}
interface RawManifest {
  id: string;
  title: string;
  summary?: string;
  network_os?: string;
  status?: string;
  modules: RawManifestModule[];
}

/** Load a path manifest and resolve each referenced unit's metadata. */
export function loadPath(pathId: string): LearningPath | null {
  const raw = readFileOrNull(path.join(PATHS_DIR, `${pathId}.yaml`));
  if (raw == null) return null;
  const manifest = parseYaml(raw) as RawManifest;

  const modules: PathModule[] = manifest.modules.map((m) => {
    const units: PathUnitRef[] = m.units.map((u) => {
      const meta = loadUnitMeta(u.id);
      return {
        id: u.id,
        status: (u.status as PathUnitRef["status"]) ?? "planned",
        meta,
      };
    });
    return { id: m.id, title: m.title, units };
  });

  return {
    id: manifest.id,
    title: manifest.title,
    summary: (manifest.summary ?? "").trim(),
    network_os: manifest.network_os,
    status: manifest.status ?? "in-progress",
    modules,
  };
}

/** List all path manifest ids. */
export function listPathIds(): string[] {
  let entries: string[];
  try {
    entries = fs.readdirSync(PATHS_DIR);
  } catch {
    return [];
  }
  return entries
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => f.replace(/\.yaml$/, ""));
}

/**
 * Flatten a path to its ordered, BUILT-and-PUBLISHED units. This is the spine
 * for prev/next navigation and progress counting. Planned/unbuilt units are
 * excluded because there's nothing to navigate to.
 */
export function flattenPath(p: LearningPath): PathFlatUnit[] {
  const flat: PathFlatUnit[] = [];
  for (const m of p.modules) {
    for (const u of m.units) {
      if (u.status === "published" && u.meta) {
        flat.push({
          id: u.id,
          moduleId: m.id,
          moduleTitle: m.title,
          meta: u.meta,
        });
      }
    }
  }
  return flat;
}

/** Find which path a unit belongs to (first match). Used for unit-page context. */
export function findPathForUnit(
  unitId: string,
): { path: LearningPath; flat: PathFlatUnit[]; index: number } | null {
  for (const pid of listPathIds()) {
    const p = loadPath(pid);
    if (!p) continue;
    const flat = flattenPath(p);
    const index = flat.findIndex((u) => u.id === unitId);
    if (index >= 0) return { path: p, flat, index };
  }
  return null;
}

/** Summary counts for a path (built units, labs, lessons). */
export function pathStats(p: LearningPath) {
  let published = 0;
  let planned = 0;
  let labs = 0;
  let lessons = 0;
  let totalMinutes = 0;
  for (const m of p.modules) {
    for (const u of m.units) {
      if (u.status === "published" && u.meta) {
        published += 1;
        if (u.meta.type === "lab") labs += 1;
        else lessons += 1;
        totalMinutes += u.meta.estimated_minutes;
      } else {
        planned += 1;
      }
    }
  }
  return { published, planned, labs, lessons, totalMinutes };
}

/** Recursively list file paths under `dir`, relative to it (posix separators). */
function walkFiles(dir: string, base = ""): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walkFiles(path.join(dir, e.name), rel));
    else out.push(rel);
  }
  return out;
}

/**
 * Everything needed to RUN a lab locally: `topology.clab.yml` plus the whole
 * `configs/` tree. The topology's bind mounts are relative (e.g.
 * `configs/r1/frr.conf`), so the configs MUST ship alongside it. Returns null
 * if the unit has no topology (e.g. lessons).
 */
export function loadLabBundleFiles(
  id: string,
): { path: string; data: Buffer }[] | null {
  const unitDir = path.join(UNITS_DIR, id);
  let topo: Buffer;
  try {
    topo = fs.readFileSync(path.join(unitDir, "topology.clab.yml"));
  } catch {
    return null;
  }
  const files: { path: string; data: Buffer }[] = [
    { path: "topology.clab.yml", data: topo },
  ];
  const configsDir = path.join(unitDir, "configs");
  for (const rel of walkFiles(configsDir)) {
    files.push({
      path: path.posix.join("configs", rel),
      data: fs.readFileSync(path.join(configsDir, rel)),
    });
  }
  return files;
}
