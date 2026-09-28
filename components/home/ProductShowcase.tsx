"use client";

import { useRef, useState } from "react";
import { singleProducts, type Family } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import { Pill } from "@/components/ui/Pill";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Filter = "all" | Family;

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "thekua", label: "Thekua" },
  { key: "chakli", label: "Chakli" },
  { key: "namkeen", label: "Namkeen" },
];

export default function ProductShowcase() {
  const ref = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".showcase-title", {
        x: -80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
      });
      gsap.from(".product-card", {
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: gridRef.current, start: "top 80%", once: true },
      });
    },
    { scope: ref }
  );

  const applyFilter = (next: Filter) => {
    if (next === filter) return;
    setFilter(next);
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) return;
    // simple, layout-safe reveal of the freshly filtered cards
    requestAnimationFrame(() => {
      gsap.fromTo(
        grid.querySelectorAll(".product-card"),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.06, overwrite: true }
      );
    });
  };

  const visible = singleProducts().filter((p) => filter === "all" || p.family === filter);

  return (
    <section ref={ref} className="grain bg-pista-100 py-20 md:py-32" aria-label="Products">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="showcase-title mb-10">
          <h2 className="font-display text-[clamp(34px,4.5vw,48px)] font-black leading-[1.05] text-paan-900">
            Pick your crunch
          </h2>
          <p className="mt-2 max-w-md text-[17px] text-paan-700/80">
            Sweet thekua, spicy chakli, and boxes that do both.
          </p>
        </div>

        <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter products">
          {filters.map((f) => (
            <Pill key={f.key} active={filter === f.key} onClick={() => applyFilter(f.key)}>
              {f.label}
            </Pill>
          ))}
        </div>

        <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((p) => (
            <div key={p.slug} className="showcase-item h-full">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
