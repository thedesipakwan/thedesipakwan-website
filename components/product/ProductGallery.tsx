"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Product } from "@/data/products";
import { isDesktop } from "@/lib/gsap";
import { Badge } from "@/components/ui/Badge";
import { MouldStamp } from "@/components/svg/MouldPattern";

export default function ProductGallery({
  product,
  imageRef,
}: {
  product: Product;
  imageRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const alts = [`${product.name} — pack shot`, `${product.name} — second view`];

  const onMove = (e: React.MouseEvent) => {
    if (!isDesktop()) return;
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div className="relative">
      {/* slowly rotating mould behind the photo */}
      <div
        aria-hidden
        className="animate-spin-very-slow pointer-events-none absolute -left-16 -top-16 text-kesariya-500 opacity-[0.12]"
      >
        <MouldStamp className="h-72 w-72" />
      </div>

      <div
        ref={wrapRef}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-[32px] bg-pista-200 shadow-[0_30px_70px_rgba(6,28,19,0.18)]"
      >
        <div ref={imageRef} className="absolute inset-0">
          {product.images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={alts[i] ?? product.name}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 580px"
              className={`object-cover transition-[opacity,transform] duration-300 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              style={
                zoom && i === index
                  ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                  : undefined
              }
            />
          ))}
        </div>

        {product.badges?.length ? (
          <div className="absolute left-5 top-5 flex gap-2">
            {product.badges.map((b) => (
              <Badge key={b} kind={b} />
            ))}
          </div>
        ) : null}

        <span
          className={`absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-paan-900/85 px-4 py-2 text-[13px] font-bold text-pista-100 backdrop-blur-md transition-opacity duration-300 ${
            zoom ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mehndi-300 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mehndi-300" />
          </span>
          Made fresh after you order
        </span>
      </div>

      {product.images.length < 2 ? null : (
        <div className="mt-4 flex gap-3">
          {product.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition-all ${
                i === index ? "border-kesariya-500" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
