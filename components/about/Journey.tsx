"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SplitTextReveal from "@/components/motion/SplitTextReveal";
import { MouldStamp } from "@/components/svg/MouldPattern";

/**
 * About page journey: a sticky photo that swaps to match the step being
 * read, beside a timeline whose kesariya line fills as you scroll and whose
 * numbered dots light up as each step becomes active.
 */

const steps = [
  {
    title: "The mould",
    tag: "Since the first batch",
    copy: "It started with a wooden saancha that's older than the founder. Same flower, same diamond, pressed into every thekua.",
    image: "/images/feature/making-2.webp",
    alt: "Thekua dough being pressed in a carved wooden mould",
  },
  {
    title: "The kitchen",
    tag: "Small batches",
    copy: "A home-style kitchen in Bihar. Small batches, desi ghee, and gud melted slow — never powders, never shortcuts.",
    image: "/images/feature/making-1.webp",
    alt: "Two women hand-mixing thekua dough in a sunlit courtyard kitchen",
  },
  {
    title: "Made after you order",
    tag: "Dispatch in 2–3 days",
    copy: "Nothing sits on a shelf. Your order is kneaded, pressed, fried and packed within 2–3 working days of you tapping Pay.",
    image: "/images/feature/making-3.webp",
    alt: "Thekua frying golden in a kadhai of desi ghee",
  },
  {
    title: "Packed to survive India",
    tag: "Breakage promise",
    copy: "Cushioned, sealed, breakage-safe. If more than 20% still arrives broken, we replace it free — photo on WhatsApp within 24 hours.",
    image: "/images/feature/making-4.webp",
    alt: "Fresh thekua being packed into jars",
  },
];

export default function Journey() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  // Active step + line fill are computed live from on-screen positions every
  // scroll frame, so they can't drift when layout above them changes.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stepEls = Array.from(el.querySelectorAll<HTMLElement>(".journey-step"));
    const track = el.querySelector<HTMLElement>(".journey-track");
    const fill = el.querySelector<HTMLElement>(".journey-fill");

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.55;

      let current = 0;
      stepEls.forEach((step, i) => {
        if (step.getBoundingClientRect().top <= line) current = i;
      });
      setActive((prev) => (prev === current ? prev : current));

      if (track && fill) {
        const r = track.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (line - r.top) / r.height));
        fill.style.transform = `scaleY(${p})`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const stepEls = gsap.utils.toArray<HTMLElement>(".journey-step", el);

      // steps slide in once
      stepEls.forEach((step) => {
        gsap.from(step, {
          x: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 85%", once: true },
        });
      });

      gsap.from(".journey-frame", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 75%", once: true },
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="grain relative overflow-clip bg-pista-100 py-24 md:py-32">
      {/* faint mould watermark */}
      <div
        aria-hidden
        className="animate-spin-very-slow pointer-events-none absolute -right-40 top-20 text-paan-900 opacity-[0.04]"
      >
        <MouldStamp className="h-[560px] w-[560px]" />
      </div>

      <div className="relative mx-auto max-w-[1180px] px-6">
        {/* header */}
        <div className="mb-16 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-paan-900/5 px-4 py-1.5 text-[13px] font-bold tracking-wide text-mehndi-600">
            <span className="h-1.5 w-1.5 rounded-full bg-kesariya-500" />
            The journey of every jar
          </span>
          <SplitTextReveal
            as="h2"
            className="font-display mt-5 text-[clamp(34px,4.5vw,52px)] font-black leading-[1.05] text-paan-900"
          >
            Four promises, kept in every batch.
          </SplitTextReveal>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          {/* ---------- sticky photo (desktop) ---------- */}
          <div className="hidden lg:block">
            <div className="journey-frame sticky top-28">
              {/* sized to always fit the viewport while it sticks */}
              <div className="relative h-[min(calc(100vh-10rem),680px)] w-full overflow-hidden rounded-[28px] shadow-[0_30px_70px_rgba(6,28,19,0.22)]">
                {steps.map((s, i) => (
                  <Image
                    key={s.image}
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="520px"
                    className={`object-cover transition-all duration-700 ease-out ${
                      i === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
                    }`}
                  />
                ))}
                {/* current-step chip */}
                <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-full bg-paan-900/80 py-2 pl-2 pr-5 backdrop-blur-md">
                  <span className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-kesariya-500 text-[16px] font-black text-paan-900">
                    {active + 1}
                  </span>
                  <span key={active} className="animate-toast-in text-[14px] font-bold text-pista-100">
                    {steps[active].title}
                  </span>
                </div>
              </div>

              {/* rotating circular badge */}
              <div className="absolute -right-8 -top-8 h-32 w-32" aria-hidden>
                <div className="relative h-full w-full rounded-full bg-paan-900 shadow-[var(--shadow-dark)]">
                  <svg viewBox="0 0 120 120" className="animate-spin-very-slow absolute inset-0 h-full w-full">
                    <defs>
                      <path id="journey-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                    </defs>
                    <text fill="#FF8A3C" fontSize="11" fontWeight="700" letterSpacing="3.2">
                      <textPath href="#journey-circle">HANDMADE IN BIHAR · DESI GHEE ·</textPath>
                    </text>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-kesariya-500">
                    <MouldStamp className="h-11 w-11" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- timeline ---------- */}
          {/* bottom margin keeps the photo stuck while the last step is read */}
          <div className="journey-track relative lg:mb-[26vh]">
            {/* track + fill line */}
            <div className="absolute bottom-6 left-[23px] top-6 w-[3px] rounded-full bg-paan-900/10" aria-hidden />
            <div
              className="journey-fill absolute bottom-6 left-[23px] top-6 w-[3px] origin-top rounded-full bg-gradient-to-b from-kesariya-500 to-sindoor-600 transition-transform duration-150 ease-out"
              aria-hidden
            />

            <ol className="flex flex-col gap-8 md:gap-10 lg:gap-0">
              {steps.map((s, i) => {
                const isActive = i === active;
                const isDone = i < active;
                return (
                  <li
                    key={s.title}
                    className="journey-step relative pl-[76px] lg:min-h-[58vh] lg:last:min-h-0"
                  >
                    {/* numbered dot */}
                    <span
                      className={`font-display absolute left-0 top-4 flex h-[49px] w-[49px] items-center justify-center rounded-full border-[3px] text-[18px] font-black transition-all duration-500 ${
                        isActive
                          ? "scale-110 border-kesariya-500 bg-kesariya-500 text-paan-900 shadow-[0_0_0_8px_rgba(255,138,60,0.18)]"
                          : isDone
                            ? "border-kesariya-500 bg-pista-100 text-kesariya-500"
                            : "border-paan-900/15 bg-pista-100 text-paan-900/40"
                      }`}
                    >
                      {i + 1}
                    </span>

                    <div
                      className={`rounded-[24px] border p-6 transition-all duration-500 md:p-7 ${
                        isActive
                          ? "border-kesariya-500/40 bg-white shadow-[0_20px_50px_rgba(6,28,19,0.10)]"
                          : "border-transparent bg-white/40"
                      }`}
                    >
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[12px] font-bold transition-colors duration-500 ${
                          isActive ? "bg-kesariya-500/15 text-sindoor-600" : "bg-paan-900/5 text-paan-700/60"
                        }`}
                      >
                        {s.tag}
                      </span>
                      <h3 className="font-display mt-3 text-[clamp(22px,2.4vw,28px)] font-black leading-tight text-paan-900">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-[16px] leading-relaxed text-paan-700/80">{s.copy}</p>

                      {/* per-step photo on mobile/tablet */}
                      <div className="relative mt-5 aspect-[3/2] overflow-hidden rounded-[18px] lg:hidden">
                        <Image src={s.image} alt={s.alt} fill sizes="100vw" className="object-cover" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
