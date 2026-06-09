/**
 * <MessageTimeline> — a reusable "protocol chattiness over time" chart for MDX.
 *
 * Lays a sequence of phases along a shared time axis to visualize how much a
 * protocol talks: a `burst` (bars), a `flat` quiet stretch (dashed baseline),
 * or a single `pulse` (one message). Used to teach things like BGP's
 * incremental-update model. Prefer this over hand-rolled SVG.
 *
 * Example (in an .mdx file):
 *   <MessageTimeline
 *     eyebrow="Message volume over time"
 *     phases={[
 *       { type: "burst", label: "session up", sublabel: "full tables, once",
 *         bars: [72, 98, 58, 104, 82, 96, 66, 90], accent: "blade" },
 *       { type: "flat",  label: "steady state", sublabel: "— silence —", accent: "muted" },
 *       { type: "pulse", label: "a route changes", sublabel: "one update sent", accent: "sakura" },
 *     ]}
 *     caption="..."
 *   />
 */
import type { ReactNode } from "react";

type PhaseAccent = "blade" | "sakura" | "muted";

interface BurstPhase {
  type: "burst";
  label: string;
  sublabel?: string;
  /** Bar heights in px (visual only). */
  bars: number[];
  accent?: PhaseAccent;
}
interface FlatPhase {
  type: "flat";
  label: string;
  sublabel?: string;
  accent?: PhaseAccent;
}
interface PulsePhase {
  type: "pulse";
  label: string;
  sublabel?: string;
  /** Spike height in px. */
  height?: number;
  accent?: PhaseAccent;
}
export type TimelinePhase = BurstPhase | FlatPhase | PulsePhase;

export interface MessageTimelineProps {
  phases: TimelinePhase[];
  axisLabel?: string;
  timeLabel?: string;
  eyebrow?: string;
  caption?: ReactNode;
  ariaLabel?: string;
}

const ACCENT: Record<PhaseAccent, string> = {
  blade: "#4fe0c4",
  sakura: "#ff7a8a",
  muted: "#9aa3af",
};
const WEIGHT: Record<TimelinePhase["type"], number> = {
  burst: 1.1,
  flat: 1.8,
  pulse: 1.0,
};

const W = 720;
const H = 196;
const BASE_Y = 140;
const AXIS_X0 = 64;
const AXIS_X1 = 660;

function defaultAccent(type: TimelinePhase["type"]): PhaseAccent {
  if (type === "pulse") return "sakura";
  if (type === "flat") return "muted";
  return "blade";
}

export function MessageTimeline({
  phases,
  axisLabel = "MSGS",
  timeLabel = "time →",
  eyebrow,
  caption,
  ariaLabel,
}: MessageTimelineProps) {
  const usableX0 = AXIS_X0 + 18;
  const usableX1 = AXIS_X1 - 16;
  const totalW = usableX1 - usableX0;
  const totalWeight = phases.reduce((s, p) => s + WEIGHT[p.type], 0);

  let cursor = usableX0;
  const bands = phases.map((p) => {
    const w = (WEIGHT[p.type] / totalWeight) * totalW;
    const band = { x0: cursor, x1: cursor + w, center: cursor + w / 2 };
    cursor += w;
    return band;
  });

  const label =
    ariaLabel ??
    `BGP message volume over time across phases: ${phases
      .map((p) => p.label)
      .join(", ")}.`;

  return (
    <figure className="my-7 rounded-xl border border-ink-line bg-ink-inset px-4 pb-3.5 pt-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      {eyebrow ? (
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-blade-dim">
          {eyebrow}
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        className="block h-auto w-full"
      >
        <line
          x1={AXIS_X0}
          y1={44}
          x2={AXIS_X0}
          y2={BASE_Y}
          stroke="#5d6675"
          strokeWidth={1.5}
          strokeOpacity={0.5}
        />
        <text
          x={AXIS_X0}
          y={34}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={9.5}
          letterSpacing="0.15em"
          fill="#5d6675"
        >
          {axisLabel}
        </text>
        <line
          x1={AXIS_X0}
          y1={BASE_Y}
          x2={AXIS_X1}
          y2={BASE_Y}
          stroke="#5d6675"
          strokeWidth={1.5}
        />
        <path
          d={`M${AXIS_X1} ${BASE_Y - 6} L${AXIS_X1 + 12} ${BASE_Y} L${AXIS_X1} ${BASE_Y + 6} Z`}
          fill="#5d6675"
        />
        <text
          x={AXIS_X1 - 12}
          y={160}
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fontSize={10}
          fill="#5d6675"
        >
          {timeLabel}
        </text>
        {phases.map((p, i) => {
          const band = bands[i];
          const color = ACCENT[p.accent ?? defaultAccent(p.type)];
          const shapes: ReactNode[] = [];
          if (p.type === "burst") {
            const bw = 9;
            const gap = 5;
            const span = p.bars.length * bw + (p.bars.length - 1) * gap;
            const start = band.center - span / 2;
            p.bars.forEach((h, bi) => {
              shapes.push(
                <rect
                  key={`b${bi}`}
                  x={start + bi * (bw + gap)}
                  y={BASE_Y - h}
                  width={bw}
                  height={h}
                  rx={2}
                  fill={color}
                  fillOpacity={0.9}
                />,
              );
            });
          } else if (p.type === "flat") {
            shapes.push(
              <line
                key="f"
                x1={band.x0 + 6}
                y1={BASE_Y}
                x2={band.x1 - 6}
                y2={BASE_Y}
                stroke="#5d6675"
                strokeWidth={2}
                strokeDasharray="2 7"
                strokeLinecap="round"
              />,
            );
          } else {
            const h = p.height ?? 78;
            const x = band.center - 6;
            shapes.push(
              <rect
                key="p"
                x={x}
                y={BASE_Y - h}
                width={12}
                height={h}
                rx={2.5}
                fill={color}
              />,
            );
            shapes.push(
              <path
                key="pa"
                d={`M${x + 18} ${BASE_Y - h + 33} L${x + 33} ${BASE_Y - h + 40} L${x + 18} ${BASE_Y - h + 47} Z`}
                fill={color}
              />,
            );
          }
          const labelColor = p.type === "flat" ? "#9aa3af" : color;
          const subColor = p.type === "flat" ? "#5d6675" : "#9aa3af";
          return (
            <g key={i}>
              {shapes}
              <text
                x={band.center}
                y={164}
                textAnchor="middle"
                fontFamily="var(--font-body)"
                fontSize={12}
                fontWeight={600}
                fill={labelColor}
              >
                {p.label}
              </text>
              {p.sublabel ? (
                <text
                  x={band.center}
                  y={181}
                  textAnchor="middle"
                  fontFamily="var(--font-body)"
                  fontSize={11}
                  fill={subColor}
                >
                  {p.sublabel}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {caption ? (
        <figcaption className="mt-3 text-center font-sans text-[13px] leading-normal text-paper-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
