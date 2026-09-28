import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCheckoutSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().regex(/^[0-9a-f]{64}$/i),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const valid = verifyCheckoutSignature({
    orderId: parsed.data.razorpay_order_id,
    paymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature,
  });

  if (!valid) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  return NextResponse.json({ valid: true });
}
