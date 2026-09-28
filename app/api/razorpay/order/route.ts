import { NextResponse } from "next/server";
import { z } from "zod";
import { INDIAN_STATES } from "@/data/states";
import { mergeItems, priceCart } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { itemsToNotes, razorpayClient } from "@/lib/razorpay";

export const runtime = "nodejs";

// No control characters (newlines, tabs, etc.) in anything a customer types —
// these fields end up in email subjects and bodies.
const noControl = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((s) => !/[\u0000-\u001F\u007F]/.test(s), "Please remove special characters");

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        sku: z.string().regex(/^[A-Z0-9-]{3,32}$/),
        qty: z.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(20),
  customer: z.object({
    name: noControl(80).pipe(z.string().min(2, "Tell us your name")),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number"),
    email: z.string().trim().email("Enter a valid email").max(120),
    line1: noControl(120).pipe(z.string().min(3, "Address is required")),
    line2: noControl(120).optional().default(""),
    city: noControl(60).pipe(z.string().min(2, "City is required")),
    state: z.string().refine((s) => INDIAN_STATES.includes(s), "Pick a state"),
    pin: z.string().regex(/^\d{6}$/, "PIN must be 6 digits"),
    note: noControl(200).optional().default(""),
  }),
});

export async function POST(req: Request) {
  // Blunt scripted floods of fake orders (each one is a Razorpay API call).
  if (!rateLimit(`order:${clientIp(req)}`, 8, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute and try again." }, { status: 429 });
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { customer } = parsed.data;
  const items = mergeItems(parsed.data.items);

  // Amounts always recomputed from the catalogue — client prices are ignored.
  let cart;
  try {
    cart = priceCart(items);
  } catch {
    return NextResponse.json(
      { error: "Some items in your cart are no longer available. Please refresh your cart." },
      { status: 400 }
    );
  }

  const itemsNote = itemsToNotes(cart.lines.map((l) => ({ sku: l.sku, qty: l.qty, price: l.unitPrice })));
  // Razorpay notes are capped at 256 characters — refuse rather than cut items off.
  if (itemsNote.length > 256) {
    return NextResponse.json({ error: "Your cart is too large for one order. Please split it." }, { status: 400 });
  }

  const address = [customer.line1, customer.line2, customer.city, customer.state, customer.pin]
    .filter(Boolean)
    .join(", ")
    .slice(0, 256);

  try {
    const razorpay = razorpayClient();
    const order = await razorpay.orders.create({
      amount: cart.total * 100, // paise
      currency: "INR",
      receipt: `tdp_${Date.now()}`,
      notes: {
        items: itemsNote,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address,
        city: customer.city,
        note: customer.note,
        shipping: String(cart.shipping),
        total: String(cart.total),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: cart.total * 100,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order creation failed", err);
    return NextResponse.json(
      { error: "Could not start the payment. Please try again." },
      { status: 502 }
    );
  }
}
