"use client";

import { useRef } from "react";
import Marquee from "./Marquee";
import { trustItems } from "@/components/svg/TrustIcons";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export default function TrustStrip() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const paths = ref.current?.querySelectorAll<SVGPathElement>(".trust-icon-path, circle.trust-icon-path");
      if (!paths?.length) return;
      paths.forEach((p) => {
        const len = "getTotalLength" in p ? (p as SVGGeometryElement).getTotalLength() : 100;
        gsap.fromTo(
          p,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
          }
        );
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="bg-mehndi-600 py-6" aria-label="Why trust The Desi Pakwan">
      <Marquee duration={26} pauseOnHover ariaLabel="Trust badges">
        {trustItems.map(({ Icon, label }) => (
          <span key={label} className="mx-8 flex items-center gap-3 whitespace-nowrap text-pista-100">
            <Icon className="h-8 w-8" />
            <span className="text-[16px] font-bold">{label}</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
