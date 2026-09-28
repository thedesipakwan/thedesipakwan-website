"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { ButtonLink } from "@/components/ui/Button";
import MagneticButton from "@/components/motion/MagneticButton";
import Marquee from "./Marquee";
import ChakliSpiral from "@/components/svg/ChakliSpiral";

const marqueeWords = ["Thekua", "Chakli", "Desi ghee", "Gud", "Made in Bihar"];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        return;
      }

      // slow cinematic settle on the photo as the page loads (ends at natural size)
      gsap.fromTo(
        ".hero-bg",
        { scale: 1.08 },
        { scale: 1, duration: 2.2, ease: "expo.out" }
      );
      // …and a gentle parallax drift as you scroll away (no zoom)
      gsap.to(".hero-bg", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });

      const headline = el.querySelector(".hero-headline");
      if (headline) {
        const split = SplitText.create(headline, { type: "lines,chars", mask: "lines" });
        gsap.from(split.chars, {
          yPercent: 115,
          rotation: 6,
          duration: 1,
          ease: "expo.out",
          stagger: 0.02,
          delay: 0.3,
          // the line masks clip tight ascenders/descenders, so remove them
          // (and restore the original text) once the entrance is done
          onComplete: () => split.revert(),
        });
      }
      gsap.from(".hero-sub, .hero-ctas, .hero-cue", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.8,
      });
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      className="relative flex min-h-[115svh] flex-col justify-end overflow-hidden bg-paan-900 md:min-h-[100svh] lg:aspect-[2/1] lg:min-h-0"
    >
      {/* background photo fills the hero edge to edge. Phones use a copy
          rotated 90° (jar at the bottom, dark space at the top for the text). */}
      <div className="absolute inset-0" aria-hidden>
        <div className="hero-bg absolute inset-0">
          <Image
            src="/images/hero-2-mobile.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-bottom md:hidden"
          />
          <Image
            src="/images/hero-2.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hidden object-cover object-center md:block"
          />
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-end px-6 pb-[calc(60svh-50px)] pt-24 md:justify-center md:pb-8 md:pt-64">
        <h1 className="hero-headline font-display max-w-4xl text-[clamp(48px,8.5vw,108px)] font-black leading-[0.95] tracking-[-0.02em] text-kesariya-500">
          Ghar ka khasta,
          <br />
          ghar tak.
        </h1>

        <p className="hero-sub mt-6 max-w-xl text-[18px] leading-[1.55] text-pista-100/90 md:text-[20px]">
          Handmade thekua & chakli from a Bihari kitchen. Desi ghee. No maida, no palm oil,
          no preservatives. Shipped fresh across India.
        </p>

        {/* phones: two compact half-width buttons on one row */}
        <div className="hero-ctas mt-8 flex items-center gap-3 md:gap-4">
          <MagneticButton className="min-w-0 flex-1 md:flex-none">
            <ButtonLink
              href="/shop"
              className="h-12! w-full whitespace-nowrap px-2! text-[clamp(13px,3.8vw,15px)]! md:h-14! md:w-auto md:px-8! md:text-[17px]!"
            >
              Shop the crunch
            </ButtonLink>
          </MagneticButton>
          <MagneticButton className="min-w-0 flex-1 md:flex-none">
            <ButtonLink
              href="/about"
              variant="secondary"
              className="h-12! w-full whitespace-nowrap bg-paan-900/70 px-2! text-[clamp(13px,3.8vw,15px)]! backdrop-blur-sm md:h-14! md:w-auto md:bg-transparent md:px-8! md:text-[17px]! md:backdrop-blur-none"
            >
              How it&apos;s made
            </ButtonLink>
          </MagneticButton>
        </div>

        <div className="hero-cue mt-12 hidden md:flex" aria-hidden>
          <ChakliSpiral className="animate-spin-slow h-9 w-9 text-kesariya-500/60" strokeWidth={7} />
        </div>
      </div>

      <Marquee
        duration={28}
        slowOnHover
        className="relative border-t border-pista-100/5 py-4"
        ariaLabel="The Desi Pakwan highlights"
      >
        {marqueeWords.map((w) => (
          <span
            key={w}
            className="font-display mx-5 whitespace-nowrap text-[32px] font-bold text-kesariya-300/25 md:text-[40px]"
          >
            {w} <span className="mx-3">·</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
