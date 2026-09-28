"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Scroll-scrubbed canvas image sequence. Loads frames lazily when the
 * section approaches, decodes off-thread via createImageBitmap, and draws
 * the frame matching scroll progress. 60 frames desktop / 40 mobile.
 */
export default function ScrollSequence({
  framePath, // e.g. "/images/sequence/thekua-press-###.webp"
  totalFrames = 60,
  captions = [],
  className = "",
}: {
  framePath: string;
  totalFrames?: number;
  captions?: string[];
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCaption, setActiveCaption] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduced = prefersReducedMotion();
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const frameCount = reduced ? 1 : isMobile ? Math.min(40, totalFrames) : totalFrames;
    const frames: (ImageBitmap | HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    let loaded = false;
    let currentFrame = 0;
    let disposed = false;

    const src = (i: number) => {
      // map 0..frameCount-1 onto the full 0..totalFrames-1 range
      const real = Math.round((i / Math.max(1, frameCount - 1)) * (totalFrames - 1));
      return framePath.replace("###", String(real).padStart(3, "0"));
    };

    const ctx = canvas.getContext("2d");

    const draw = (i: number) => {
      const img = frames[Math.min(frameCount - 1, Math.max(0, i))];
      if (!img || !ctx) return;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      // cover-fit
      const iw = img.width;
      const ih = img.height;
      const scale = Math.max(width / iw, height / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
    };

    const sizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      draw(currentFrame);
    };

    const loadFrames = async () => {
      if (loaded) return;
      loaded = true;
      await Promise.all(
        Array.from({ length: frameCount }, async (_, i) => {
          try {
            const res = await fetch(src(i));
            const blob = await res.blob();
            frames[i] = await createImageBitmap(blob);
          } catch {
            const img = new window.Image();
            img.src = src(i);
            await img.decode().catch(() => undefined);
            frames[i] = img;
          }
        })
      );
      if (!disposed) {
        sizeCanvas();
        draw(currentFrame);
      }
    };

    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    // Preload when the section approaches
    const preload = ScrollTrigger.create({
      trigger: wrap,
      start: "top 150%",
      once: true,
      onEnter: () => void loadFrames(),
    });

    let scrub: ScrollTrigger | undefined;
    if (!reduced) {
      const proxy = { frame: 0 };
      const tween = gsap.to(proxy, {
        frame: frameCount - 1,
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "+=2400",
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            if (captions.length) {
              setActiveCaption(
                Math.min(captions.length - 1, Math.floor(self.progress * captions.length))
              );
            }
          },
        },
        onUpdate: () => {
          const f = Math.round(proxy.frame);
          if (f !== currentFrame) {
            currentFrame = f;
            draw(f);
          }
        },
      });
      scrub = tween.scrollTrigger ?? undefined;
    } else {
      void loadFrames();
    }

    return () => {
      disposed = true;
      window.removeEventListener("resize", sizeCanvas);
      preload.kill();
      scrub?.kill();
      frames.forEach((f) => f instanceof ImageBitmap && f.close());
    };
  }, [framePath, totalFrames, captions.length]);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
      {captions.length ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center px-6">
          <p
            key={activeCaption}
            className="font-display animate-toast-in rounded-full bg-paan-900/70 px-6 py-3 text-center text-[clamp(20px,3vw,28px)] font-bold text-kesariya-500 backdrop-blur-sm"
            aria-live="polite"
          >
            {captions[activeCaption]}
          </p>
        </div>
      ) : null}
    </div>
  );
}
