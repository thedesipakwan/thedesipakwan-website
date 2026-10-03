"use client";

import { formatINR } from "@/lib/pricing";

/** Subtotal + shipping summary (shipping is always free). */
export default function CartSummary({
  subtotal,
  shipping,
  total,
  light = false,
}: {
  subtotal: number;
  shipping: number;
  total: number;
  /** light = cart page on pista; default dark = drawer/checkout */
  light?: boolean;
}) {
  const muted = light ? "text-paan-700/70" : "text-pista-100/70";
  return (
    <div>
      <dl className={`space-y-1.5 text-[15px] ${light ? "text-paan-900" : ""}`}>
        <div className="flex justify-between">
          <dt className={muted}>Subtotal</dt>
          <dd className="font-bold tabular-nums">{formatINR(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className={muted}>Shipping</dt>
          <dd className={`font-bold tabular-nums ${shipping === 0 ? (light ? "text-mehndi-600" : "text-mehndi-300") : ""}`}>
            {shipping === 0 ? "Free" : formatINR(shipping)}
          </dd>
        </div>
        <div className={`flex justify-between border-t pt-2 text-[17px] ${light ? "border-paan-900/10" : "border-pista-100/15"}`}>
          <dt className="font-bold">Total</dt>
          <dd className={`font-bold tabular-nums ${light ? "text-sindoor-600" : "text-kesariya-500"}`}>{formatINR(total)}</dd>
        </div>
      </dl>
      <p className={`mt-1 text-[12px] ${light ? "text-paan-700/50" : "text-pista-100/50"}`}>Inclusive of all taxes</p>
    </div>
  );
}
