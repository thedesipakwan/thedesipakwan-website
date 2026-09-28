"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart, cartTotals } from "@/lib/cart";
import { formatINR } from "@/lib/pricing";
import { site, waLink } from "@/data/site";
import ChakliSpiral, { CHAKLI_PATH } from "@/components/svg/ChakliSpiral";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Snapshot = ReturnType<typeof cartTotals>;
type Status = "checking" | "paid" | "unpaid";

// Banks can take a few seconds to confirm, so re-check a handful of times.
const CHECKS = 6;
const CHECK_GAP_MS = 2500;

export default function SuccessClient() {
  const params = useSearchParams();
  const rawOrder = params.get("order") ?? "";
  // Ignore anything that isn't a real Razorpay order id (no spoofed text on screen).
  const orderId = /^order_[A-Za-z0-9]{6,40}$/.test(rawOrder) ? rawOrder : "";
  const clear = useCart((s) => s.clear);
  const [status, setStatus] = useState<Status>("checking");
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const spiralRef = useRef<SVGPathElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Only a Razorpay-confirmed payment counts — the URL alone proves nothing.
  useEffect(() => {
    if (!orderId) {
      setStatus("unpaid");
      return;
    }
    let cancelled = false;
    (async () => {
      for (let i = 0; i < CHECKS && !cancelled; i++) {
        try {
          const res = await fetch(`/api/razorpay/status?order=${encodeURIComponent(orderId)}`, {
            cache: "no-store",
          });
          const data = await res.json();
          if (data.paid) {
            if (cancelled) return;
            setPaidAmount(typeof data.amount === "number" ? data.amount : null);
            // Only treat the cart as "this order" if this browser created it —
            // a link to someone else's paid order must not clear your cart.
            let ours = false;
            try {
              ours = sessionStorage.getItem("tdp-last-order") === orderId;
            } catch {
              /* storage blocked */
            }
            if (ours) {
              setSnapshot(cartTotals(useCart.getState().lines));
              clear();
              try {
                sessionStorage.removeItem("tdp-last-order");
              } catch {
                /* ignore */
              }
            }
            setStatus("paid");
            return;
          }
        } catch {
          /* network blip — try again */
        }
        await new Promise((r) => setTimeout(r, CHECK_GAP_MS));
      }
      if (!cancelled) setStatus("unpaid");
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, clear]);

  // Draw the chakli spiral, then reveal the content (paid state only).
  useEffect(() => {
    if (status !== "paid") return;
    const path = spiralRef.current;
    const content = contentRef.current;
    if (!path || !content) return;
    if (prefersReducedMotion()) {
      gsap.set(content, { opacity: 1 });
      return;
    }
    const len = path.getTotalLength();
    const tl = gsap.timeline();
    tl.fromTo(
      path,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }
    ).fromTo(content, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.3");
    return () => {
      tl.kill();
    };
  }, [status]);

  const whatsapp = waLink(`Hi Desi Pakwan, order ${orderId}`);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paan-900 px-6 py-36 text-center">
        <ChakliSpiral className="animate-spin-slow h-16 w-16 text-kesariya-500" strokeWidth={6} />
        <p className="font-display text-[28px] font-black text-pista-100">Confirming your payment…</p>
        <p className="max-w-sm text-[15px] text-pista-100/60">
          This takes a few seconds. Please don&apos;t close this page or pay again.
        </p>
      </div>
    );
  }

  if (status === "unpaid") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-paan-900 px-6 py-36 text-center">
        <p className="font-display max-w-xl text-[clamp(30px,4vw,44px)] font-black leading-tight text-kesariya-500">
          We couldn&apos;t confirm this payment yet.
        </p>
        <p className="max-w-md text-[16px] leading-relaxed text-pista-100/70">
          If money was deducted, don&apos;t worry — once your bank confirms it you&apos;ll get a
          confirmation email, and if it fails the bank refunds it automatically. Please don&apos;t pay
          again. Message us with your order ID and we&apos;ll check right away.
        </p>
        {orderId ? (
          <p className="text-[14px] text-pista-100/50">
            Order ID: <span className="font-bold text-pista-100/80">{orderId}</span>
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center rounded-full bg-mehndi-600 px-8 text-[17px] font-bold text-white transition-transform hover:scale-[1.03]"
          >
            Message us on WhatsApp
          </a>
          <Link
            href="/cart"
            className="inline-flex h-14 items-center rounded-full border-2 border-kesariya-500 px-8 text-[17px] font-bold text-kesariya-500 transition-colors hover:bg-kesariya-500 hover:text-paan-900"
          >
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paan-900 px-6 py-36 text-center">
      <svg viewBox="0 0 100 100" className="h-28 w-28 text-kesariya-500" fill="none" aria-hidden>
        <path ref={spiralRef} d={CHAKLI_PATH} stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>

      <div ref={contentRef} style={{ opacity: 0 }}>
        <h1 className="font-display mt-8 text-[clamp(36px,5vw,56px)] font-black leading-[1.05] text-kesariya-500">
          Order placed.
          <br />
          The kitchen has your name.
        </h1>

        <p className="mt-4 text-[15px] text-pista-100/70">
          Order ID: <span className="font-bold text-pista-100">{orderId}</span>
        </p>

        {snapshot && snapshot.detailed.length > 0 ? (
          <div className="mx-auto mt-8 w-full max-w-md rounded-[28px] bg-paan-700 p-6 text-left">
            <ul className="space-y-2 border-b border-pista-100/10 pb-4">
              {snapshot.detailed.map((l) => (
                <li key={l.sku} className="flex justify-between gap-3 text-[15px] text-pista-100/85">
                  <span>
                    {l.product.name} · {l.variant.label} × {l.qty}
                  </span>
                  <span className="font-bold tabular-nums">{formatINR(l.variant.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between pt-3 text-[17px] font-bold text-pista-100">
              <span>Total paid</span>
              <span className="text-kesariya-500 tabular-nums">
                {formatINR(paidAmount ?? snapshot.total)}
              </span>
            </div>
          </div>
        ) : null}

        <p className="mx-auto mt-6 max-w-md text-[16px] text-pista-100/70">
          Made fresh after your order — dispatched in {site.shipping.dispatchDays}, at your door in{" "}
          {site.shipping.deliveryDays} after that. Confirmation email on its way.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center rounded-full bg-mehndi-600 px-8 text-[17px] font-bold text-white transition-transform hover:scale-[1.03]"
          >
            Message us on WhatsApp
          </a>
          <Link
            href="/shop"
            className="inline-flex h-14 items-center rounded-full border-2 border-kesariya-500 px-8 text-[17px] font-bold text-kesariya-500 transition-colors hover:bg-kesariya-500 hover:text-paan-900"
          >
            Keep shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
