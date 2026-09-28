"use client";

import { useEffect, useRef, useState } from "react";
import { useCart, cartTotals } from "@/lib/cart";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export default function CartButton() {
  const lines = useCart((s) => s.lines);
  const lastAddedAt = useCart((s) => s.lastAddedAt);
  const openDrawer = useCart((s) => s.openDrawer);
  const ref = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!lastAddedAt || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { scale: 1 },
      { scale: 1.2, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }
    );
  }, [lastAddedAt]);

  const count = mounted ? cartTotals(lines).count : 0;

  return (
    <button
      ref={ref}
      type="button"
      id="cart-button"
      onClick={openDrawer}
      aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-pista-100 transition-colors hover:text-kesariya-500"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 7 h12 l1.5 13 a1 1 0 0 1 -1 1 H5.5 a1 1 0 0 1 -1 -1 Z" />
        <path d="M9 10 V6 a3 3 0 0 1 6 0 v4" />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sindoor-600 px-1 text-[11px] font-bold text-pista-100">
          {count}
        </span>
      ) : null}
    </button>
  );
}
