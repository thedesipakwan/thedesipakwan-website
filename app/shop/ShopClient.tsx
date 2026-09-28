"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { products, type Product } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import { Pill } from "@/components/ui/Pill";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Filter = "all" | "thekua" | "chakli" | "namkeen" | "combo";
type Sort = "popular" | "price-asc" | "price-desc";

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "thekua", label: "Thekua" },
  { key: "chakli", label: "Chakli" },
  { key: "namkeen", label: "Namkeen" },
  { key: "combo", label: "Combos" },
];

function minPrice(p: Product) {
  return Math.min(...p.variants.map((v) => v.price));
}

const sortOptions: { key: Sort; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

/** Theme-styled replacement for the native <select>, whose option list
 *  can't be coloured. */
function SortDropdown({ value, onChange }: { value: Sort; onChange: (s: Sort) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = sortOptions.find((o) => o.key === value) ?? sortOptions[0];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border-2 border-paan-900/20 px-4 py-1.5 text-[14px] font-bold text-paan-900 transition-colors hover:border-paan-900"
      >
        {current.label}
        <svg
          viewBox="0 0 12 8"
          className={`h-2 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Sort products"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl bg-paan-900 py-1.5 shadow-[var(--shadow-dark)]"
        >
          {sortOptions.map((o) => (
            <li key={o.key}>
              <button
                type="button"
                role="option"
                aria-selected={o.key === value}
                onClick={() => {
                  onChange(o.key);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] font-bold transition-colors ${
                  o.key === value
                    ? "text-kesariya-500"
                    : "text-pista-100/85 hover:bg-paan-700 hover:text-kesariya-300"
                }`}
              >
                {o.label}
                {o.key === value ? <span aria-hidden>✓</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function ShopClient() {
  const params = useSearchParams();
  const initial = (params.get("filter") as Filter) ?? "all";
  const [filter, setFilter] = useState<Filter>(
    filters.some((f) => f.key === initial) ? initial : "all"
  );
  const [sort, setSort] = useState<Sort>("popular");
  const gridRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    let list = products.filter((p) => filter === "all" || p.family === filter);
    if (sort === "price-asc") list = [...list].sort((a, b) => minPrice(a) - minPrice(b));
    if (sort === "price-desc") list = [...list].sort((a, b) => minPrice(b) - minPrice(a));
    return list;
  }, [filter, sort]);

  const withFlip = (update: () => void) => {
    update();
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

  return (
    <div className="grain min-h-screen bg-pista-100 pb-24 pt-36">
      <div className="mx-auto max-w-[1280px] px-6">
        <h1 className="font-display text-[clamp(44px,6vw,72px)] font-black leading-none text-paan-900">
          Shop
        </h1>
        <p className="mt-3 max-w-md text-[17px] text-paan-700/80">
          Everything is made after you order and shipped in 2–3 working days.
        </p>

        <div className="sticky top-16 z-40 -mx-6 mt-8 border-b border-pista-200 bg-pista-100/90 px-6 py-3 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filter products">
              {filters.map((f) => (
                <Pill key={f.key} active={filter === f.key} onClick={() => withFlip(() => setFilter(f.key))}>
                  {f.label}
                </Pill>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[14px] font-bold text-paan-700">
              Sort
              <SortDropdown value={sort} onChange={(s) => withFlip(() => setSort(s))} />
            </div>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="py-24 text-center text-[18px] text-paan-700">
            Nothing here yet — the kitchen is working on it.
          </p>
        ) : (
          <div ref={gridRef} className="mt-10 grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {visible.map((p) => (
              <div key={p.slug} className="shop-item h-full">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
