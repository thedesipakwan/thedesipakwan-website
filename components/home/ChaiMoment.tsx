"use client";

import { useRef } from "react";
import ChaiCup, { ThekuaBiscuit } from "@/components/svg/ChaiCup";
import SplitTextReveal from "@/components/motion/SplitTextReveal";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export default function ChaiMoment() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // steam curls loop
      const steam = ref.current?.querySelectorAll<SVGPathElement>(".chai-steam");
      steam?.forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len });
        gsap.fromTo(
          p,
          { strokeDashoffset: len, opacity: 0 },
          {
            strokeDashoffset: -len,
            opacity: 0.7,
            duration: 3,
            repeat: -1,
            ease: "none",
            delay: i * 0.6,
          }
        );
      });

      // thekua dunks into the cup on scroll
      gsap.fromTo(
        ".chai-thekua",
        { y: -140, rotation: -30 },
        {
          y: 10,
          rotation: 10,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            end: "center center",
            scrub: true,
          },
        }
      );
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="grain overflow-hidden bg-pista-100 py-20 md:py-32" aria-label="Chai moment">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 md:grid-cols-2">
        <div className="relative mx-auto w-full max-w-sm">
          <div className="chai-thekua absolute left-[54%] top-0 z-10 h-24 w-24 md:h-28 md:w-28">
            <ThekuaBiscuit className="h-full w-full drop-shadow-lg" />
          </div>
          <ChaiCup className="w-full text-paan-700" />
        </div>
        <div>
          <SplitTextReveal
            as="h2"
            className="font-display text-[clamp(34px,4.5vw,48px)] font-black leading-[1.05] text-paan-900"
          >
            Made for 4 PM.
          </SplitTextReveal>
          <SplitTextReveal as="p" className="mt-5 max-w-md text-[18px] leading-[1.6] text-paan-700" delay={0.15}>
            Thekua doesn&apos;t need a festival. It needs a cup of chai and ten quiet minutes.
            Dunk it. Hold it. It won&apos;t fall apart — that&apos;s the ghee talking.
          </SplitTextReveal>
        </div>
      </div>
    </section>
  );
}
