// Green is reserved for the Bestseller badge; everything else stays warm.
const styles: Record<string, string> = {
  bestseller: "bg-mehndi-600 text-pista-100",
  new: "bg-kesariya-500 text-paan-900",
  festive: "bg-sindoor-600 text-pista-100",
  gifting: "bg-paan-700 text-kesariya-300",
};

const labels: Record<string, string> = {
  bestseller: "Bestseller",
  new: "New",
  festive: "Festive",
  gifting: "Gifting",
};

/** Compact star rating — no review count until real reviews exist. */
export function Rating({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label={`Rated ${value} out of 5`}>
      <svg viewBox="0 0 20 20" className="h-4 w-4 text-kesar-400" fill="currentColor" aria-hidden>
        <path d="M10 1.5 12.6 7l6 .6-4.5 4 1.3 5.9L10 14.4 4.6 17.5 5.9 11.6 1.4 7.6l6-.6Z" />
      </svg>
      <span className="text-[14px] font-bold tabular-nums">{value.toFixed(1)}</span>
    </span>
  );
}

export function Badge({ kind }: { kind: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold ${styles[kind] ?? styles.gifting}`}
    >
      {labels[kind] ?? kind}
    </span>
  );
}

/** Sweetness (ghee drops) or spice (chillies) indicator dots. */
export function LevelDots({
  level,
  kind,
}: {
  level: 1 | 2 | 3;
  kind: "sweetness" | "spice";
}) {
  const full = kind === "spice" ? "bg-sindoor-600" : "bg-kesariya-500";
  const labelText =
    kind === "spice"
      ? ["Mild", "Medium", "Properly spicy"][level - 1]
      : ["Lightly sweet", "Sweet", "Extra sweet"][level - 1];
  return (
    <span className="inline-flex items-center gap-2" aria-label={`${labelText}`}>
      <span className="inline-flex gap-1" aria-hidden>
        {[1, 2, 3].map((i) => (
          <svg key={i} viewBox="0 0 12 14" className={`h-3.5 w-3 ${i <= level ? "" : "opacity-25"}`}>
            {kind === "spice" ? (
              <path
                d="M6 1 C7 1 8 2 8 3 C10 4 11 7 10 9 C9 12 6 13 4 13 C2 13 1 11 2 9 C3 6 4 4 4 3 C4 2 5 1 6 1 Z"
                className={`${i <= level ? "fill-sindoor-600" : "fill-paan-700"}`}
              />
            ) : (
              <path
                d="M6 1 C6 1 2 6 2 9 a4 4 0 0 0 8 0 C10 6 6 1 6 1 Z"
                className={`${i <= level ? "fill-kesar-400" : "fill-paan-700"}`}
              />
            )}
          </svg>
        ))}
      </span>
      <span className={`text-[13px] font-medium ${kind === "spice" ? "text-sindoor-600" : "text-kesar-400"}`}>
        {labelText}
      </span>
      <span className="sr-only">{full}</span>
    </span>
  );
}
