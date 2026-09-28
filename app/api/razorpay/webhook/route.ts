import { NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email";
import { cartFromPaidItems } from "@/lib/pricing";
import { isTestMode, notesToItems, razorpayClient, verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

/** An order paid more than this long after it was created gets flagged. */
const STALE_ORDER_MS = 2 * 60 * 60 * 1000;

/** Tells Razorpay to deliver the event again later (it retries on non-2xx). */
const retryLater = (reason: string) => NextResponse.json({ ok: false, retry: reason }, { status: 503 });

/**
 * Razorpay webhook — register for the `payment.captured` event.
 * Order emails are sent ONLY from here, and only after the payment is
 * re-checked with Razorpay's API (captured, belongs to this order, full
 * amount). Emails fire even if the customer closes the tab.
 *
 * Temporary failures (Razorpay/Resend unreachable) return 503 so Razorpay
 * retries — a paid order must never go unreported. Resend idempotency keys
 * stop retries from sending duplicates.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true, skipped: "bad-json" });
  }
  if (event?.event !== "payment.captured") {
    return NextResponse.json({ ok: true, skipped: event?.event });
  }

  const orderId: string | undefined = event.payload?.payment?.entity?.order_id;
  const paymentId: string | undefined = event.payload?.payment?.entity?.id;
  if (!orderId || !paymentId) {
    console.error("Webhook payload missing order/payment id");
    return NextResponse.json({ ok: true });
  }

  const razorpay = razorpayClient();

  // Re-check the payment straight from Razorpay rather than trusting the payload.
  let payment, order;
  try {
    [payment, order] = await Promise.all([
      razorpay.payments.fetch(paymentId),
      razorpay.orders.fetch(orderId),
    ]);
  } catch (err) {
    console.error("Could not fetch payment/order from Razorpay — asking for retry", orderId, err);
    return retryLater("razorpay-fetch");
  }

  const paid = Number(payment.amount);
  const expected = Number(order.amount);
  if (
    payment.status !== "captured" ||
    payment.order_id !== orderId ||
    payment.currency !== "INR" ||
    paid !== expected
  ) {
    console.error("Payment check failed — no order email sent", {
      orderId,
      paymentId,
      status: payment.status,
      paid,
      expected,
    });
    return NextResponse.json({ ok: true, skipped: "payment-check-failed" });
  }

  const notes = (order.notes ?? {}) as Record<string, string>;
  if (!notes.items) {
    // Not an order created by this website (e.g. another app on the same account).
    return NextResponse.json({ ok: true, skipped: "not-our-order" });
  }

  // Razorpay may deliver the same event more than once — email only once.
  if (notes.emailed === "yes") {
    return NextResponse.json({ ok: true, skipped: "already-emailed" });
  }

  // Rebuild the order from the prices recorded at checkout — that is what was paid.
  const { cart, priceChanged } = cartFromPaidItems(notesToItems(notes.items), Number(notes.shipping ?? 0));

  const alerts: string[] = [];
  if (cart.total * 100 !== paid) {
    alerts.push(`Items add up to ₹${cart.total} but ₹${paid / 100} was paid.`);
  }
  if (priceChanged.length) {
    alerts.push(`Paid at older prices — today's price differs for: ${priceChanged.join(", ")}.`);
  }
  const ageMs = Number(payment.created_at) * 1000 - Number(order.created_at) * 1000;
  if (ageMs > STALE_ORDER_MS) {
    alerts.push(`Checkout was started ${Math.round(ageMs / 3_600_000)} hours before payment (an old order link was reused).`);
  }

  const { ownerSent } = await sendOrderEmails(
    {
      orderId,
      paymentId,
      cart,
      paidAmount: paid / 100,
      placedAt: new Date(Number(payment.created_at) * 1000),
      testMode: isTestMode(),
      alerts,
      customer: {
        name: notes.name ?? "Customer",
        phone: notes.phone ?? "",
        email: notes.email ?? "",
        address: notes.address ?? "",
        note: notes.note || undefined,
      },
    },
    { sendCustomer: alerts.length === 0, city: notes.city ?? "" }
  );

  // Owner must hear about every paid order — if that email failed, retry later.
  if (!ownerSent) return retryLater("owner-email");

  // Mark the order so retries are ignored (notes are replaced wholesale).
  await razorpay.orders
    .edit(orderId, { notes: { ...notes, emailed: "yes" } })
    .catch((err) => console.error("Could not mark order as emailed", orderId, err));

  return NextResponse.json({ ok: true });
}
