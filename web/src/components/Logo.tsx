/**
 * NetworkNinjas mark: a shuriken whose points double as network nodes, wired
 * together — "ninja" meets "network graph". Pure SVG, currentColor-driven.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* links between nodes */}
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.5">
        <line x1="16" y1="6" x2="26" y2="16" />
        <line x1="26" y1="16" x2="16" y2="26" />
        <line x1="16" y1="26" x2="6" y2="16" />
        <line x1="6" y1="16" x2="16" y2="6" />
        <line x1="16" y1="6" x2="16" y2="26" />
        <line x1="6" y1="16" x2="26" y2="16" />
      </g>
      {/* shuriken core */}
      <path
        d="M16 9.5 18 14l4.5 2-4.5 2-2 4.5-2-4.5L9.5 16 14 14z"
        fill="currentColor"
      />
      {/* nodes */}
      <g fill="currentColor">
        <circle cx="16" cy="6" r="2.1" />
        <circle cx="26" cy="16" r="2.1" />
        <circle cx="16" cy="26" r="2.1" />
        <circle cx="6" cy="16" r="2.1" />
      </g>
      <circle cx="16" cy="16" r="1.4" fill="#0a0c10" />
    </svg>
  );
}
