/**
 * The thekua mould motif — a flower/diamond impression like the carved
 * wooden saancha. Used as a single stamp (preloader) and as a tile.
 */

export function MouldStamp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden>
      {/* outer scalloped ring */}
      <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="3" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x = 60 + 44 * Math.cos(a);
        const y = 60 + 44 * Math.sin(a);
        return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.5" fill="currentColor" />;
      })}
      {/* petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * 360;
        return (
          <ellipse
            key={i}
            cx="60"
            cy="34"
            rx="7"
            ry="16"
            stroke="currentColor"
            strokeWidth="2.5"
            transform={`rotate(${a} 60 60)`}
          />
        );
      })}
      {/* centre diamond */}
      <rect
        x="52"
        y="52"
        width="16"
        height="16"
        stroke="currentColor"
        strokeWidth="2.5"
        transform="rotate(45 60 60)"
      />
      <circle cx="60" cy="60" r="3" fill="currentColor" />
    </svg>
  );
}

/** Full-width stamped-edge divider between sections. */
export function MouldDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center gap-10 overflow-hidden py-2 opacity-20 ${className}`} aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <MouldStamp key={i} className="h-8 w-8 shrink-0" />
      ))}
    </div>
  );
}

/** Faint repeating background tile (inline, for dark bands). */
export function MouldTile({ className = "", opacity = 0.05 }: { className?: string; opacity?: number }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage: "url(/images/svg/mould-pattern.svg)",
        backgroundSize: "220px 220px",
      }}
    />
  );
}
