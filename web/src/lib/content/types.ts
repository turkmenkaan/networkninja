/**
 * Typed shapes for the NetworkNinja content library.
 *
 * The source of truth is the files under ../content (paths/, units/). These
 * types mirror the YAML/MDX schema documented in docs/PLAN.md and
 * content/README.md. Nothing here is duplicated content — these are just the
 * shapes the loaders produce.
 */

export type UnitType = "lesson" | "lab";
export type LabMode = "guided" | "challenge";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type PublishStatus = "published" | "planned" | "draft";

/** runtime block — ignored in Tier 1, consumed by the Tier 2 runner. */
export interface UnitRuntime {
  nodes?: number;
  est_ram_mb?: number;
  images?: string[];
  est_boot_seconds?: number;
}

/** Parsed meta.yaml for a unit. */
export interface UnitMeta {
  id: string;
  type: UnitType;
  title: string;
  summary: string;
  path?: string;
  module?: string;
  difficulty: Difficulty;
  estimated_minutes: number;
  prerequisites: string[];
  tags: string[];
  mode?: LabMode; // labs only
  runtime?: UnitRuntime;
  status: PublishStatus;
  version: number;
}

/** A single objective from tasks.yaml. */
export interface Objective {
  id: string;
  description: string;
  /**
   * The human-facing command the learner actually runs (a full
   * `docker exec ... vtysh -c '...'`, non-JSON). Shown in the Tier-1 checklist.
   * The `check` below stays JSON + assert for the Tier-2 auto-grader.
   */
  display_command?: string;
  hint?: string;
  check?: {
    node?: string;
    command?: string;
    parse?: string;
    assert?: Record<string, unknown>;
  };
}

/** A fully-loaded unit: metadata + rendered content + (for labs) lab extras. */
export interface Unit {
  meta: UnitMeta;
  /** Raw MDX source of content.mdx (compiled at render time). */
  contentSource: string;
  /** Lab-only extras. */
  lab?: {
    objectives: Objective[];
    /** Raw topology.clab.yml, served for the "download topology" affordance. */
    topologyYaml: string | null;
    topologyFilename: string;
    /** Raw solution.mdx source, revealed on demand. */
    solutionSource: string | null;
  };
}

/** A unit as it appears inside a path manifest (id + per-path status). */
export interface PathUnitRef {
  id: string;
  /** Status from the manifest (published | planned). Drives lock state. */
  status: PublishStatus;
  /** Resolved metadata if the unit is built; null for not-yet-authored ids. */
  meta: UnitMeta | null;
}

export interface PathModule {
  id: string;
  title: string;
  units: PathUnitRef[];
}

export interface LearningPath {
  id: string;
  title: string;
  summary: string;
  network_os?: string;
  status: string;
  modules: PathModule[];
}

/** Flattened, ordered list of published units across a path — drives prev/next. */
export interface PathFlatUnit {
  id: string;
  moduleId: string;
  moduleTitle: string;
  meta: UnitMeta;
}
