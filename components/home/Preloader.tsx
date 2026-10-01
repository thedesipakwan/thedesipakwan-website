"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { MouldStamp } from "@/components/svg/MouldPattern";

/** First-visit-only preloader: the logo stamps down over a faint turning
 *  mould pattern, then everything wipes upward. Max ~1.6s. */
export default function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  // Rendered in the server HTML so it covers the hero from the first paint;
  // the inline script in app/layout.tsx hides it (#tdp-pre-hide) for repeat visits.
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (document.getElementById("tdp-pre-hide") || prefersReducedMotion()) {
      setShow(false);
      return;
    }
    try {
      sessionStorage.setItem("tdp-seen", "1");
    } catch {}

    const el = ref.current;
    if (!el) return;
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setShow(false);
      },
    });
    tl.fromTo(
      el.querySelector(".pre-mould"),
      { scale: 0.6, opacity: 0 },
      { scale: 1, opacity: 0.12, duration: 0.5, ease: "power3.out" }
    )
      .fromTo(
        el.querySelector(".pre-logo"),
        { scale: 1.35, rotation: -6, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
        "-=0.35"
      )
      .to(el, { yPercent: -100, duration: 0.5, ease: "expo.inOut", delay: 0.45 });

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div ref={ref} id="tdp-preloader" className="fixed inset-0 z-[100] flex items-center justify-center bg-paan-900" aria-hidden>
      {/* faint mould pattern turning behind the logo */}
      <div className="pre-mould absolute text-kesariya-500 opacity-0">
        <MouldStamp className="animate-spin-very-slow h-[min(80vw,520px)] w-[min(80vw,520px)]" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- must paint instantly, before next/image hydrates */}
      <img
        src="/images/logo-trim.webp"
        alt=""
        className="pre-logo relative w-[min(72vw,380px)] opacity-0 drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
}
