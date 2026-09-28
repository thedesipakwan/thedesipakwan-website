import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";

export function razorpayClient() {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured (.env.local)");
  }
  return new Razorpay({ key_id, key_secret });
}

/** True when running on Razorpay test keys — test payments are not real money. */
export function isTestMode(): boolean {
  return !(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "").startsWith("rzp_live_");
}

function safeEqualHex(expectedHex: string, actualHex: string): boolean {
  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(actualHex, "hex");
  if (expected.length !== actual.length || expected.length === 0) return false;
  return crypto.timingSafeEqual(expected, actual);
}

/** Verifies the signature returned by Razorpay Checkout after payment. */
export function verifyCheckoutSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, params.signature);
}

/** Verifies the x-razorpay-signature header on a webhook raw body. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

/**
 * Serializes cart items with the unit price charged, e.g.
 * "TK-GUR-400x2@379|CH-CLA-200x1@190", so the webhook knows exactly what
 * the customer paid for even if prices change later.
 */
export function itemsToNotes(items: { sku: string; qty: number; price: number }[]): string {
  return items.map((i) => `${i.sku}x${i.qty}@${i.price}`).join("|");
}

/** Parses the notes string back into items (older orders have no "@price"). */
export function notesToItems(notes: string): { sku: string; qty: number; price?: number }[] {
  return notes
    .split("|")
    .filter(Boolean)
    .map((part) => {
      const [skuQty, priceStr] = part.split("@");
      const at = skuQty.lastIndexOf("x");
      const price = priceStr === undefined ? undefined : Number(priceStr);
      return {
        sku: skuQty.slice(0, at),
        qty: Number(skuQty.slice(at + 1)),
        price: Number.isFinite(price) ? price : undefined,
      };
    });
}
