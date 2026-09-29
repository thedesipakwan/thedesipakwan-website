"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SplitTextReveal from "@/components/motion/SplitTextReveal";

/**
 * "Three ingredients" — a zigzag of landscape photo tiles (3:2), each with
 * its title and copy beside it, over a slowly drifting mould pattern.
 */
export default function Ingredients() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      // each row slides in from the side its photo sits on
      gsap.utils.toArray<HTMLElement>(".ing-row", el).forEach((row, i) => {
        gsap.from(row, {
          x: i % 2 ? 60 : -60,
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 85%", once: true },
        });
      });
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-paan-900 py-20 md:py-28"
      aria-label="Three ingredients"
    >
      {/* faint drifting mould pattern */}
      <div
        aria-hidden
        className="animate-pattern-drift pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "url(/images/svg/mould-pattern.svg)",
          backgroundSize: "220px 220px",
        }}
      />
      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <SplitTextReveal
            as="h2"
            className="font-display text-[clamp(34px,4.5vw,48px)] font-black leading-[1.05] text-kesariya-500"
          >
            Three ingredients. That&apos;s it.
          </SplitTextReveal>
          <p className="max-w-sm text-[16px] text-pista-100/60">
            No preservatives, no palm oil, no shortcuts. If it&apos;s not one of these three, it&apos;s
            not in the jar.
          </p>
        </div>

        <div className="flex flex-col gap-10 md:gap-14">
          <Row
            word="Atta"
            hindi="आटा"
            lead="Stone-ground whole wheat. No maida, ever."
            copy="Milled slow in small batches so the bran and its nutty flavour stay in — the same coarse, unbleached atta Bihari kitchens have always trusted for thekua."
            image="/images/feature/atta.webp"
            alt="Stone-ground whole wheat atta flour with wheat stalks and a wooden scoop"
            offset="xl:ml-0"
          />
          <Row
            word="Gud"
            hindi="गुड़"
            lead="Pure sugarcane jaggery, melted slow."
            copy="Unrefined gud straight from the kolhu — iron and minerals intact, and that deep caramel colour no white sugar can fake."
            image="/images/feature/gur.webp"
            alt="Blocks of pure sugarcane jaggery (gud) with sugarcane and a clay pot"
            offset="xl:ml-[6%]"
            reverse
          />
          <Row
            word="Ghee"
            hindi="घी"
            lead="Desi cow ghee, and only ghee."
            copy="The only fat that touches our kadhai. Ghee-fried thekua stays khasta for weeks without preservatives — that aroma is the ghee talking."
            image="/images/feature/ghee.webp"
            alt="Golden desi cow ghee in a brass bowl"
            offset="xl:ml-0"
          />
        </div>
      </div>
    </section>
  );
}

function Row({
  word,
  hindi,
  lead,
  copy,
  image,
  alt,
  offset,
  reverse = false,
}: {
  word: string;
  hindi: string;
  lead: string;
  copy: string;
  image: string;
  alt: string;
  offset: string;
  /** true = text sits on the LEFT of the tile (desktop). */
  reverse?: boolean;
}) {
  return (
    <div
      className={`ing-row flex flex-col items-start gap-6 sm:items-center sm:gap-8 lg:gap-14 xl:gap-28 ${
        reverse ? "sm:flex-row-reverse" : "sm:flex-row"
      } ${offset}`}
    >
      {/* landscape photo (3:2), clean rounded corners */}
      <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-[28px] sm:w-[42%] xl:w-[500px]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 500px"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div
        className="animated-border w-full max-w-2xl flex-1 rounded-[20px] bg-paan-700/25 px-7 py-6 text-left lg:px-9"
      >
        <h3 className="font-display text-[clamp(34px,4vw,52px)] font-black leading-none text-kesariya-500">
          {word}
          <span className="font-devanagari ml-3 align-middle text-[17px] font-normal text-kesariya-300/60">
            {hindi}
          </span>
        </h3>
        <p className="mt-3 text-[16px] font-bold text-pista-100">{lead}</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-pista-100/65">{copy}</p>
      </div>
    </div>
  );
}
