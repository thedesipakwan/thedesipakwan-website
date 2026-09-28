import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paan-900 px-6 py-36 text-center">
      {/* bitten thekua */}
      <svg viewBox="0 0 120 120" className="h-32 w-32" aria-hidden>
        <defs>
          <mask id="bite">
            <rect width="120" height="120" fill="white" />
            <circle cx="100" cy="30" r="26" fill="black" />
          </mask>
        </defs>
        <g mask="url(#bite)">
          <circle cx="60" cy="60" r="48" fill="var(--wheat)" stroke="var(--earth)" strokeWidth="4" />
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse
              key={i}
              cx="60"
              cy="32"
              rx="6"
              ry="14"
              fill="none"
              stroke="var(--earth)"
              strokeWidth="2.5"
              transform={`rotate(${i * 45} 60 60)`}
            />
          ))}
          <circle cx="60" cy="60" r="5" fill="var(--earth)" />
        </g>
        {/* crumbs */}
        <circle cx="103" cy="52" r="3" fill="var(--wheat)" />
        <circle cx="93" cy="14" r="2.5" fill="var(--wheat)" />
        <circle cx="112" cy="40" r="2" fill="var(--wheat)" />
      </svg>

      <h1 className="font-display text-[clamp(36px,5vw,56px)] font-black text-kesariya-500">
        This page got eaten.
      </h1>
      <p className="max-w-sm text-[17px] text-pista-100/70">
        Someone couldn&apos;t resist. The rest of the jar is still in the shop.
      </p>
      <Link
        href="/shop"
        className="inline-flex h-14 items-center rounded-full bg-sindoor-600 px-8 text-[17px] font-bold text-pista-100 transition-transform hover:scale-[1.03]"
      >
        Back to the shop
      </Link>
    </div>
  );
}
