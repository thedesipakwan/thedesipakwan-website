"use client";

import type { Variant } from "@/data/products";

export default function VariantPicker({
  variants,
  selected,
  onSelect,
}: {
  variants: Variant[];
  selected: Variant;
  onSelect: (v: Variant) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Pack size">
      {variants.map((v) => {
        const active = v.sku === selected.sku;
        return (
          <button
            key={v.sku}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={!v.inStock}
            onClick={() => onSelect(v)}
            className={`h-11 rounded-full border-2 px-5 text-[15px] font-bold transition-colors ${
              active
                ? "border-paan-900 bg-paan-900 text-kesariya-500"
                : "border-paan-900/25 text-paan-900 hover:border-paan-900"
            } disabled:opacity-40 disabled:line-through`}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
