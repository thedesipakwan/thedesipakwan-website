"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Product } from "@/data/products";
import { Badge, Rating } from "@/components/ui/Badge";
import AddToCart from "./AddToCart";
import { formatINR } from "@/lib/pricing";
import { gsap, isDesktop, prefersReducedMotion } from "@/lib/gsap";

// Green top border marks bestsellers; every other card gets the warm orange.
function topBorder(product: Product) {
  return product.badges?.includes("bestseller")
    ? "border-t-mehndi-600"
    : "border-t-kesariya-500";
}

export default function ProductCard({ product }: { product: Product }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const first = product.variants[0];
  const fromPrice = Math.min(...product.variants.map((v) => v.price));

  // Cursor tilt (max 6°), desktop only
  const onMove = (e: React.MouseEvent) => {
    if (!isDesktop() || prefersReducedMotion()) return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, {
      rotateY: px * 6,
      rotateX: -py * 6,
      transformPerspective: 700,
      duration: 0.4,
      ease: "power2.out",
    });
  };
  const onLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power3.out" });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`product-card group relative flex h-full flex-col overflow-hidden rounded-[28px] border-t-[3px] bg-white/60 shadow-[var(--shadow-light)] ${topBorder(product)}`}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden"
        aria-label={`View ${product.name}`}
      >
        <div ref={imgWrapRef} className="absolute inset-0">
          <Image
            src={product.images[0]}
            alt={`${product.name} — pack shot`}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className={`object-cover transition-all duration-500 ${
              product.images[1] ? "group-hover:opacity-0" : "group-hover:scale-105"
            }`}
          />
          {product.images[1] ? (
            <Image
              src={product.images[1]}
              alt={`${product.name} — second view`}
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : null}
        </div>
        {product.badges?.length ? (
          <div className="absolute left-3 top-3 flex gap-1.5">
            {product.badges.map((b) => (
              <Badge key={b} kind={b} />
            ))}
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.slug}`} className="hover:underline underline-offset-4">
            <h3 className="font-display text-[24px] font-bold leading-tight text-paan-900">
              {product.name}
            </h3>
          </Link>
          {product.rating ? <Rating value={product.rating} className="mt-1 shrink-0 text-paan-900" /> : null}
        </div>
        <p className="text-[14px] text-paan-700/80">{product.tagline}</p>

        {product.variants.length > 1 ? (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {product.variants.map((v) => (
              <span
                key={v.sku}
                className="rounded-full border border-paan-900/15 px-2.5 py-0.5 text-[12px] font-bold text-paan-700"
              >
                {v.label}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {["Desi ghee", "No maida", "No palm oil", "No preservatives", "Made fresh"].map((t) => (
              <span
                key={t}
                className="whitespace-nowrap rounded-full bg-mehndi-600/10 px-2 py-0.5 text-[11px] font-bold text-mehndi-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <p className="text-[17px] font-bold text-paan-900 tabular-nums">
            {first.compareAt && product.variants.length === 1 ? (
              <>
                <span className="block text-[12px] font-bold text-mehndi-600">
                  Save {formatINR(first.compareAt - first.price)}
                </span>
                {formatINR(first.price)}
                <span className="ml-1.5 text-[13px] font-medium text-paan-700/50 line-through">
                  {formatINR(first.compareAt)}
                </span>
              </>
            ) : product.variants.length > 1 ? (
              `from ${formatINR(fromPrice)}`
            ) : (
              <>
                {formatINR(fromPrice)}
                <span className="ml-1.5 text-[13px] font-medium text-paan-700/60">
                  · {first.label}
                </span>
              </>
            )}
          </p>
          <AddToCart
            sku={first.sku}
            productName={product.name}
            imageRef={imgWrapRef}
            size="md"
          />
        </div>
      </div>
    </div>
  );
}
