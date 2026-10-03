/** Five stars filled to a decimal rating (e.g. 4.7), with the number beside them. */
export default function Stars({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`} aria-label={`${n.toFixed(1)} out of 5 stars`}>
      <span className="flex gap-0.5 text-kesar-400" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.min(1, Math.max(0, n - i));
          return (
            <span key={i} className="relative h-4 w-4">
              <StarIcon className="absolute inset-0 h-4 w-4 opacity-25" />
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <StarIcon className="h-4 w-4" />
              </span>
            </span>
          );
        })}
      </span>
      <span className="text-[13px] font-bold tabular-nums text-paan-700/70" aria-hidden>
        {n.toFixed(1)}
      </span>
    </span>
  );
}

function StarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor">
      <path d="M10 1.5 12.6 7l6 .6-4.5 4 1.3 5.9L10 14.4 4.6 17.5 5.9 11.6 1.4 7.6l6-.6Z" />
    </svg>
  );
}
