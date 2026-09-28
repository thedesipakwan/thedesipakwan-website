"use client";

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
  onDark = false,
  label = "Quantity",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  onDark?: boolean;
  label?: string;
}) {
  const btn = `flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg font-bold transition-colors ${
    onDark
      ? "border-pista-100/30 text-pista-100 hover:border-kesariya-500 hover:text-kesariya-500"
      : "border-paan-900/25 text-paan-900 hover:border-paan-900"
  } disabled:opacity-30`;
  return (
    <div
      className={`inline-flex items-center gap-3 ${onDark ? "text-pista-100" : "text-paan-900"}`}
      role="group"
      aria-label={label}
    >
      <button type="button" className={btn} aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="min-w-6 text-center text-[17px] font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
