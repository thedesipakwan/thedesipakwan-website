"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Masked line (or char) reveal on scroll into view.
 * Lines slide up from under a mask with a 0.06s stagger.
 */
export default function SplitTextReveal({
  children,
  as: Tag = "div",
  className = "",
  type = "lines",
  delay = 0,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  type?: "lines" | "chars";
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        return;
      }

      const split = SplitText.create(el, {
        type: type === "chars" ? "lines,chars" : "lines",
        mask: "lines",
        linesClass: "split-line",
      });
      const targets = type === "chars" ? split.chars : split.lines;
      let reverted = false;
      const revert = () => {
        if (!reverted) {
          reverted = true;
          split.revert();
        }
      };

      gsap.from(targets, {
        yPercent: 110,
        rotation: type === "chars" ? 6 : 0,
        duration: type === "chars" ? 0.8 : 1,
        ease: "power3.out",
        stagger: type === "chars" ? 0.02 : 0.06,
        delay,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
        // line masks clip tight ascenders/descenders — remove them once done
        onComplete: revert,
      });

      return revert;
    },
    { scope: ref }
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}
