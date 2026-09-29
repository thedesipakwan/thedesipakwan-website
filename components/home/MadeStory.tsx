"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SplitTextReveal from "@/components/motion/SplitTextReveal";

/**
 * "How it's made" — a pinned, scroll-scrubbed photo story. Desktop: four
 * kitchen photos crossfade with a gentle settle as you scroll, with captions,
 * a progress rail and step dots. Mobile / reduced motion: a vertical list.
 */

const steps = [
  {
    title: "Kneaded by hand",
    copy: "Atta, gud and ghee, worked slow till the dough turns silky.",
    image: "/images/feature/making-1.webp",
    alt: "Two women hand-mixing thekua dough in a brass paraat in a sunlit courtyard kitchen",
  },
  {
    title: "Pressed in the family mould",
    copy: "The same wooden saancha, three generations of thumbprints deep.",
    image: "/images/feature/making-2.webp",
    alt: "Thekua dough being pressed in a carved wooden mould",
  },
  {
    title: "Fried slow in desi ghee",
    copy: "Low flame, no hurry. That's where the crunch comes from.",
    image: "/images/feature/making-3.webp",
    alt: "Thekua frying golden in a kadhai of desi ghee",
  },
  {
    title: "Packed the same day",
    copy: "Sealed while it's still warm from the kadhai.",
    image: "/images/feature/making-4.webp",
    alt: "Fresh thekua being packed for shipping",
  },
];

export default function MadeStory() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const reduced = prefersReducedMotion();

      const desktop = el.querySelector<HTMLElement>(".made-desktop");
      const mobile = el.querySelector<HTMLElement>(".made-mobile");

      // Reduced motion: always the simple list, no pinning.
      if (reduced && desktop && mobile) {
        desktop.style.display = "none";
        mobile.style.display = "block";
        return;
      }

      const mm = gsap.matchMedia();

      /* ---- desktop: pinned scrubbed photo story ---- */
      mm.add("(min-width: 768px)", () => {
        if (!desktop) return;
        const q = gsap.utils.selector(desktop);
        const scenes = q(".made-scene");
        const vtitles = q(".made-vtitle");
        const caps = q(".made-cap"); // tablet captions under the photo
        const dots = q(".made-dot");

        gsap.set(scenes.slice(1), { autoAlpha: 0 });
        gsap.set(vtitles.slice(1), { autoAlpha: 0, y: 40 });
        gsap.set(caps.slice(1), { autoAlpha: 0, y: 20 });
        gsap.set(q(".made-progress"), { scaleY: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: desktop,
            start: "top top",
            end: "+=2400",
            pin: true,
            scrub: true,
          },
        });

        tl.to(q(".made-progress"), { scaleY: 1, duration: 4, ease: "none" }, 0);

        for (let i = 0; i < steps.length; i++) {
          if (i > 0) {
            tl.to(scenes[i - 1], { autoAlpha: 0, duration: 0.22, ease: "power2.in" }, i);
            tl.to(vtitles[i - 1], { autoAlpha: 0, y: -40, duration: 0.18, ease: "power2.in" }, i);
            tl.to(scenes[i], { autoAlpha: 1, duration: 0.26, ease: "power2.out" }, i + 0.08);
            tl.to(vtitles[i], { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" }, i + 0.12);
            tl.to(caps[i - 1], { autoAlpha: 0, y: -20, duration: 0.18, ease: "power2.in" }, i);
            tl.to(caps[i], { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" }, i + 0.12);
          }
          // slow Ken Burns settle on each photo while its step is active
          tl.fromTo(
            scenes[i].querySelector("img"),
            { scale: 1.1 },
            { scale: 1, duration: 1, ease: "none" },
            i
          );
          tl.to(dots[i], { scale: 1.5, backgroundColor: "#FF8A3C", duration: 0.08 }, i + 0.2);
        }
      });

      /* ---- mobile: simple in-view reveals ---- */
      mm.add("(max-width: 767px)", () => {
        if (!mobile) return;
        gsap.utils.toArray<HTMLElement>(".made-card", mobile).forEach((card) => {
          gsap.from(card, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="overflow-hidden bg-paan-900" aria-label="How it's made">
      <div className="mx-auto max-w-[1280px] px-6 pt-20 md:pt-32">
        <SplitTextReveal
          as="h2"
          className="font-display max-w-2xl text-[clamp(34px,4.5vw,48px)] font-black leading-[1.05] text-kesariya-500"
        >
          How it&apos;s made
        </SplitTextReveal>
        <p className="mt-3 max-w-md text-[17px] text-pista-100/70">
          Four steps. Zero shortcuts. Scroll through an afternoon in the kitchen.
        </p>
      </div>

      {/* ---------- desktop: pinned photo story ---------- */}
      <div className="made-desktop relative hidden h-screen md:block">
        {/* progress rail */}
        <div
          className="absolute left-10 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex"
          aria-hidden
        >
          <div className="relative h-56 w-[3px] overflow-hidden rounded-full bg-pista-100/15">
            <div className="made-progress absolute inset-0 origin-top rounded-full bg-kesariya-500" />
          </div>
          <div className="flex flex-col gap-3">
            {steps.map((s) => (
              <span key={s.title} className="made-dot h-2.5 w-2.5 rounded-full bg-pista-100/30" />
            ))}
          </div>
        </div>

        {/* stage */}
        <div className="flex h-full items-center justify-center gap-8 px-6">
          {/* vertical step title, reads bottom-to-top, swaps with the photo */}
          <div className="relative hidden h-[60vh] w-16 shrink-0 xl:block" aria-hidden>
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="made-vtitle absolute inset-0 flex items-center justify-center"
              >
                <span className="font-display whitespace-nowrap text-[clamp(22px,2.4vw,32px)] font-black text-kesariya-500 [writing-mode:vertical-rl] rotate-180">
                  <span className="mr-0 text-[15px] font-bold tracking-[0.3em] text-kesariya-300/60">
                    0{i + 1}&nbsp;&nbsp;
                  </span>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          <div className="flex w-full max-w-[1020px] flex-col">
            <div className="relative aspect-[5/4] max-h-[62vh] w-full xl:aspect-[3/2] xl:max-h-[76vh]">
              {steps.map((s) => (
                <div
                  key={s.title}
                  className="made-scene absolute inset-0 overflow-hidden rounded-[28px] shadow-[var(--shadow-dark)]"
                >
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 1020px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* tablets: step caption under the photo (large screens use the
                vertical title instead) */}
            <div className="relative mt-6 h-28 xl:hidden">
              {steps.map((s, i) => (
                <div key={s.title} className="made-cap absolute inset-0">
                  <p className="text-[13px] font-bold tracking-[0.25em] text-kesariya-300/70">
                    {String(i + 1).padStart(2, "0")} / 04
                  </p>
                  <h3 className="font-display mt-1 text-[30px] font-black leading-tight text-kesariya-500">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-[17px] text-pista-100/70">{s.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- mobile / reduced motion: vertical list ---------- */}
      <div className="made-mobile mx-auto max-w-[1280px] space-y-6 px-6 pb-20 pt-10 md:hidden">
        {steps.map((s, i) => (
          <div key={s.title} className="made-card overflow-hidden rounded-[28px] bg-paan-700/40">
            <div className="relative aspect-[3/2] w-full">
              <Image src={s.image} alt={s.alt} fill sizes="100vw" className="object-cover" />
            </div>
            <div className="p-6">
              <p className="text-[12px] font-bold tracking-[0.25em] text-kesariya-300/70">
                {String(i + 1).padStart(2, "0")} / 04
              </p>
              <h3 className="font-display mt-1 text-[24px] font-black text-kesariya-500">{s.title}</h3>
              <p className="mt-1 text-[15px] text-pista-100/70">{s.copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
