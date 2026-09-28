import { findVariant } from "@/data/products";
import { site } from "@/data/site";

export interface CartItemInput {
  sku: string;
  qty: number;
}

export interface PricedLine {
  sku: string;
  qty: number;
  name: string;
  variantLabel: string;
  unitPrice: number;
  lineTotal: number;
}

export interface PricedCart {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
}

/**
 * Recomputes the full cart from the canonical catalogue.
 * The server ALWAYS uses this — client-sent prices are never trusted.
 * Throws on unknown SKUs or invalid quantities.
 */
export function priceCart(items: CartItemInput[]): PricedCart {
  if (items.length === 0) throw new Error("Cart is empty");

  const lines: PricedLine[] = items.map(({ sku, qty }) => {
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
      throw new Error(`Invalid quantity for ${sku}`);
    }
    const match = findVariant(sku);
    if (!match) throw new Error(`Unknown SKU: ${sku}`);
    if (!match.variant.inStock) throw new Error(`Out of stock: ${sku}`);
    return {
      sku,
      qty,
      name: match.product.name,
      variantLabel: match.variant.label,
      unitPrice: match.variant.price,
      lineTotal: match.variant.price * qty,
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shipping = shippingFor(subtotal);
  return { lines, subtotal, shipping, total: subtotal + shipping };
}

/** Merges duplicate SKU lines (qty capped at 20) so limits apply per product. */
export function mergeItems(items: CartItemInput[]): CartItemInput[] {
  const merged = new Map<string, number>();
  for (const { sku, qty } of items) merged.set(sku, Math.min(20, (merged.get(sku) ?? 0) + qty));
  return [...merged].map(([sku, qty]) => ({ sku, qty }));
}

export interface PaidItem {
  sku: string;
  qty: number;
  /** Unit price (₹) at the moment the order was created, if recorded. */
  price?: number;
}

/**
 * Rebuilds a paid order from the prices recorded when the order was created —
 * that is what the customer was charged. Never throws for stock changes: the
 * money is already taken, so the owner must always hear about the order.
 * `priceChanged` lists items whose catalogue price differs today (or that no
 * longer exist).
 */
export function cartFromPaidItems(items: PaidItem[], shipping: number) {
  const priceChanged: string[] = [];
  const lines: PricedLine[] = items.map(({ sku, qty, price }) => {
    const match = findVariant(sku);
    const current = match?.variant.price;
    const unitPrice = price ?? current ?? 0;
    if (current === undefined || (price !== undefined && price !== current)) priceChanged.push(sku);
    return {
      sku,
      qty,
      name: match?.product.name ?? `Unknown product (${sku})`,
      variantLabel: match?.variant.label ?? "",
      unitPrice,
      lineTotal: unitPrice * qty,
    };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const cart: PricedCart = { lines, subtotal, shipping, total: subtotal + shipping };
  return { cart, priceChanged };
}

export function shippingFor(subtotal: number): number {
  return subtotal >= site.shipping.freeAbove ? 0 : site.shipping.flat;
}

export function amountToFreeShipping(subtotal: number): number {
  return Math.max(0, site.shipping.freeAbove - subtotal);
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
