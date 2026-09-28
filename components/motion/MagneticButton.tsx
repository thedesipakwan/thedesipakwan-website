"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, isDesktop, prefersReducedMotion } from "@/lib/gsap";

/**
 * Wraps a button/link so it drifts toward the cursor (±8px within ~80px)
 * on desktop pointers only.
 */
export default function MagneticButton({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDesktop() || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const radius = Math.max(rect.width, 80) + 40;
      if (dist < radius) {
        xTo(gsap.utils.clamp(-8, 8, (dx / radius) * 16));
        yTo(gsap.utils.clamp(-8, 8, (dy / radius) * 16));
      } else {
        xTo(0);
        yTo(0);
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}
