"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { findVariant } from "@/data/products";
import { shippingFor } from "@/lib/pricing";

export interface CartLine {
  sku: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  drawerOpen: boolean;
  /** Set briefly after add-to-cart so the cart icon can bounce. */
  lastAddedAt: number;
  add: (sku: string, qty?: number) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      drawerOpen: false,
      lastAddedAt: 0,
      add: (sku, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.sku === sku);
          const lines = existing
            ? state.lines.map((l) =>
                l.sku === sku ? { ...l, qty: Math.min(20, l.qty + qty) } : l
              )
            : [...state.lines, { sku, qty: Math.min(20, qty) }];
          return { lines, lastAddedAt: Date.now() };
        }),
      remove: (sku) =>
        set((state) => ({ lines: state.lines.filter((l) => l.sku !== sku) })),
      setQty: (sku, qty) =>
        set((state) => ({
          lines:
            qty < 1
              ? state.lines.filter((l) => l.sku !== sku)
              : state.lines.map((l) =>
                  l.sku === sku ? { ...l, qty: Math.min(20, qty) } : l
                ),
        })),
      clear: () => set({ lines: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "tdp-cart",
      partialize: (state) => ({ lines: state.lines }),
    }
  )
);

/** Derived totals for client display. Server recomputes independently. */
export function cartTotals(lines: CartLine[]) {
  let subtotal = 0;
  let count = 0;
  const detailed = lines.flatMap((line) => {
    const match = findVariant(line.sku);
    if (!match) return [];
    subtotal += match.variant.price * line.qty;
    count += line.qty;
    return [{ ...line, product: match.product, variant: match.variant }];
  });
  const shipping = subtotal > 0 ? shippingFor() : 0;
  return { detailed, subtotal, shipping, total: subtotal + shipping, count };
}
