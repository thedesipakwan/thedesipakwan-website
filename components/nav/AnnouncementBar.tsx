"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProduct } from "@/data/products";
import { formatINR } from "@/lib/pricing";
import ChakliSpiral from "@/components/svg/ChakliSpiral";

/** Headline figure on the strip. */
const OFFER_UP_TO = 25;

// Ticker slides use the real catalogue prices, so they're always correct.
const SLIDES = ["gud-thekua", "cheeni-thekua", "chakli", "namak-pare", "complete-desi-pakwan-box"].flatMap((slug) => {
  const p = getProduct(slug);
  const v = p?.variants[0];
  if (!p || !v?.compareAt || v.compareAt <= v.price) return [];
  return [{ slug, name: p.name, mrp: v.compareAt, price: v.price }];
});

const SLIDE_MS = 3600;
const EXIT_MS = 350;

/**
 * Offer strip above the navbar (it slides away with the nav on scroll):
 * a spinning chakli, a light wave rippling through "UP TO 25% OFF", and a
 * ticker where each product's MRP gets slashed and the real price drops in.
 * A spark runs along the bottom edge like a lit fuse.
 */
export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (SLIDES.length < 2) return;
    let exitTimer: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      setLeaving(true);
      exitTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % SLIDES.length);
        setLeaving(false);
      }, EXIT_MS);
    }, SLIDE_MS);
    return () => {
      clearInterval(timer);
      clearTimeout(exitTimer);
    };
  }, []);

  const slide = SLIDES[index];

  return (
    <Link
      href="/shop"
      aria-label={`Festive offer: up to ${OFFER_UP_TO}% off on every jar and combo. Shop now`}
      className="group relative flex h-9 items-center justify-center overflow-hidden border-b border-kesariya-500/20 bg-paan-900 px-3 md:h-10"
    >
      {/* the thekua mould pattern, drifting faintly */}
      <span aria-hidden className="mould-tile animate-pattern-drift pointer-events-none absolute inset-0 opacity-[0.07]" />
      {/* a spark running along the bottom edge, like a lit fuse */}
      <span aria-hidden className="animate-fuse pointer-events-none absolute -bottom-px left-0 h-[2px] w-40">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-kesariya-500 to-kesariya-300" />
        <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-kesariya-300 shadow-[0_0_10px_3px_rgba(255,184,132,0.9)]" />
      </span>

      <span className="relative flex items-center gap-2.5 md:gap-4">
        {/* headline */}
        <span className="flex items-center gap-1.5 md:gap-2">
          <ChakliSpiral className="animate-spin-slow h-4 w-4 shrink-0 text-kesariya-500 [animation-duration:5s] md:h-5 md:w-5" strokeWidth={9} />
          <span aria-hidden className="font-display whitespace-nowrap text-[13px] font-black uppercase tracking-[0.04em] text-kesariya-500 md:text-[16px]">
            {`Up to ${OFFER_UP_TO}% off`.split("").map((ch, i) => (
              <span key={i} className="animate-letter-wave inline-block" style={{ animationDelay: `${i * 0.05}s` }}>
                {ch === " " ? " " : ch}
              </span>
            ))}
          </span>
        </span>

        {slide ? (
          <>
            <span aria-hidden className="h-4 w-px bg-pista-100/20" />
            {/* price-slash ticker */}
            <span aria-hidden className="relative flex h-6 items-center overflow-hidden md:h-7">
              <span
                key={slide.slug}
                className={`flex items-center gap-2 whitespace-nowrap md:gap-2.5 ${leaving ? "animate-tick-out" : "animate-tick-in"}`}
              >
                <span className="max-w-[78px] truncate text-[12px] font-bold text-pista-100 sm:max-w-none md:text-[14px]">
                  {slide.name}
                </span>
                <span className="relative text-[12px] font-medium text-pista-100/55 tabular-nums md:text-[13px]">
                  {formatINR(slide.mrp)}
                  <span className="animate-strike absolute inset-x-[-2px] top-1/2 h-[2px] -mt-px rounded-full bg-sindoor-600 shadow-[0_0_6px_rgba(255,138,60,0.8)]" />
                </span>
                <span className="animate-price-drop font-display inline-block text-[14px] font-black text-kesariya-300 tabular-nums md:text-[17px]">
                  {formatINR(slide.price)}
                </span>
                <span className="animate-save-pop inline-block rounded-full bg-sindoor-600 px-2 py-0.5 text-[11px] font-black text-pista-100 max-sm:hidden md:text-[12px]">
                  Save {formatINR(slide.mrp - slide.price)}
                </span>
              </span>
            </span>
          </>
        ) : null}

        <span className="hidden items-center gap-1 rounded-full bg-kesariya-500 px-3 py-1 text-[12px] font-black uppercase tracking-[0.04em] text-paan-900 transition-colors group-hover:bg-kesariya-300 lg:inline-flex">
          Shop now
          <span aria-hidden className="animate-arrow-nudge inline-block">
            →
          </span>
        </span>
      </span>
    </Link>
  );
}
