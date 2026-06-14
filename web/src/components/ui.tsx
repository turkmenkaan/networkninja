/**
 * Small presentational primitives shared across pages: difficulty/type/status
 * badges and a generic pill. Server-safe (no client hooks).
 */
import type { Difficulty, LabMode, PublishStatus, UnitType } from "@/lib/content/types";

export function Pill({
  children,
  className = "",
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "blade" | "sakura" | "ember";
}) {
  const tones: Record<string, string> = {
    neutral: "border-ink-line bg-ink-raised text-paper-muted",
    blade: "border-blade/30 bg-blade/10 text-blade",
    sakura: "border-sakura/30 bg-sakura/10 text-sakura",
    ember: "border-ember/30 bg-ember/10 text-ember",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.12em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const difficultyTone: Record<Difficulty, "blade" | "ember" | "sakura"> = {
  beginner: "blade",
  intermediate: "ember",
  advanced: "sakura",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Pill tone={difficultyTone[difficulty]}>{difficulty}</Pill>;
}

export function TypeBadge({ type, mode }: { type: UnitType; mode?: LabMode }) {
  if (type === "lab") {
    return (
      <Pill tone={mode === "challenge" ? "sakura" : "blade"}>
        <FlaskIcon className="h-3 w-3" />
        lab{mode ? ` · ${mode}` : ""}
      </Pill>
    );
  }
  return (
    <Pill tone="neutral">
      <BookIcon className="h-3 w-3" />
      lesson
    </Pill>
  );
}

export function StatusBadge({ status }: { status: PublishStatus }) {
  if (status === "published") return null;
  return (
    <Pill tone="ember">
      <LockIcon className="h-3 w-3" />
      coming soon
    </Pill>
  );
}

export function MinutesBadge({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-paper-faint">
      <ClockIcon className="h-3.5 w-3.5" />
      {minutes} min
    </span>
  );
}

/* --- icons (currentColor, inline) ------------------------------------------ */

type IconProps = { className?: string };

export function FlaskIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 2v3.5L2.8 11a1.5 1.5 0 0 0 1.3 2.3h7.8A1.5 1.5 0 0 0 13.2 11L10 5.5V2M5 2h6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.3 9h7.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function BookIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 3.5C6.8 2.7 5.3 2.5 3.5 2.5A1 1 0 0 0 2.5 3.5v8a1 1 0 0 0 1 1c1.8 0 3.3.2 4.5 1 1.2-.8 2.7-1 4.5-1a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1c-1.8 0-3.3.2-4.5 1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8 3.5v9" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function LockIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function ClockIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v3l2 1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DownloadIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GithubIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}
