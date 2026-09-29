"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

/**
 * CSS marquee. Content is duplicated so translateX(-50%) loops seamlessly.
 * Hovering eases it to a stop (or a crawl) and leaving eases it back up, from
 * wherever it is — no jump. Reduced-motion kills the animation entirely.
 */
export default function Marquee({
  children,
  duration = 30,
  reverse = false,
  pauseOnHover = false,
  slowOnHover = false,
  className = "",
  ariaLabel,
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  slowOnHover?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const hoverRate = pauseOnHover ? 0 : slowOnHover ? 0.4 : 1;

  // ease the running CSS animation's playbackRate instead of swapping its
  // duration (which restarts it)
  const easeTo = (rate: number) => {
    const anim = trackRef.current?.getAnimations()[0];
    if (!anim) return;
    tweenRef.current?.kill();
    const state = { rate: anim.playbackRate };
    tweenRef.current = gsap.to(state, {
      rate,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        anim.playbackRate = state.rate;
      },
    });
  };

  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseEnter={hoverRate === 1 ? undefined : () => easeTo(hoverRate)}
      onMouseLeave={hoverRate === 1 ? undefined : () => easeTo(1)}
      role={ariaLabel ? "marquee" : undefined}
      aria-label={ariaLabel}
    >
      <div
        ref={trackRef}
        className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
