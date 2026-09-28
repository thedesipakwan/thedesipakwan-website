"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart, cartTotals } from "@/lib/cart";
import CartLine from "./CartLine";
import CartSummary from "./CartSummary";
import ChakliSpiral from "@/components/svg/ChakliSpiral";

export default function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const close = useCart((s) => s.closeDrawer);
  const lines = useCart((s) => s.lines);
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock scroll + focus trap while open
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          "button, a[href], input, [tabindex]:not([tabindex='-1'])"
        ) ?? []
      );
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const { detailed, subtotal, shipping, total, count } = cartTotals(lines);

  return (
    <div
      className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-paan-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* panel: right drawer on desktop, bottom sheet on mobile */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        data-lenis-prevent
        className={`absolute flex flex-col bg-paan-900 shadow-[var(--shadow-dark)] transition-transform duration-300 ease-out
          inset-x-0 bottom-0 max-h-[85dvh] rounded-t-[28px]
          md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[440px] md:rounded-none
          ${open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full md:translate-y-0"}`}
      >
        <div className="flex items-center justify-between border-b border-pista-100/10 px-6 py-4">
          <h2 className="font-display text-[22px] font-bold text-pista-100">
            Your cart {count > 0 ? <span className="text-kesariya-500">({count})</span> : null}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="flex h-10 w-10 items-center justify-center rounded-full text-pista-100/70 hover:text-kesariya-500"
          >
            ✕
          </button>
        </div>

        {detailed.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <ChakliSpiral className="h-16 w-16 text-kesariya-500/40" strokeWidth={6} />
            <p className="text-pista-100/70">Nothing in here yet. That&apos;s fixable.</p>
            <Link
              href="/shop"
              onClick={close}
              className="rounded-full bg-sindoor-600 px-6 py-3 font-bold text-pista-100 hover:scale-[1.03] transition-transform"
            >
              Shop the crunch
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {detailed.map((line) => (
                <CartLine
                  key={line.sku}
                  product={line.product}
                  variant={line.variant}
                  qty={line.qty}
                />
              ))}
            </div>
            <div className="border-t border-pista-100/10 px-6 py-5">
              <CartSummary subtotal={subtotal} shipping={shipping} total={total} />
              <Link
                href="/checkout"
                onClick={close}
                className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-sindoor-600 text-[17px] font-bold text-pista-100 transition-transform hover:scale-[1.02] active:scale-[0.97]"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
