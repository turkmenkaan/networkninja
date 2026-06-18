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
const LABEL_FS = 13;
const LINE_H = 14;
const LABEL_PAD = 12; // horizontal breathing room inside the pill
// Rough average glyph width for the body font at LABEL_FS, used only to decide
// when a label is too wide for the pill and must wrap onto a second line so it
// never overflows the box.
const CHAR_W = LABEL_FS * 0.5;

/**
 * Split a state label into at most two lines so it fits inside the pill. Short
 * labels stay on one line; long ones (e.g. "Lowest IGP metric to NEXT_HOP")
 * break at the word boundary that best balances the two lines.
 */
function wrapLabel(label: string): string[] {
  if (label.length * CHAR_W <= PILL_W - LABEL_PAD) return [label];
  const words = label.split(" ");
  if (words.length < 2) return [label];
  let best: [string, string] = [words[0], words.slice(1).join(" ")];
  for (let i = 2; i < words.length; i++) {
    const l1 = words.slice(0, i).join(" ");
    const l2 = words.slice(i).join(" ");
    if (
      Math.max(l1.length, l2.length) <
      Math.max(best[0].length, best[1].length)
    ) {
      best = [l1, l2];
    }
  }
  return best;
}

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
              {(() => {
                const lines = wrapLabel(s.label);
                const startY = g.cy + 5 - ((lines.length - 1) * LINE_H) / 2;
                return (
                  <text
                    textAnchor="middle"
                    fontFamily="var(--font-body)"
                    fontSize={LABEL_FS}
                    fontWeight={600}
                    fill={hi ? BLADE : "#e8e6df"}
                  >
                    {lines.map((ln, i) => (
                      <tspan key={i} x={g.cx} y={startY + i * LINE_H}>
                        {ln}
                      </tspan>
                    ))}
                  </text>
                );
              })()}
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
