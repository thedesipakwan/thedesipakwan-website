"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion, isDesktop } from "@/lib/gsap";
import SplitTextReveal from "@/components/motion/SplitTextReveal";
import MagneticButton from "@/components/motion/MagneticButton";

/**
 * STORIES — "Har ghar ki kahani". Four Polaroid-style moments of thekua and
 * chakli being shared. Desktop: the cards start as a stacked pile and slide
 * apart into a row as you scroll (pinned + scrubbed). Phones and tablets
 * (below 1280px): a snap-scroll carousel — tablets show two cards with the
 * third peeking in. Emotional, not promotional — one CTA at the end.
 */

const ROTATIONS = [-4, 2, -2, 3];
// vertical offsets so the fixed cards sit scattered, not in a straight line
const SCATTER_Y = [10, -12, 14, -8];

const stories = [
  {
    image: "/images/feature/img-1.webp",
    lines: ["Sunday. One plate. Four hands.", "Nobody remembers what was on TV."],
  },
  {
    image: "/images/feature/img-2.webp",
    lines: ["Papa said Nani's was better.", "Then he finished the box."],
  },
  {
    image: "/images/feature/img-3.webp",
    lines: ["The guests were getting up to leave.", "Then the chakli came out."],
  },
  {
    image: "/images/feature/img-4.webp",
    lines: ["One dabba. Five friends.", "Empty before second period."],
  },
];

export default function Stories() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1280px)", () => {
        const desktop = el.querySelector<HTMLElement>(".stories-desktop");
        if (!desktop) return;
        const cards = gsap.utils.toArray<HTMLElement>(".story-card", desktop);

        // scattered resting pose (GSAP-owned so hover can restore it)
        cards.forEach((card, i) => gsap.set(card, { rotation: ROTATIONS[i], y: SCATTER_Y[i] }));

        // hover: lift and straighten
        if (isDesktop()) {
          cards.forEach((card, i) => {
            const enter = () =>
              gsap.to(card, { y: SCATTER_Y[i] - 12, rotation: 0, duration: 0.3, ease: "power2.out" });
            const leave = () =>
              gsap.to(card, { y: SCATTER_Y[i], rotation: ROTATIONS[i], duration: 0.4, ease: "power2.out" });
            card.addEventListener("mouseenter", enter);
            card.addEventListener("mouseleave", leave);
          });
        }
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="relative overflow-hidden bg-paan-900" aria-label="Stories">
      {/* faint drifting mould pattern */}
      <div
        aria-hidden
        className="animate-pattern-drift pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "url(/images/svg/mould-pattern.svg)",
          backgroundSize: "220px 220px",
        }}
      />

      {/* ---------- desktop: fixed scattered cards ---------- */}
      <div className="stories-desktop relative hidden py-32 xl:block">
        <div className="mx-auto w-full max-w-[1280px] px-6">
          <SplitTextReveal
            as="h2"
            className="font-display text-[clamp(34px,4.5vw,48px)] font-black leading-[1.05] text-kesariya-500"
          >
            Har ghar mein ek kahani hai.
          </SplitTextReveal>
          <p className="mt-2 text-[17px] text-pista-100/70">Four moments, one dabba.</p>
        </div>

        <div className="mx-auto mt-14 flex w-full max-w-[1280px] items-center justify-center gap-8 px-6">
          {stories.map((s) => (
            <StoryCard key={s.image} story={s} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <CTA />
        </div>
      </div>

      {/* ---------- phones + tablets: snap carousel ---------- */}
      <div className="relative py-20 md:py-28 xl:hidden">
        <div className="px-6">
          <h2 className="font-display text-[34px] font-black leading-[1.05] text-kesariya-500 md:text-[clamp(34px,4.5vw,48px)]">
            Har ghar mein ek kahani hai.
          </h2>
          <p className="mt-2 text-[16px] text-pista-100/70 md:text-[17px]">Four moments, one dabba.</p>
        </div>
        <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[10vw] pb-6 pt-4 md:mt-10 md:scroll-px-6 md:gap-8 md:px-6">
          {stories.map((s, i) => (
            <div key={s.image} className="snap-center md:snap-start" style={{ rotate: `${ROTATIONS[i]}deg` }}>
              <StoryCard story={s} plain />
            </div>
          ))}
        </div>
        <div className="mt-8 px-6 text-center">
          <CTA />
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <>
      <p className="font-display text-[clamp(24px,3vw,34px)] font-black text-pista-100">
        Aapki kahani kaunsi hai?
      </p>
      <div className="mt-5 inline-block">
        <MagneticButton>
          <Link
            href="/product/gud-thekua"
            className="inline-flex h-14 items-center justify-center rounded-full bg-sindoor-600 px-8 text-[17px] font-bold text-pista-100 transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            Start with a 400g jar · ₹379
          </Link>
        </MagneticButton>
      </div>
    </>
  );
}

function StoryCard({
  story,
  plain = false,
}: {
  story: (typeof stories)[number];
  plain?: boolean;
}) {
  return (
    <div
      className={`story-card relative w-[240px] shrink-0 rounded-[8px] bg-[#FFF3DC] p-5 pb-3 shadow-[0_24px_60px_rgba(42,20,8,0.45)] ${
        plain ? "w-[76vw] max-w-[300px] md:w-[36vw] md:max-w-[380px]" : "lg:w-[268px]"
      }`}
    >
      {/* washi tape */}
      <svg
        viewBox="0 0 90 26"
        className="absolute -left-5 -top-3 h-7 w-24 -rotate-[28deg]"
        aria-hidden
      >
        <path
          d="M7 3 L84 0 L90 6 L85 11 L90 17 L83 23 L6 26 L0 19 L5 13 L1 7 Z"
          fill="#F4B942"
          opacity="0.85"
        />
      </svg>

      <div className="relative aspect-[4/5] overflow-hidden rounded-[4px]">
        <Image
          src={story.image}
          alt={story.lines[0]}
          fill
          sizes="(max-width: 768px) 76vw, (max-width: 1280px) 36vw, 268px"
          className="object-cover"
        />
      </div>

      <p className="font-hand mt-3 min-h-[64px] pr-10 text-[24px] font-semibold leading-[1.1] text-[#2A1408] lg:text-[26px]">
        {story.lines[0]}
        <br />
        {story.lines[1]}
      </p>

      {/* Desi Pakwan sticker */}
      <svg viewBox="0 0 64 64" className="absolute bottom-2.5 right-2.5 h-12 w-12 rotate-6" aria-hidden>
        <circle cx="32" cy="32" r="30" fill="#2E6B3F" />
        <circle cx="32" cy="32" r="25" fill="none" stroke="#FF8A3C" strokeWidth="2.5" />
        <text
          x="32"
          y="29"
          textAnchor="middle"
          fill="#FFF3DC"
          fontSize="9.5"
          fontWeight="700"
          fontFamily="var(--font-manrope), sans-serif"
        >
          DESI
        </text>
        <text
          x="32"
          y="41"
          textAnchor="middle"
          fill="#FFF3DC"
          fontSize="9.5"
          fontWeight="700"
          fontFamily="var(--font-manrope), sans-serif"
        >
          PAKWAN
        </text>
      </svg>
    </div>
  );
}
