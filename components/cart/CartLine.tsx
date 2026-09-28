"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product, Variant } from "@/data/products";
import { Stepper } from "@/components/ui/Stepper";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/pricing";

export default function CartLine({
  product,
  variant,
  qty,
  light = false,
}: {
  product: Product;
  variant: Variant;
  qty: number;
  /** light = cart page on pista; default dark = drawer */
  light?: boolean;
}) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const add = useCart((s) => s.add);
  const show = useToast((s) => s.show);

  const onRemove = () => {
    remove(variant.sku);
    show(`${product.name} removed`, {
      label: "Undo",
      onClick: () => add(variant.sku, qty),
    });
  };

  return (
    <div
      className={
        light
          ? "flex gap-5 rounded-[24px] border border-pista-200 bg-white/75 p-4 shadow-[0_12px_30px_rgba(6,28,19,0.06)] md:p-5"
          : "flex gap-4 border-b border-pista-100/10 py-4"
      }
    >
      <Link
        href={`/product/${product.slug}`}
        className={`relative shrink-0 overflow-hidden rounded-2xl ${light ? "h-24 w-24 bg-pista-200" : "h-20 w-20 bg-paan-700"}`}
      >
        <Image src={product.images[0]} alt={product.name} fill sizes="96px" className="object-cover" />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={light ? "font-display text-[20px] font-black text-paan-900" : "text-[15px] font-bold text-pista-100"}>{product.name}</p>
            <p className={`text-[13px] ${light ? "text-paan-700/60" : "text-pista-100/60"}`}>{variant.label}</p>
          </div>
          <p className={`font-bold tabular-nums ${light ? "text-[17px] text-paan-900" : "text-[15px] text-kesariya-500"}`}>
            {formatINR(variant.price * qty)}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Stepper value={qty} onChange={(n) => setQty(variant.sku, n)} onDark={!light} />
          <button
            type="button"
            onClick={onRemove}
            className={`text-[13px] font-bold underline-offset-2 hover:text-sindoor-600 hover:underline ${light ? "text-paan-700/50" : "text-pista-100/50"}`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
