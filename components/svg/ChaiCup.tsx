/** Illustrated chai cup with three steam paths (animated in ChaiMoment). */
export default function ChaiCup({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 220" className={className} fill="none" aria-hidden>
      {/* steam — three paths, class hooks for GSAP */}
      <path
        className="chai-steam"
        d="M78 78 C70 62, 88 56, 80 40 C74 28, 86 22, 82 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        className="chai-steam"
        d="M100 74 C92 58, 110 52, 102 36 C96 24, 108 18, 104 6"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        className="chai-steam"
        d="M122 78 C114 62, 132 56, 124 40 C118 28, 130 22, 126 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* cup */}
      <path
        d="M52 96 H148 C148 96 146 152 128 168 C118 177 82 177 72 168 C54 152 52 96 52 96 Z"
        fill="var(--pista-200)"
        stroke="var(--paan-900)"
        strokeWidth="5"
      />
      {/* tea line */}
      <path d="M58 108 C80 116 120 116 142 108" stroke="var(--paan-700)" strokeWidth="4" strokeLinecap="round" />
      {/* handle */}
      <path
        d="M148 108 C170 108 172 140 148 146"
        stroke="var(--paan-900)"
        strokeWidth="5"
        fill="none"
      />
      {/* saucer */}
      <ellipse cx="100" cy="192" rx="66" ry="12" fill="var(--pista-200)" stroke="var(--paan-900)" strokeWidth="5" />
    </svg>
  );
}

/** Thekua biscuit that dunks into the cup on scroll. */
export function ThekuaBiscuit({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="42" fill="var(--wheat)" stroke="var(--earth)" strokeWidth="4" />
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="26"
          rx="5"
          ry="12"
          fill="none"
          stroke="var(--earth)"
          strokeWidth="2.5"
          transform={`rotate(${i * 45} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="6" fill="var(--earth)" />
    </svg>
  );
}
