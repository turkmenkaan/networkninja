/**
 * <HierarchyTree> — a reusable top-down tiered hierarchy / delegation tree for MDX.
 *
 * Nodes are placed on tiers (tier 0 at the top) and connected by edges drawn
 * from a parent's bottom to a child's top. Good for allocation/delegation
 * chains (IANA -> RIRs -> operators), route-reflector hierarchies, area
 * structures, etc. Prefer this over ASCII or hand-rolled SVG.
 *
 * Example (in an .mdx file):
 *   <HierarchyTree
 *     eyebrow="Who hands out ASNs"
 *     nodes={[
 *       { id: "iana", label: "IANA", sublabel: "global pool", tier: 0 },
 *       { id: "arin", label: "ARIN", sublabel: "North America", tier: 1 },
 *       { id: "ops",  label: "Operators / ISPs", tier: 2, w: 300 },
 *     ]}
 *     edges={[{ from: "iana", to: "arin" }, { from: "arin", to: "ops", faint: true }]}
 *     tierLabels={{ 1: "Regional Internet Registries (RIRs)" }}
 *     caption="..."
 *   />
 */
import type { ReactNode } from "react";

export interface TreeNode {
  id: string;
  label: string;
  sublabel?: string;
  /** 0 = top tier. */
  tier: number;
  /** Optional card width override (px). */
  w?: number;
  muted?: boolean;
}

export interface TreeEdge {
  from: string;
  to: string;
  faint?: boolean;
}

export interface HierarchyTreeProps {
  nodes: TreeNode[];
  edges?: TreeEdge[];
  /** Centered annotation chip above a given tier. */
  tierLabels?: Record<number, string>;
  eyebrow?: string;
  caption?: ReactNode;
  ariaLabel?: string;
}

const VBW = 720;
const MARGIN_X = 12;
const CARD_W = 122;
const CARD_H = 50;
const GAP_X = 14;
const ROW_GAP = 50;
const TOP = 10;

export function HierarchyTree({
  nodes,
  edges = [],
  tierLabels = {},
  eyebrow,
  caption,
  ariaLabel,
}: HierarchyTreeProps) {
  const maxTier = Math.max(...nodes.map((n) => n.tier));

  // Lay out each tier: center its row of cards horizontally.
  type Geom = { x: number; y: number; w: number; cx: number; top: number; bottom: number };
  const geom = new Map<string, Geom>();
  for (let t = 0; t <= maxTier; t++) {
    const row = nodes.filter((n) => n.tier === t);
    const widths = row.map((n) => n.w ?? CARD_W);
    const total = widths.reduce((a, b) => a + b, 0) + GAP_X * (row.length - 1);
    let x = Math.max(MARGIN_X, (VBW - total) / 2);
    const y = TOP + t * (CARD_H + ROW_GAP);
    row.forEach((n, i) => {
      const w = widths[i];
      geom.set(n.id, { x, y, w, cx: x + w / 2, top: y, bottom: y + CARD_H });
      x += w + GAP_X;
    });
  }

  const height = TOP + (maxTier + 1) * CARD_H + maxTier * ROW_GAP + 8;
  const label =
    ariaLabel ??
    `Hierarchy diagram: ${nodes.map((n) => n.label).join(", ")}.`;

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
        {edges.map((e, i) => {
          const a = geom.get(e.from);
          const b = geom.get(e.to);
          if (!a || !b) return null;
          const parent = a.y <= b.y ? a : b;
          const child = a.y <= b.y ? b : a;
          return (
            <line
              key={i}
              x1={parent.cx}
              y1={parent.bottom}
              x2={child.cx}
              y2={child.top}
              stroke="#4fe0c4"
              strokeWidth={1.6}
              strokeOpacity={e.faint ? 0.4 : 0.85}
            />
          );
        })}
        {Object.entries(tierLabels).map(([tierStr, text]) => {
          const t = Number(tierStr);
          const y = TOP + t * (CARD_H + ROW_GAP);
          const chipW = text.length * 6.2 + 22;
          return (
            <g key={`tl-${t}`}>
              <rect
                x={VBW / 2 - chipW / 2}
                y={y - 34}
                width={chipW}
                height={20}
                rx={6}
                fill="#070809"
                stroke="#1d232e"
                strokeWidth={1}
              />
              <text
                x={VBW / 2}
                y={y - 20}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={10}
                letterSpacing="0.1em"
                fill="#8b95a4"
              >
                {text.toUpperCase()}
              </text>
            </g>
          );
        })}
        {nodes.map((n) => {
          const g = geom.get(n.id)!;
          return (
            <g key={n.id}>
              <rect
                x={g.x}
                y={g.y}
                width={g.w}
                height={CARD_H}
                rx={11}
                fill="#10141b"
                stroke={n.muted ? "#1d232e" : "#243042"}
                strokeWidth={1.5}
              />
              <text
                x={g.cx}
                y={n.sublabel ? g.y + 21 : g.y + 30}
                textAnchor="middle"
                fontFamily="var(--font-body)"
                fontSize={14}
                fontWeight={600}
                fill="#e8e6df"
              >
                {n.label}
              </text>
              {n.sublabel ? (
                <text
                  x={g.cx}
                  y={g.y + 37}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize={8.5}
                  letterSpacing="0.02em"
                  fill="#5d6675"
                >
                  {n.sublabel}
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
