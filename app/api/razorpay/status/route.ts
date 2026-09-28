import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { razorpayClient } from "@/lib/razorpay";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "no-store" };

/**
 * GET /api/razorpay/status?order=order_xxx
 * Asks Razorpay whether an order is fully paid, so the success page never
 * shows "Order placed" for an unpaid or made-up order id. Returns no
 * customer details.
 */
export async function GET(req: Request) {
  if (!rateLimit(`status:${clientIp(req)}`, 30, 60_000)) {
    return NextResponse.json({ paid: false }, { status: 429, headers: noStore });
  }
  const orderId = new URL(req.url).searchParams.get("order") ?? "";
  if (!/^order_[A-Za-z0-9]{6,40}$/.test(orderId)) {
    return NextResponse.json({ paid: false }, { status: 400, headers: noStore });
  }
  try {
    const order = await razorpayClient().orders.fetch(orderId);
    const paid = order.status === "paid" && Number(order.amount_paid) >= Number(order.amount);
    return NextResponse.json(
      { paid, amount: paid ? Number(order.amount) / 100 : undefined },
      { headers: noStore }
    );
  } catch {
    return NextResponse.json({ paid: false }, { status: 404, headers: noStore });
  }
}
