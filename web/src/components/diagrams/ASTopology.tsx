/**
 * <ASTopology> — a reusable topology diagram for MDX content.
 *
 * Authors place nodes on a `col`/`row` grid and connect them with `links`; the
 * component handles layout, edge-aware link routing, brand styling, an optional
 * legend, and an accessible label/caption. Prefer it over hand-rolled SVG/ASCII.
 *
 * Optional `groups` draws a labelled box around a set of nodes — e.g. to enclose
 * every router that belongs to one AS.
 *
 * `nodeShape` picks the glyph:
 *   - "card" (default): a labelled AS card (ASN + name). For AS-level topologies.
 *   - "router": a router icon (cylinder + routing arrows) with the name beneath.
 *     For device/router-level diagrams.
 *
 * Example:
 *   <ASTopology
 *     nodeShape="router"
 *     nodes={[{ id: "a", name: "A", col: 0, row: 0 }, { id: "b", name: "B", col: 1, row: 0 }]}
 *     links={[{ from: "a", to: "b" }]}
 *   />
 */
import type { ReactNode } from "react";
import { ZoomableFigure } from "./ZoomableFigure";

export interface ASNode {
  id: string;
  name: string;
  asn?: string;
  /** Grid column, 0-based, left -> right. */
  col: number;
  /** Grid row, 0-based, top -> bottom. */
  row: number;
  /** Secondary styling for edge/customer nodes. */
  muted?: boolean;
  /**
   * Small faint line(s) under the node, e.g. interface and loopback addresses.
   * Pass an array to stack multiple lines (interfaces first, loopback last).
   */
  sublabel?: string | string[];
}

/** Normalize a sublabel (string | string[] | undefined) to a list of lines. */
function toLines(s?: string | string[]): string[] {
  return s == null ? [] : Array.isArray(s) ? s : [s];
}

export interface ASLink {
  from: string;
  to: string;
  /** Render dimmer (e.g. customer/provider verticals). */
  faint?: boolean;
}

/**
 * A labelled box drawn around a set of nodes — e.g. to enclose every router in
 * one AS. Rendered behind the nodes and links so it reads as a grouping cloud.
 */
export interface ASGroup {
  /** Ids of the nodes this box encloses. */
  nodes: string[];
  /** Label shown at the top-left of the box, e.g. "AS 65001". */
  label?: string;
}

export interface ASTopologyProps {
  nodes: ASNode[];
  links?: ASLink[];
  groups?: ASGroup[];
  nodeShape?: "card" | "router";
  eyebrow?: string;
  legend?: string;
  caption?: ReactNode;
  ariaLabel?: string;
}

const MARGIN_X = 10;
const MARGIN_Y = 10;
const CELL_W = 228;
const CELL_H = 132;
const CARD_W = 154;
const CARD_H = 60;
const ROW_TOP_PAD = 20;
// Padding from the enclosed nodes to the edge of a group box. The horizontal
// pad clears the widest sublabel; the top pad leaves room for the box label.
const GROUP_PAD_X = 72;
const GROUP_PAD_TOP = 26;
const GROUP_PAD_BOTTOM = 14;

interface Box {
  cx: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  mid: number;
  /** card-only: top-left of the card */
  cardX: number;
  cardY: number;
  /** router-only: cylinder vertical center */
  my: number;
}

function boxOf(n: ASNode, shape: "card" | "router"): Box {
  const cellLeftX = MARGIN_X + n.col * CELL_W;
  const cellTopY = MARGIN_Y + n.row * CELL_H + ROW_TOP_PAD;
  const cx = cellLeftX + CELL_W / 2;
  if (shape === "router") {
    const CW = 50;
    const CH = 31;
    const my = cellTopY + 30;
    return {
      cx,
      left: cx - CW / 2,
      right: cx + CW / 2,
      top: my - CH / 2,
      bottom: my + CH / 2,
      mid: my,
      cardX: cx - CW / 2,
      cardY: my - CH / 2,
      my,
    };
  }
  const x = cellLeftX + (CELL_W - CARD_W) / 2;
  return {
    cx,
    left: x,
    right: x + CARD_W,
    top: cellTopY,
    bottom: cellTopY + CARD_H,
    mid: cellTopY + CARD_H / 2,
    cardX: x,
    cardY: cellTopY,
    my: cellTopY,
  };
}

/**
 * The full vertical/horizontal footprint of a node *including* its labels
 * (name, asn, sublabels), used to size group boxes around it. Mirrors the y
 * offsets used when the node's text is rendered below.
 */
function nodeExtent(n: ASNode, shape: "card" | "router") {
  const g = boxOf(n, shape);
  const lines = toLines(n.sublabel);
  let bottom: number;
  if (shape === "router") {
    bottom = lines.length
      ? g.bottom + (n.asn ? 47 : 33) + (lines.length - 1) * 12
      : g.bottom + (n.asn ? 33 : 18);
  } else {
    const sub = lines.length
      ? g.cardY + (n.asn ? 56 : 50) + (lines.length - 1) * 11
      : g.cardY + CARD_H;
    bottom = Math.max(g.cardY + CARD_H, sub);
  }
  return { cx: g.cx, top: g.top, bottom };
}

/** The router glyph: a small cylinder with two opposing routing arrows. */
function Router({ cx, my, muted }: { cx: number; my: number; muted?: boolean }) {
  const stroke = muted ? "#2a3340" : "#2f5b53";
  const rx = 25;
  const ry = 6.5;
  return (
    <g>
      <ellipse cx={cx} cy={my + 9} rx={rx} ry={ry} fill="#10141b" stroke={stroke} strokeWidth={1.4} />
      <rect x={cx - rx} y={my - 9} width={rx * 2} height={18} fill="#10141b" />
      <line x1={cx - rx} y1={my - 9} x2={cx - rx} y2={my + 9} stroke={stroke} strokeWidth={1.4} />
      <line x1={cx + rx} y1={my - 9} x2={cx + rx} y2={my + 9} stroke={stroke} strokeWidth={1.4} />
      <ellipse cx={cx} cy={my - 9} rx={rx} ry={ry} fill="#161c26" stroke={stroke} strokeWidth={1.4} />
      {/* routing arrows (->/<-) on the lid */}
      <line x1={cx - 8} y1={my - 12} x2={cx + 5} y2={my - 12} stroke="#4fe0c4" strokeWidth={1.5} />
      <path d={`M${cx + 5} ${my - 15} L${cx + 10} ${my - 12} L${cx + 5} ${my - 9} Z`} fill="#4fe0c4" />
      <line x1={cx + 8} y1={my - 6} x2={cx - 5} y2={my - 6} stroke="#4fe0c4" strokeWidth={1.5} />
      <path d={`M${cx - 5} ${my - 9} L${cx - 10} ${my - 6} L${cx - 5} ${my - 3} Z`} fill="#4fe0c4" />
    </g>
  );
}

export function ASTopology({
  nodes,
  links = [],
  groups = [],
  nodeShape = "card",
  eyebrow,
  legend,
  caption,
  ariaLabel,
}: ASTopologyProps) {
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...nodes.map((n) => n.row)) + 1;
  const legendH = legend ? 28 : 6;
  // Extra bottom room for nodes with several stacked sublabel lines (loopback +
  // interfaces) so the last row's labels never clip the frame or the legend.
  const maxSubLines = Math.max(1, ...nodes.map((n) => toLines(n.sublabel).length));
  const width = MARGIN_X * 2 + cols * CELL_W;
  const height =
    MARGIN_Y * 2 + rows * CELL_H + legendH + Math.max(0, maxSubLines - 1) * 12;
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const label =
    ariaLabel ??
    `Network topology showing ${nodes
      .map((n) => `${n.name}${n.asn ? ` (${n.asn})` : ""}`)
      .join(", ")}, connected by links.`;

  return (
    <ZoomableFigure label={eyebrow ?? "topology"}>
      {eyebrow ? (
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-blade-dim">
          {eyebrow}
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        className="block h-auto w-full"
      >
        {groups.map((grp, i) => {
          const ext = grp.nodes
            .map((id) => byId.get(id))
            .filter((n): n is ASNode => n != null)
            .map((n) => nodeExtent(n, nodeShape));
          if (!ext.length) return null;
          const left = Math.min(...ext.map((e) => e.cx)) - GROUP_PAD_X;
          const right = Math.max(...ext.map((e) => e.cx)) + GROUP_PAD_X;
          const top = Math.min(...ext.map((e) => e.top)) - GROUP_PAD_TOP;
          const bottom = Math.max(...ext.map((e) => e.bottom)) + GROUP_PAD_BOTTOM;
          return (
            <g key={`grp-${i}`}>
              <rect
                x={left}
                y={top}
                width={right - left}
                height={bottom - top}
                rx={16}
                fill="#4fe0c4"
                fillOpacity={0.035}
                stroke="#2f5b53"
                strokeWidth={1.4}
                strokeDasharray="5 4"
              />
              {grp.label ? (
                <text
                  x={left + 12}
                  y={top + 16}
                  fontFamily="var(--font-mono)"
                  fontSize={11}
                  letterSpacing="0.5"
                  fill="#4fe0c4"
                >
                  {grp.label}
                </text>
              ) : null}
            </g>
          );
        })}
        {links.map((lk, i) => {
          const a = byId.get(lk.from);
          const b = byId.get(lk.to);
          if (!a || !b) return null;
          const ga = boxOf(a, nodeShape);
          const gb = boxOf(b, nodeShape);
          let x1: number, y1: number, x2: number, y2: number;
          if (a.row === b.row) {
            const left = ga.cx < gb.cx ? ga : gb;
            const right = ga.cx < gb.cx ? gb : ga;
            x1 = left.right;
            x2 = right.left;
            y1 = y2 = left.mid;
          } else if (a.col === b.col) {
            const upper = ga.top < gb.top ? ga : gb;
            const lower = ga.top < gb.top ? gb : ga;
            x1 = x2 = upper.cx;
            y1 = upper.bottom;
            y2 = lower.top;
          } else {
            x1 = ga.cx;
            y1 = ga.mid;
            x2 = gb.cx;
            y2 = gb.mid;
          }
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#4fe0c4"
              strokeWidth={2}
              strokeOpacity={lk.faint ? 0.55 : 1}
            />
          );
        })}
        {nodes.map((n) => {
          const g = boxOf(n, nodeShape);
          if (nodeShape === "router") {
            return (
              <g key={n.id}>
                <Router cx={g.cx} my={g.my} muted={n.muted} />
                <text
                  x={g.cx}
                  y={g.bottom + 18}
                  textAnchor="middle"
                  fontFamily="var(--font-body)"
                  fontSize={14}
                  fontWeight={600}
                  fill="#e8e6df"
                >
                  {n.name}
                </text>
                {n.asn ? (
                  <text
                    x={g.cx}
                    y={g.bottom + 33}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize={10}
                    letterSpacing="0.5"
                    fill={n.muted ? "#2fa890" : "#4fe0c4"}
                  >
                    {n.asn}
                  </text>
                ) : null}
                {toLines(n.sublabel).map((line, i) => (
                  <text
                    key={i}
                    x={g.cx}
                    y={g.bottom + (n.asn ? 47 : 33) + i * 12}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize={9}
                    fill="#5d6675"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          }
          return (
            <g key={n.id}>
              <rect
                x={g.cardX}
                y={g.cardY}
                width={CARD_W}
                height={CARD_H}
                rx={12}
                fill="#10141b"
                stroke={n.muted ? "#1d232e" : "#243042"}
                strokeWidth={1.5}
              />
              {n.asn ? (
                <text
                  x={g.cx}
                  y={g.cardY + 26}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize={n.muted ? 10 : 11}
                  letterSpacing="0.5"
                  fill={n.muted ? "#2fa890" : "#4fe0c4"}
                >
                  {n.asn}
                </text>
              ) : null}
              <text
                x={g.cx}
                y={g.cardY + (n.asn ? 45 : 37)}
                textAnchor="middle"
                fontFamily="var(--font-body)"
                fontSize={n.muted ? 13.5 : 15}
                fontWeight={600}
                fill="#e8e6df"
              >
                {n.name}
              </text>
              {toLines(n.sublabel).map((line, i) => (
                <text
                  key={i}
                  x={g.cx}
                  y={g.cardY + (n.asn ? 56 : 50) + i * 11}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize={9}
                  fill="#5d6675"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
        {legend ? (
          <>
            <line
              x1={MARGIN_X}
              y1={height - 12}
              x2={MARGIN_X + 30}
              y2={height - 12}
              stroke="#4fe0c4"
              strokeWidth={2}
            />
            <text
              x={MARGIN_X + 38}
              y={height - 8}
              fontFamily="var(--font-mono)"
              fontSize={10.5}
              fill="#9aa3af"
            >
              {legend}
            </text>
          </>
        ) : null}
      </svg>
      {caption ? (
        <figcaption className="mt-3 text-center font-sans text-[13px] leading-normal text-paper-muted">
          {caption}
        </figcaption>
      ) : null}
    </ZoomableFigure>
  );
}
