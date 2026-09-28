import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Resend } from "resend";
import { site } from "@/data/site";
import OwnerNewOrder, { ownerNewOrderText, type OrderEmailData } from "@/emails/OwnerNewOrder";
import CustomerConfirmation, { customerConfirmationText } from "@/emails/CustomerConfirmation";
import { LOGO_CID } from "@/emails/EmailLayout";

// Logo is attached inline (cid:) so it shows even before the site is public.
let logoCache: string | null = null;
function logoAttachment() {
  if (!logoCache) {
    logoCache = readFileSync(path.join(process.cwd(), "public", "images", "email-logo.png")).toString("base64");
  }
  return { filename: "the-desi-pakwan.png", content: logoCache, contentId: LOGO_CID };
}

function resendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/**
 * Sends the order emails. Called only from the Razorpay webhook so emails
 * fire even if the customer closes the tab. Never throws; returns whether the
 * owner email was accepted so the webhook can ask Razorpay to retry.
 *
 * - `sendCustomer: false` (flagged orders) → only the owner hears about it.
 * - Test mode → the customer email only goes to OWNER_EMAIL, so test keys on a
 *   public site can't be used to send branded emails to strangers.
 */
export async function sendOrderEmails(
  data: OrderEmailData,
  { sendCustomer = true, city = "" }: { sendCustomer?: boolean; city?: string } = {}
): Promise<{ ownerSent: boolean }> {
  const resend = resendClient();
  if (!resend) {
    console.error("RESEND_API_KEY missing — order emails not sent", data.orderId);
    return { ownerSent: false };
  }

  const from = process.env.FROM_EMAIL ?? `The Desi Pakwan <${site.email}>`;
  const ownerEmail = process.env.OWNER_EMAIL ?? site.email;
  const supportWhatsapp = site.whatsapp;
  const withSite = { ...data, siteUrl: data.siteUrl ?? site.publicUrl };
  const attachments = [logoAttachment()];
  const prefix = `${data.testMode ? "[TEST — DO NOT SHIP] " : ""}${data.alerts?.length ? "[CHECK BEFORE SHIPPING] " : ""}`;

  // Idempotency keys tied to the order: if Razorpay delivers the same
  // notification twice (even simultaneously), Resend sends each email once.
  const owner = await resend.emails
    .send(
      {
        from,
        to: ownerEmail,
        subject: `${prefix}New order #${data.orderId} · ₹${data.paidAmount ?? data.cart.total} · ${data.customer.name}${city ? `, ${city}` : ""}`,
        react: OwnerNewOrder(withSite),
        text: ownerNewOrderText(withSite),
        attachments,
      },
      { idempotencyKey: `owner-order-${data.orderId}` }
    )
    .catch((err) => ({ data: null, error: err }));
  if (owner.error) console.error("Owner order email failed", data.orderId, owner.error);

  const customerAllowed =
    sendCustomer && (!data.testMode || data.customer.email.toLowerCase() === ownerEmail.toLowerCase());
  if (customerAllowed) {
    const customer = await resend.emails
      .send(
        {
          from,
          to: data.customer.email,
          // customer replies reach a real inbox, even while sending from Resend's test address
          replyTo: ownerEmail,
          subject: "Your Desi Pakwan order is confirmed 🟠",
          react: CustomerConfirmation({ ...withSite, supportWhatsapp }),
          text: customerConfirmationText({ ...withSite, supportWhatsapp }),
          attachments,
        },
        { idempotencyKey: `customer-order-${data.orderId}` }
      )
      .catch((err) => ({ data: null, error: err }));
    if (customer.error) console.error("Customer order email failed", data.orderId, customer.error);
  } else if (sendCustomer) {
    console.log("Test mode: customer email skipped (recipient is not OWNER_EMAIL)", data.orderId);
  }

  return { ownerSent: !owner.error };
}
