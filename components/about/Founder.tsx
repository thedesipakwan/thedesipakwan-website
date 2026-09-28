"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SplitTextReveal from "@/components/motion/SplitTextReveal";
import { MouldStamp } from "@/components/svg/MouldPattern";
import { founder } from "@/data/founder";

/** About page: founder portrait on one side, their story on the other. */
export default function Founder() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      // photo unveils bottom-up, the offset frame slides into place behind it
      gsap.fromTo(
        ".founder-photo",
        { clipPath: "inset(100% 0 0 0 round 28px)" },
        {
          clipPath: "inset(0% 0 0 0 round 28px)",
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 70%", once: true },
        }
      );
      gsap.from(".founder-frame", {
        x: -30,
        y: -30,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: { trigger: el, start: "top 70%", once: true },
      });
      gsap.from(".founder-reveal", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".founder-story", start: "top 80%", once: true },
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="relative overflow-hidden bg-paan-900 py-24 md:py-32" aria-label="Meet the founder">
      {/* faint drifting pattern */}
      <div
        aria-hidden
        className="animate-pattern-drift pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "url(/images/svg/mould-pattern.svg)", backgroundSize: "220px 220px" }}
      />

      <div className="relative mx-auto grid max-w-[1180px] items-center gap-14 px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        {/* ---------- portrait ---------- */}
        <div className="relative mx-auto w-full max-w-[460px] lg:mx-0">
          {/* offset kesariya frame */}
          <div
            aria-hidden
            className="founder-frame absolute -bottom-5 -left-5 right-5 top-5 rounded-[28px] border-2 border-kesariya-500/60"
          />
          <div className="founder-photo relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-[var(--shadow-dark)]">
            <Image
              src={founder.photo}
              alt={founder.photoAlt}
              fill
              sizes="(max-width: 1024px) 90vw, 460px"
              className="object-cover"
            />
          </div>

          {/* name plate */}
          <div className="absolute -bottom-6 right-6 rounded-2xl bg-kesariya-500 px-5 py-3 shadow-[var(--shadow-dark)]">
            <p className="font-display text-[18px] font-black leading-tight text-paan-900">{founder.name}</p>
            <p className="text-[12px] font-bold text-paan-900/70">{founder.role}</p>
          </div>

          {/* mould stamp accent */}
          <div
            aria-hidden
            className="animate-spin-very-slow absolute -right-8 -top-8 h-24 w-24 text-kesariya-500 opacity-40"
          >
            <MouldStamp className="h-full w-full" />
          </div>
        </div>

        {/* ---------- story ---------- */}
        <div className="founder-story">
          <span className="founder-reveal inline-flex items-center gap-2 rounded-full border border-kesariya-500/30 bg-paan-700/40 px-4 py-1.5 text-[13px] font-bold tracking-wide text-kesariya-300">
            <span className="h-1.5 w-1.5 rounded-full bg-kesariya-500" />
            Meet the founder
          </span>

          <SplitTextReveal
            as="h2"
            className="font-display mt-6 text-[clamp(32px,4vw,48px)] font-black leading-[1.08] text-kesariya-500"
          >
            {founder.headline}
          </SplitTextReveal>

          <div className="mt-7 space-y-5">
            {founder.story.map((para, i) => (
              <p key={i} className="founder-reveal text-[17px] leading-[1.7] text-pista-100/80">
                {para}
              </p>
            ))}
          </div>

          {/* pull quote */}
          <blockquote className="founder-reveal relative mt-9 rounded-[24px] border border-pista-100/10 bg-paan-700/40 px-7 py-6 pl-16">
            <span
              aria-hidden
              className="font-display absolute left-5 top-2 text-[72px] font-black leading-none text-kesariya-500"
            >
              &ldquo;
            </span>
            <p className="font-display text-[clamp(20px,2.2vw,26px)] font-bold leading-snug text-pista-100">
              {founder.quote}
            </p>
          </blockquote>

          {/* signature */}
          <p className="founder-reveal font-hand mt-8 text-[36px] font-semibold leading-none text-kesariya-300">
            — {founder.name}
          </p>
        </div>
      </div>
    </section>
  );
}
