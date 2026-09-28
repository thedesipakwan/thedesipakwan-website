/**
 * Six trust icons, 2px stroke style. Each path carries the `trust-icon-path`
 * class so TrustStrip can animate stroke-dashoffset when in view.
 */

type IconProps = { className?: string };

const stroke = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

export function GheeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* a drop falling into a bowl */}
      <path className="trust-icon-path" d="M24 6 C24 6 18 14 18 18 a6 6 0 0 0 12 0 C30 14 24 6 24 6 Z" {...stroke} />
      <path className="trust-icon-path" d="M10 30 h28 c0 6 -5 12 -14 12 s-14 -6 -14 -12 Z" {...stroke} />
    </svg>
  );
}

export function NoPreservativesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* leaf */}
      <path className="trust-icon-path" d="M38 10 C20 10 10 22 10 38 C26 38 38 28 38 10 Z" {...stroke} />
      <path className="trust-icon-path" d="M14 34 C20 26 28 20 34 14" {...stroke} />
    </svg>
  );
}

export function HandmadeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* open palm */}
      <path
        className="trust-icon-path"
        d="M16 26 V12 a3 3 0 0 1 6 0 v10 M22 22 V8 a3 3 0 0 1 6 0 v14 M28 22 V11 a3 3 0 0 1 6 0 v15"
        {...stroke}
      />
      <path
        className="trust-icon-path"
        d="M34 26 l4 -5 a3 3 0 0 1 5 4 l-8 11 c-3 4 -7 6 -12 6 c-7 0 -12 -5 -12 -12 v-8 a3 3 0 0 1 6 0"
        {...stroke}
      />
    </svg>
  );
}

export function FreshIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* clock with a sparkle */}
      <circle className="trust-icon-path" cx="22" cy="26" r="14" {...stroke} />
      <path className="trust-icon-path" d="M22 18 v8 l6 4" {...stroke} />
      <path className="trust-icon-path" d="M38 8 l1.5 4 L44 13.5 l-4.5 1.5 L38 19 l-1.5 -4 L32 13.5 l4.5 -1.5 Z" {...stroke} />
    </svg>
  );
}

export function FssaiIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* shield with tick */}
      <path className="trust-icon-path" d="M24 4 L40 10 V22 C40 33 33 40 24 44 C15 40 8 33 8 22 V10 Z" {...stroke} />
      <path className="trust-icon-path" d="M16 24 l6 6 l10 -12" {...stroke} />
    </svg>
  );
}

export function PackingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* box with cushion lines */}
      <path className="trust-icon-path" d="M8 16 L24 8 L40 16 V34 L24 42 L8 34 Z" {...stroke} />
      <path className="trust-icon-path" d="M8 16 L24 24 L40 16 M24 24 V42" {...stroke} />
      <path className="trust-icon-path" d="M15 12.5 L31 20.5" {...stroke} />
    </svg>
  );
}

export function AttaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* wheat stalk */}
      <path className="trust-icon-path" d="M24 44 V14" {...stroke} />
      <path
        className="trust-icon-path"
        d="M24 20 C19 20 16 17 16 12 C21 12 24 15 24 20 Z M24 20 C29 20 32 17 32 12 C27 12 24 15 24 20 Z M24 13 C19 13 16 10 16 5 C21 5 24 8 24 13 Z M24 13 C29 13 32 10 32 5 C27 5 24 8 24 13 Z"
        {...stroke}
      />
      <path className="trust-icon-path" d="M24 28 C19 28 16 25 16 20 M24 28 C29 28 32 25 32 20" {...stroke} />
    </svg>
  );
}

export function NoPalmOilIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* oil drop, struck through */}
      <path
        className="trust-icon-path"
        d="M24 6 C24 6 13 20 13 28 a11 11 0 0 0 22 0 C35 20 24 6 24 6 Z"
        {...stroke}
      />
      <path className="trust-icon-path" d="M10 40 L38 10" {...stroke} />
    </svg>
  );
}

export const trustItems = [
  { Icon: GheeIcon, label: "Desi ghee" },
  { Icon: AttaIcon, label: "100% atta, no maida" },
  { Icon: NoPalmOilIcon, label: "No palm oil" },
  { Icon: NoPreservativesIcon, label: "No preservatives" },
  { Icon: HandmadeIcon, label: "Handmade" },
  { Icon: FreshIcon, label: "Fresh after order" },
  { Icon: FssaiIcon, label: "FSSAI certified" },
  { Icon: PackingIcon, label: "Breakage-safe packing" },
];
