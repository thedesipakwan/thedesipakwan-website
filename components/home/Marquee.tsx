"use client";

import type { ReactNode } from "react";

/**
 * CSS marquee. Content is duplicated so translateX(-50%) loops seamlessly.
 * Hovering slows (or pauses) it; reduced-motion kills the animation entirely.
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
  return (
    <div
      className={`overflow-hidden ${pauseOnHover ? "marquee-paused" : ""} ${
        slowOnHover ? "marquee-hover-slow" : ""
      } ${className}`}
      role={ariaLabel ? "marquee" : undefined}
      aria-label={ariaLabel}
    >
      <div
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
