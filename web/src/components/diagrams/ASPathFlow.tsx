/**
 * <ASPathFlow> — visualize the BGP AS_PATH, the signature path-vector concept.
 *
 * Two modes (chosen by which props you pass):
 *
 *  A) Propagation chain — pass `hops` (+ optional `prefix`, `showGrowingPath`):
 *     a row of ASes with arrows, showing a prefix advertised outward and the
 *     AS_PATH growing (newest ASN prepended) at each hop.
 *
 *  B) Path + reject — pass `asPath` (+ `highlightIndex`, `rejectLabel`):
 *     a single AS_PATH rendered as ASN pills with one highlighted, used to show
 *     loop prevention (a router seeing its own ASN and dropping the route).
 *
 * Reusable across the BGP curriculum (path-vector, best-path, iBGP). Prefer
 * this over ASCII or hand-rolled SVG.
 */
import type { ReactNode } from "react";

export interface ASPathFlowProps {
  // Mode A
  hops?: string[];
  prefix?: string;
  showGrowingPath?: boolean;
  // Mode B
  asPath?: string[];
  highlightIndex?: number;
  rejectLabel?: string;
  // Common
  eyebrow?: string;
  caption?: ReactNode;
  ariaLabel?: string;
}

const VBW = 720;

function Figure({
  eyebrow,
  caption,
  height,
  label,
  children,
}: {
  eyebrow?: string;
  caption?: ReactNode;
  height: number;
  label: string;
  children: ReactNode;
}) {
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
        {children}
      </svg>
      {caption ? (
        <figcaption className="mt-3 text-center font-sans text-[13px] leading-normal text-paper-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

const stripAS = (s: string) => s.replace(/^AS\s*/i, "");

export function ASPathFlow(props: ASPathFlowProps) {
  if (props.asPath) return <RejectMode {...props} />;
  return <ChainMode {...props} />;
}

/* ---------------------------- Mode A: chain ---------------------------- */
function ChainMode({
  hops = [],
  prefix,
  showGrowingPath,
  eyebrow,
  caption,
  ariaLabel,
}: ASPathFlowProps) {
  const W = 104;
  const H = 46;
  const GAP = 44;
  const CHAIN_Y = 14;
  const n = hops.length;
  const rowW = n * W + (n - 1) * GAP;
  const startX = Math.max(8, (VBW - rowW) / 2);
  const cardX = (i: number) => startX + i * (W + GAP);
  const midY = CHAIN_Y + H / 2;
  const asns = hops.map(stripAS);

  const titleY = CHAIN_Y + H + (prefix ? 46 : 24);
  const rowY = (i: number) => titleY + 22 + i * 20;
  const height = showGrowingPath
    ? rowY(n - 1) + 14
    : CHAIN_Y + H + (prefix ? 40 : 0) + 12;

  const label =
    ariaLabel ??
    `AS_PATH propagation across ${hops.join(", ")}${prefix ? ` for prefix ${prefix}` : ""}.`;

  return (
    <Figure eyebrow={eyebrow} caption={caption} height={height} label={label}>
      {/* arrows */}
      {hops.slice(0, -1).map((_, i) => {
        const x1 = cardX(i) + W + 5;
        const x2 = cardX(i + 1) - 5;
        return (
          <g key={`ar${i}`}>
            <line x1={x1} y1={midY} x2={x2 - 6} y2={midY} stroke="#4fe0c4" strokeWidth={1.6} />
            <path d={`M${x2 - 6} ${midY - 4} L${x2} ${midY} L${x2 - 6} ${midY + 4} Z`} fill="#4fe0c4" />
          </g>
        );
      })}
      {/* AS cards */}
      {hops.map((h, i) => (
        <g key={`c${i}`}>
          <rect
            x={cardX(i)}
            y={CHAIN_Y}
            width={W}
            height={H}
            rx={11}
            fill="#10141b"
            stroke={i === 0 ? "#2f5b53" : "#243042"}
            strokeWidth={1.5}
          />
          <text
            x={cardX(i) + W / 2}
            y={CHAIN_Y + (i === 0 ? 20 : 29)}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={13}
            fontWeight={600}
            fill="#e8e6df"
          >
            {h}
          </text>
          {i === 0 ? (
            <text
              x={cardX(i) + W / 2}
              y={CHAIN_Y + 36}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={8.5}
              letterSpacing="0.04em"
              fill="#2fa890"
            >
              origin
            </text>
          ) : null}
        </g>
      ))}
      {/* prefix pill under origin */}
      {prefix ? (
        <g>
          <rect
            x={cardX(0) + W / 2 - (prefix.length * 4 + 12)}
            y={CHAIN_Y + H + 10}
            width={prefix.length * 8 + 24}
            height={22}
            rx={6}
            fill="#0e2b27"
            stroke="#2f5b53"
            strokeWidth={1}
          />
          <text
            x={cardX(0) + W / 2}
            y={CHAIN_Y + H + 25}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={11}
            fill="#4fe0c4"
          >
            {prefix}
          </text>
        </g>
      ) : null}
      {/* growing AS_PATH staircase */}
      {showGrowingPath ? (
        <>
          <text
            x={startX}
            y={titleY}
            fontFamily="var(--font-mono)"
            fontSize={9.5}
            letterSpacing="0.12em"
            fill="#5d6675"
          >
            AS_PATH AT EACH HOP (NEWEST ASN PREPENDED ON THE LEFT)
          </text>
          {asns.map((_, i) => {
            const path = asns.slice(0, i + 1).reverse();
            return (
              <text
                key={`p${i}`}
                x={startX}
                y={rowY(i)}
                fontFamily="var(--font-mono)"
                fontSize={12}
              >
                <tspan fill="#5d6675">{`at ${hops[i]}:  `}</tspan>
                {path.map((asn, k) => (
                  <tspan key={k} fill={k === 0 ? "#4fe0c4" : "#9aa3af"}>
                    {(k > 0 ? " " : "") + asn}
                  </tspan>
                ))}
              </text>
            );
          })}
        </>
      ) : null}
    </Figure>
  );
}

/* ------------------------- Mode B: path + reject ------------------------- */
function RejectMode({
  asPath = [],
  highlightIndex,
  rejectLabel,
  eyebrow,
  caption,
  ariaLabel,
}: ASPathFlowProps) {
  const H = 32;
  const GAP = 10;
  const PILL_Y = 30;
  const widths = asPath.map((a) => a.length * 8.5 + 22);
  const total = widths.reduce((a, b) => a + b, 0) + GAP * (asPath.length - 1);
  const startX = Math.max(8, (VBW - total) / 2);
  const xs: number[] = [];
  let cur = startX;
  for (const w of widths) {
    xs.push(cur);
    cur += w + GAP;
  }
  const hi = highlightIndex ?? -1;
  const hiCx = hi >= 0 ? xs[hi] + widths[hi] / 2 : VBW / 2;
  const height = 132;

  const label =
    ariaLabel ?? `AS_PATH ${asPath.join(" ")}, route rejected as a loop.`;

  return (
    <Figure eyebrow={eyebrow} caption={caption} height={height} label={label}>
      <text
        x={VBW / 2}
        y={16}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        letterSpacing="0.14em"
        fill="#5d6675"
      >
        AS_PATH ON THE ARRIVING ROUTE
      </text>
      {asPath.map((asn, i) => {
        const on = i === hi;
        return (
          <g key={i}>
            <rect
              x={xs[i]}
              y={PILL_Y}
              width={widths[i]}
              height={H}
              rx={8}
              fill={on ? "#2c1418" : "#10141b"}
              stroke={on ? "#ff7a8a" : "#243042"}
              strokeWidth={on ? 1.75 : 1.25}
            />
            <text
              x={xs[i] + widths[i] / 2}
              y={PILL_Y + 21}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={14}
              fontWeight={600}
              fill={on ? "#ff7a8a" : "#e8e6df"}
            >
              {asn}
            </text>
          </g>
        );
      })}
      {hi >= 0 ? (
        <path
          d={`M${hiCx} ${PILL_Y + H + 3} l-5 8 l10 0 Z`}
          fill="#ff7a8a"
        />
      ) : null}
      {rejectLabel ? (
        <text
          x={hiCx}
          y={PILL_Y + H + 26}
          textAnchor="middle"
          fontFamily="var(--font-body)"
          fontSize={12}
          fill="#ff7a8a"
        >
          {rejectLabel}
        </text>
      ) : null}
      <g>
        <rect x={VBW / 2 - 75} y={104} width={150} height={22} rx={11} fill="#2c1418" stroke="#ff7a8a" strokeWidth={1.25} />
        <text x={VBW / 2} y={119} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={11} letterSpacing="0.12em" fontWeight={600} fill="#ff7a8a">
          ✕ ROUTE REJECTED
        </text>
      </g>
    </Figure>
  );
}
