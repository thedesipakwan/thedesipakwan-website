"use client";

import { useEffect, useRef, useState } from "react";
import { amountToFreeShipping, formatINR } from "@/lib/pricing";
import { site } from "@/data/site";

/** Subtotal + shipping summary with the free-shipping progress bar and
 *  a small ghee-drop confetti burst the moment the threshold is crossed. */
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
  const away = amountToFreeShipping(subtotal);
  const progress = Math.min(1, subtotal / site.shipping.freeAbove);
  const wasFree = useRef(false);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    const isFree = away === 0 && subtotal > 0;
    if (isFree && !wasFree.current) setBurst((b) => b + 1);
    wasFree.current = isFree;
  }, [away, subtotal]);

  return (
    <div>
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-[13px] font-bold">
          {away > 0 ? (
            <span className={light ? "text-paan-900" : "text-pista-100/80"}>{formatINR(away)} away from free shipping</span>
          ) : (
            <span className={`relative ${light ? "text-mehndi-600" : "text-mehndi-300"}`}>
              Free shipping unlocked
              {burst > 0 ? <GheeBurst key={burst} /> : null}
            </span>
          )}
        </div>
        <div className={`h-1.5 overflow-hidden rounded-full ${light ? "bg-paan-900/10" : "bg-pista-100/15"}`}>
          <div
            className="h-full rounded-full bg-kesariya-500 transition-[width] duration-500 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

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

function GheeBurst() {
  return (
    <span aria-hidden className="pointer-events-none absolute -top-1 left-1/2">
      {Array.from({ length: 7 }).map((_, i) => {
        const dx = (i - 3) * 14;
        const dy = -30 - Math.abs(i - 3) * -6 - 20;
        return (
          <span
            key={i}
            className="animate-ghee-burst absolute block h-2 w-2 rounded-full bg-kesariya-500"
            style={{ "--dx": `${dx}px`, "--dy": `${dy}px`, animationDelay: `${i * 40}ms` } as React.CSSProperties}
          />
        );
      })}
    </span>
  );
}
