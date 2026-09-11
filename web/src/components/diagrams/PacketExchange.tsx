/**
 * <PacketExchange> - a reusable sequence diagram for MDX.
 *
 * Actors sit in columns across the top with dashed lifelines beneath them; each
 * message is a numbered arrow between two lifelines, read top to bottom. Built
 * for request/response protocols: DHCP's DORA, ARP, a DNS lookup, the TCP
 * three-way handshake. Prefer this over hand-rolled SVG.
 *
 * Example (in an .mdx file):
 *   <PacketExchange
 *     eyebrow="A DHCP lease, step by step"
 *     actors={[
 *       { id: "client", label: "Client", sublabel: "no address yet" },
 *       { id: "server", label: "DHCP server", sublabel: "10.0.0.1" },
 *     ]}
 *     messages={[
 *       { from: "client", to: "server", label: "DISCOVER", note: "broadcast: is anyone out there?" },
 *       { from: "server", to: "client", label: "OFFER", note: "how about 10.0.0.50?", dashed: true },
 *       { from: "client", to: "server", label: "REQUEST", note: "yes, I'll take it" },
 *       { from: "server", to: "client", label: "ACK", note: "it's yours for 24h", dashed: true, accent: "sakura" },
 *     ]}
 *     caption="..."
 *   />
 */
import type { ReactNode } from "react";

type MessageAccent = "blade" | "sakura" | "muted";

export interface ExchangeActor {
  id: string;
  label: string;
  sublabel?: string;
}

export interface ExchangeMessage {
  /** Actor id the message leaves from. */
  from: string;
  /** Actor id the message arrives at (must differ from `from`). */
  to: string;
  label: string;
  /** Short muted line under the arrow, e.g. what the message carries. */
  note?: string;
  /** Dashed arrow, conventionally used for replies. */
  dashed?: boolean;
  accent?: MessageAccent;
}

export interface PacketExchangeProps {
  actors: ExchangeActor[];
  messages: ExchangeMessage[];
  /** Prefix each message label with its step number. Default true. */
  numbered?: boolean;
  eyebrow?: string;
  caption?: ReactNode;
  ariaLabel?: string;
}

const ACCENT: Record<MessageAccent, string> = {
  blade: "#4fe0c4",
  sakura: "#ff7a8a",
  muted: "#9aa3af",
};
const LINE = "#5d6675";

const W = 720;
const PAD_X = 96;
const HEAD_Y = 8;
const HEAD_W = 156;
const HEAD_H = 48;
const FIRST_MSG_Y = HEAD_Y + HEAD_H + 44;
const ROW = 58;
const ARROW = 9;

export function PacketExchange({
  actors,
  messages,
  numbered = true,
  eyebrow,
  caption,
  ariaLabel,
}: PacketExchangeProps) {
  const n = actors.length;
  const colX = (i: number) =>
    n === 1 ? W / 2 : PAD_X + (i * (W - 2 * PAD_X)) / (n - 1);
  const xOf = new Map(actors.map((a, i) => [a.id, colX(i)]));

  // Fail loudly at build time on an authoring mistake, rather than silently
  // dropping an arrow from the diagram.
  messages.forEach((m, i) => {
    if (!xOf.has(m.from) || !xOf.has(m.to)) {
      throw new Error(
        `<PacketExchange> message ${i + 1} ("${m.label}") references an unknown actor: ${m.from} -> ${m.to}`,
      );
    }
    if (m.from === m.to) {
      throw new Error(
        `<PacketExchange> message ${i + 1} ("${m.label}") goes from "${m.from}" to itself; self-messages are not supported`,
      );
    }
  });

  const lastMsgY = FIRST_MSG_Y + Math.max(messages.length - 1, 0) * ROW;
  const lifelineEnd = lastMsgY + 30;
  const H = lifelineEnd + 8;

  const nameOf = new Map(actors.map((a) => [a.id, a.label]));
  const label =
    ariaLabel ??
    `Sequence of messages between ${actors.map((a) => a.label).join(" and ")}: ${messages
      .map((m, i) => `${i + 1}. ${m.label} from ${nameOf.get(m.from)} to ${nameOf.get(m.to)}`)
      .join("; ")}.`;

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
        {actors.map((a, i) => {
          const x = colX(i);
          return (
            <g key={a.id}>
              <line
                x1={x}
                y1={HEAD_Y + HEAD_H}
                x2={x}
                y2={lifelineEnd}
                stroke={LINE}
                strokeWidth={1.5}
                strokeDasharray="3 6"
                strokeLinecap="round"
              />
              <rect
                x={x - HEAD_W / 2}
                y={HEAD_Y}
                width={HEAD_W}
                height={HEAD_H}
                rx={8}
                fill="#11161d"
                stroke={LINE}
                strokeWidth={1.2}
              />
              <text
                x={x}
                y={a.sublabel ? HEAD_Y + 21 : HEAD_Y + HEAD_H / 2 + 4.5}
                textAnchor="middle"
                fontFamily="var(--font-body)"
                fontSize={13}
                fontWeight={600}
                fill="#e6e9ee"
              >
                {a.label}
              </text>
              {a.sublabel ? (
                <text
                  x={x}
                  y={HEAD_Y + 37}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize={10}
                  fill="#9aa3af"
                >
                  {a.sublabel}
                </text>
              ) : null}
            </g>
          );
        })}

        {messages.map((m, i) => {
          const y = FIRST_MSG_Y + i * ROW;
          const x1 = xOf.get(m.from)!;
          const x2 = xOf.get(m.to)!;
          const dir = x2 > x1 ? 1 : -1;
          const color = ACCENT[m.accent ?? "blade"];
          const tip = x2 - dir * 3;
          const mid = (x1 + x2) / 2;
          return (
            <g key={i}>
              <line
                x1={x1 + dir * 3}
                y1={y}
                x2={tip - dir * ARROW}
                y2={y}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={m.dashed ? "6 5" : undefined}
              />
              <path
                d={`M${tip} ${y} L${tip - dir * ARROW} ${y - 5} L${tip - dir * ARROW} ${y + 5} Z`}
                fill={color}
              />
              <text
                x={mid}
                y={y - 9}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={12}
                fontWeight={600}
                letterSpacing="0.04em"
                fill={color}
              >
                {numbered ? `${i + 1}. ${m.label}` : m.label}
              </text>
              {m.note ? (
                <text
                  x={mid}
                  y={y + 18}
                  textAnchor="middle"
                  fontFamily="var(--font-body)"
                  fontSize={11}
                  fill="#9aa3af"
                >
                  {m.note}
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
