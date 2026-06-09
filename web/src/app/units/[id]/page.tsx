import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  listUnitIds,
  loadUnit,
  loadUnitMeta,
  findPathForUnit,
} from "@/lib/content/paths";
import type { PathFlatUnit } from "@/lib/content/types";
import { Mdx } from "@/components/Mdx";
import { SolutionReveal } from "@/components/SolutionReveal";
import {
  DifficultyBadge,
  TypeBadge,
  MinutesBadge,
  ArrowIcon,
  DownloadIcon,
} from "@/components/ui";
import { MarkComplete } from "@/components/progress/MarkComplete";
import { ObjectivesChecklist } from "@/components/progress/ObjectivesChecklist";
import { LabRequirement } from "@/components/LabRequirement";

export function generateStaticParams() {
  // Only build pages for units that actually exist (published manifests).
  return listUnitIds().map((id) => ({ id }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const meta = loadUnitMeta(params.id);
  if (!meta) return { title: "Unit not found" };
  return { title: meta.title, description: meta.summary };
}

export default function UnitPage({ params }: { params: { id: string } }) {
  const unit = loadUnit(params.id);
  if (!unit) notFound();

  const { meta } = unit;
  const isLab = meta.type === "lab";
  const ctx = findPathForUnit(params.id);
  const prev = ctx && ctx.index > 0 ? ctx.flat[ctx.index - 1] : null;
  const next =
    ctx && ctx.index >= 0 && ctx.index < ctx.flat.length - 1
      ? ctx.flat[ctx.index + 1]
      : null;
  // The first lab in the path gets the prominent Containerlab setup notice;
  // later labs get a compact reminder.
  const firstLabId = ctx?.flat.find((u) => u.meta.type === "lab")?.id;
  const isFirstLab = !!ctx && firstLabId === meta.id;

  return (
    <div className="mx-auto max-w-shell px-5 pb-8 pt-10 sm:px-8 sm:pt-14">
      {/* breadcrumb */}
      <nav className="mb-6 font-mono text-xs text-paper-faint">
        <Link href="/" className="transition-colors hover:text-blade">
          home
        </Link>
        <span className="px-1.5">/</span>
        {ctx ? (
          <Link
            href={`/paths/${ctx.path.id}`}
            className="transition-colors hover:text-blade"
          >
            {ctx.path.id}
          </Link>
        ) : (
          <span>units</span>
        )}
        <span className="px-1.5">/</span>
        <span className="text-blade-dim">{meta.id}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {/* ─────────── main column ─────────── */}
        <article className="min-w-0">
          <header className="animate-fade-up border-b border-ink-line/70 pb-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <TypeBadge type={meta.type} mode={meta.mode} />
              <DifficultyBadge difficulty={meta.difficulty} />
              <MinutesBadge minutes={meta.estimated_minutes} />
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-paper sm:text-[2.75rem]">
              {meta.title}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-paper-muted">
              {meta.summary}
            </p>
          </header>

          {/* containerlab setup notice (labs only) */}
          {isLab && (
            <LabRequirement variant={isFirstLab ? "full" : "compact"} />
          )}

          {/* lab toolbar: download the full lab bundle (topology + configs) */}
          {isLab && unit.lab?.topologyYaml && (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-ink-line bg-ink-raised/50 p-4">
              <div className="flex-1">
                <div className="font-display font-semibold text-paper">
                  Lab files
                </div>
                <p className="text-sm text-paper-muted">
                  Download the lab (topology + configs), unzip it, then from
                  that folder run{" "}
                  <code className="font-mono text-blade-dim">
                    containerlab deploy -t topology.clab.yml
                  </code>
                  .
                </p>
              </div>
              <a
                href={`/api/units/${meta.id}/lab`}
                download={`${meta.id}.zip`}
                className="inline-flex items-center gap-2 rounded-xl border border-blade/40 bg-blade/15 px-4 py-2.5 text-sm font-medium text-blade transition-all hover:border-blade/70 hover:bg-blade/20"
              >
                <DownloadIcon className="h-4 w-4" />
                Download lab (.zip)
              </a>
            </div>
          )}

          {/* rendered content */}
          <div className="prose prose-invert mt-8 max-w-none">
            <Mdx source={unit.contentSource} />
          </div>

          {/* lab extras: objectives + solution */}
          {isLab && unit.lab && (
            <>
              {unit.lab.objectives.length > 0 && (
                <div className="my-12 rounded-2xl border border-ink-line bg-ink-raised/40 p-6 sm:p-7">
                  <ObjectivesChecklist
                    unitId={meta.id}
                    objectives={unit.lab.objectives}
                  />
                </div>
              )}

              {unit.lab.solutionSource && (
                <SolutionReveal>
                  <Mdx source={unit.lab.solutionSource} />
                </SolutionReveal>
              )}
            </>
          )}

          {/* mark complete + prev/next */}
          <div className="mt-12 border-t border-ink-line/70 pt-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <MarkComplete unitId={meta.id} />
              {ctx && (
                <span className="font-mono text-xs text-paper-faint">
                  unit {ctx.index + 1} of {ctx.flat.length} ·{" "}
                  {ctx.flat[ctx.index]?.moduleTitle}
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <NavCard unit={prev} dir="prev" />
              <NavCard unit={next} dir="next" />
            </div>
          </div>
        </article>

        {/* ─────────── sidebar ─────────── */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-6 rounded-2xl border border-ink-line bg-ink-raised/50 p-5">
            {meta.tags.length > 0 && (
              <div>
                <h2 className="mb-2.5 font-mono text-xs uppercase tracking-[0.16em] text-paper-faint">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {meta.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-ink-line bg-ink-inset px-2 py-0.5 font-mono text-[0.72rem] text-paper-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {meta.prerequisites.length > 0 && (
              <div>
                <h2 className="mb-2.5 font-mono text-xs uppercase tracking-[0.16em] text-paper-faint">
                  Prerequisites
                </h2>
                <ul className="space-y-1.5">
                  {meta.prerequisites.map((pid) => (
                    <PrereqLink key={pid} id={pid} />
                  ))}
                </ul>
              </div>
            )}

            {isLab && meta.runtime && (
              <div>
                <h2 className="mb-2.5 font-mono text-xs uppercase tracking-[0.16em] text-paper-faint">
                  Lab runtime
                </h2>
                <dl className="space-y-1 font-mono text-xs text-paper-muted">
                  {meta.runtime.nodes != null && (
                    <RuntimeRow k="nodes" v={String(meta.runtime.nodes)} />
                  )}
                  {meta.runtime.est_ram_mb != null && (
                    <RuntimeRow k="ram" v={`~${meta.runtime.est_ram_mb} MB`} />
                  )}
                  {meta.runtime.est_boot_seconds != null && (
                    <RuntimeRow
                      k="boot"
                      v={`~${meta.runtime.est_boot_seconds}s`}
                    />
                  )}
                  {meta.runtime.images && meta.runtime.images.length > 0 && (
                    <RuntimeRow k="image" v={meta.runtime.images.join(", ")} />
                  )}
                </dl>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function RuntimeRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-paper-faint">{k}</dt>
      <dd className="truncate text-paper">{v}</dd>
    </div>
  );
}

function PrereqLink({ id }: { id: string }) {
  const meta = loadUnitMeta(id);
  const built = meta != null;
  if (built) {
    return (
      <li>
        <Link
          href={`/units/${id}`}
          className="group flex items-center gap-1.5 text-sm text-paper-muted transition-colors hover:text-blade"
        >
          <span className="text-blade-dim">→</span>
          <span className="underline decoration-ink-line underline-offset-4 group-hover:decoration-blade/40">
            {meta!.title}
          </span>
        </Link>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-1.5 text-sm text-paper-faint">
      <span>→</span>
      <span className="font-mono">{id}</span>
      <span className="font-mono text-[0.62rem] uppercase tracking-wider text-ember/70">
        soon
      </span>
    </li>
  );
}

function NavCard({
  unit,
  dir,
}: {
  unit: PathFlatUnit | null;
  dir: "prev" | "next";
}) {
  const isNext = dir === "next";
  if (!unit) {
    return (
      <div className="rounded-xl border border-dashed border-ink-line/60 px-4 py-3.5 opacity-50">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-paper-faint">
          {isNext ? "end of path" : "start of path"}
        </span>
      </div>
    );
  }
  return (
    <Link
      href={`/units/${unit.id}`}
      className={`group flex items-center gap-3 rounded-xl border border-ink-line bg-ink-raised/50 px-4 py-3.5 transition-all hover:border-blade/40 hover:bg-ink-glow/60 ${
        isNext ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      <ArrowIcon
        className={`h-4 w-4 shrink-0 text-paper-faint transition-colors group-hover:text-blade ${
          isNext ? "" : "rotate-180"
        }`}
      />
      <div className="min-w-0">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-paper-faint">
          {isNext ? "Next" : "Previous"}
        </span>
        <div className="truncate font-display text-sm font-semibold text-paper transition-colors group-hover:text-blade">
          {unit.meta.title}
        </div>
      </div>
    </Link>
  );
}
