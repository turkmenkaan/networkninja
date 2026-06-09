/**
 * <StateMachine> — a reusable vertical finite-state-machine diagram for MDX.
 *
 * States sit on a `row` (vertical order) in lane 0 (main column) or lane 1 (a
 * side column, for retry/detour states). `transitions` connect them; the
 * component routes each edge by geometry:
 *   - same lane, downward      -> straight vertical arrow
 *   - lane 0 -> lane 1, same row -> horizontal arrow (branch out)
 *   - lane 1 -> lane 0, downward -> elbow arrow (join back)
 * A state can be `highlight`ed and carry a `note` rendered to its right.
 *
 * Good for protocol FSMs (BGP, OSPF neighbor states, etc.). Prefer over ASCII.
 */
import type { ReactNode } from "react";

export interface SMState {
  id: string;
  label: string;
  /** Vertical position, 0 at top. */
  row: number;
  /** 0 = main column (default), 1 = side column. */
  lane?: 0 | 1;
  highlight?: boolean;
  note?: string;
}

export interface SMTransition {
  from: string;
  to: string;
  label?: string;
}

export interface StateMachineProps {
  states: SMState[];
  transitions?: SMTransition[];
  eyebrow?: string;
  caption?: ReactNode;
  ariaLabel?: string;
}

const VBW = 720;
const MAIN_X = 232;
const SIDE_X = 486;
const PILL_W = 152;
const PILL_H = 40;
const TOP = 16;
const ROW_H = 80;
const BLADE = "#4fe0c4";
const LABEL = "#9aa3af";

function geom(s: SMState) {
  const cx = (s.lane ?? 0) === 1 ? SIDE_X : MAIN_X;
  const top = TOP + s.row * ROW_H;
  return {
    cx,
    top,
    bottom: top + PILL_H,
    cy: top + PILL_H / 2,
    left: cx - PILL_W / 2,
    right: cx + PILL_W / 2,
  };
}

export function StateMachine({
  states,
  transitions = [],
  eyebrow,
  caption,
  ariaLabel,
}: StateMachineProps) {
  const byId = new Map(states.map((s) => [s.id, s]));
  const maxRow = Math.max(...states.map((s) => s.row));
  const height = TOP + maxRow * ROW_H + PILL_H + 26;
  const label =
    ariaLabel ?? `State machine: ${states.map((s) => s.label).join(" then ")}.`;

  return (
    <figure className="my-7 rounded-xl border border-ink-line bg-ink-inset px-4 pb-3.5 pt-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      {eyebrow ? (
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-blade-dim">
          {eyebrow}
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${VBW} ${height}`}
        role="img"
        aria-label={label}
        className="block h-auto w-full"
      >
        {transitions.map((t, i) => {
          const fs = byId.get(t.from);
          const ts = byId.get(t.to);
          if (!fs || !ts) return null;
          const a = geom(fs);
          const b = geom(ts);
          const fLane = fs.lane ?? 0;
          const tLane = ts.lane ?? 0;

          // same lane, downward -> vertical arrow
          if (fLane === tLane && ts.row > fs.row) {
            const x = a.cx;
            return (
              <g key={i}>
                <line x1={x} y1={a.bottom} x2={x} y2={b.top - 7} stroke={BLADE} strokeWidth={1.6} />
                <path d={`M${x - 4} ${b.top - 7} L${x} ${b.top} L${x + 4} ${b.top - 7} Z`} fill={BLADE} />
                {t.label ? (
                  <text x={x + 12} y={(a.bottom + b.top) / 2 + 3} fontFamily="var(--font-mono)" fontSize={10} fill={LABEL}>
                    {t.label}
                  </text>
                ) : null}
              </g>
            );
          }
          // lane 0 -> lane 1, same row -> horizontal arrow
          if (fLane < tLane && fs.row === ts.row) {
            const y = a.cy;
            return (
              <g key={i}>
                <line x1={a.right} y1={y} x2={b.left - 7} y2={y} stroke={BLADE} strokeWidth={1.6} />
                <path d={`M${b.left - 7} ${y - 4} L${b.left} ${y} L${b.left - 7} ${y + 4} Z`} fill={BLADE} />
                {t.label ? (
                  <text x={(a.right + b.left) / 2} y={y - 7} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} fill={LABEL}>
                    {t.label}
                  </text>
                ) : null}
              </g>
            );
          }
          // lane 1 -> lane 0, downward -> elbow (join back in)
          if (fLane > tLane && ts.row > fs.row) {
            const ey = b.cy;
            return (
              <g key={i}>
                <path d={`M${a.cx} ${a.bottom} L${a.cx} ${ey} L${b.right + 7} ${ey}`} fill="none" stroke={BLADE} strokeWidth={1.6} />
                <path d={`M${b.right + 7} ${ey - 4} L${b.right} ${ey} L${b.right + 7} ${ey + 4} Z`} fill={BLADE} />
                {t.label ? (
                  <text x={a.cx + 10} y={(a.bottom + ey) / 2} fontFamily="var(--font-mono)" fontSize={10} fill={LABEL}>
                    {t.label}
                  </text>
                ) : null}
              </g>
            );
          }
          // fallback: straight line
          return (
            <line key={i} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} stroke={BLADE} strokeWidth={1.6} />
          );
        })}
        {states.map((s) => {
          const g = geom(s);
          const hi = s.highlight;
          return (
            <g key={s.id}>
              <rect
                x={g.left}
                y={g.top}
                width={PILL_W}
                height={PILL_H}
                rx={9}
                fill={hi ? "#0e2b27" : "#10141b"}
                stroke={hi ? BLADE : "#243042"}
                strokeWidth={hi ? 1.75 : 1.5}
              />
              <text
                x={g.cx}
                y={g.cy + 5}
                textAnchor="middle"
                fontFamily="var(--font-body)"
                fontSize={14.5}
                fontWeight={600}
                fill={hi ? BLADE : "#e8e6df"}
              >
                {s.label}
              </text>
              {s.note ? (
                <>
                  <path d={`M${g.right + 6} ${g.cy} l8 -4 l0 8 Z`} fill={BLADE} />
                  <text x={g.right + 20} y={g.cy + 4} fontFamily="var(--font-mono)" fontSize={10} fill={BLADE}>
                    {s.note}
                  </text>
                </>
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
