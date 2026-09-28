"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, cartTotals } from "@/lib/cart";
import { singleProducts } from "@/data/products";
import CartLine from "@/components/cart/CartLine";
import CartSummary from "@/components/cart/CartSummary";
import AddToCart from "@/components/product/AddToCart";
import ChakliSpiral from "@/components/svg/ChakliSpiral";
import { MouldStamp } from "@/components/svg/MouldPattern";
import { formatINR } from "@/lib/pricing";

const promises = ["Made fresh after you order", "Breakage-safe packing", "Secure Razorpay checkout"];

export default function CartPageClient() {
  const lines = useCart((s) => s.lines);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { detailed, subtotal, shipping, total, count } = cartTotals(mounted ? lines : []);
  const inCart = new Set(detailed.map((l) => l.product.slug));
  const suggestions = singleProducts().filter((p) => !inCart.has(p.slug)).slice(0, 3);

  return (
    <div className="grain relative min-h-screen overflow-clip bg-pista-100 pb-24 pt-32">
      {/* faint rotating mould watermark */}
      <div
        aria-hidden
        className="animate-spin-very-slow pointer-events-none absolute -right-32 top-24 text-paan-900 opacity-[0.04]"
      >
        <MouldStamp className="h-[480px] w-[480px]" />
      </div>

      <div className="relative mx-auto max-w-[1180px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(44px,6vw,72px)] font-black leading-none text-paan-900">
              Your cart
            </h1>
            {detailed.length ? (
              <p className="mt-3 text-[16px] text-paan-700/70">
                {count} {count === 1 ? "item" : "items"}, made fresh the day you order.
              </p>
            ) : null}
          </div>
          {detailed.length ? (
            <Link href="/shop" className="text-[15px] font-bold text-sindoor-600 underline-offset-4 hover:underline">
              ← Continue shopping
            </Link>
          ) : null}
        </div>

        {detailed.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-5 rounded-[32px] border border-pista-200 bg-white/60 px-6 py-20 text-center">
            <ChakliSpiral className="animate-spin-slow h-20 w-20 text-kesariya-500" strokeWidth={6} />
            <p className="font-display text-[28px] font-black text-paan-900">Nothing in here yet.</p>
            <p className="text-[17px] text-paan-700/70">That&apos;s fixable — the kadhai is hot.</p>
            <Link
              href="/shop"
              className="mt-2 rounded-full bg-sindoor-600 px-8 py-3.5 text-[17px] font-bold text-pista-100 transition-transform hover:scale-[1.03]"
            >
              Shop the crunch
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* ---------- items ---------- */}
            <div className="space-y-4">
              {detailed.map((line) => (
                <CartLine key={line.sku} product={line.product} variant={line.variant} qty={line.qty} light />
              ))}

              <div className="flex flex-wrap gap-2 pt-2">
                {promises.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-mehndi-600/10 px-3 py-1.5 text-[12px] font-bold text-mehndi-600"
                  >
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>

            {/* ---------- summary ---------- */}
            <aside className="rounded-[28px] border border-pista-200 bg-white p-6 shadow-[0_24px_60px_rgba(6,28,19,0.10)] md:p-7 lg:sticky lg:top-28">
              <h2 className="font-display mb-5 text-[22px] font-black text-paan-900">Order summary</h2>
              <CartSummary subtotal={subtotal} shipping={shipping} total={total} light />
              <Link
                href="/checkout"
                className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-sindoor-600 text-[17px] font-bold text-pista-100 transition-transform hover:scale-[1.02] active:scale-[0.97]"
              >
                Checkout · {formatINR(total)}
              </Link>
              <p className="mt-3 text-center text-[12px] text-paan-700/55">
                UPI, cards & netbanking via Razorpay
              </p>
            </aside>
          </div>
        )}

        {/* ---------- suggestions ---------- */}
        {suggestions.length ? (
          <section className="mt-20" aria-label="You might also like">
            <h2 className="font-display text-[clamp(26px,3vw,36px)] font-black text-paan-900">
              {detailed.length ? "Complete your chai plate" : "Start with a favourite"}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((p) => {
                const v = p.variants[0];
                return (
                  <div
                    key={p.slug}
                    className="group flex items-center gap-4 rounded-[24px] border border-pista-200 bg-white/70 p-3 pr-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(6,28,19,0.10)]"
                  >
                    <Link href={`/product/${p.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-pista-200">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${p.slug}`} className="block font-bold leading-tight text-paan-900 hover:underline">
                        {p.name}
                      </Link>
                      <p className="text-[13px] text-paan-700/60">
                        {formatINR(v.price)} · {v.label}
                      </p>
                    </div>
                    <AddToCart sku={v.sku} productName={p.name} size="md" className="h-10! px-4! text-[14px]!" />
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
