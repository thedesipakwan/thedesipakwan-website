import { Button, Hr, Link, Section, Text } from "@react-email/components";
import type { PricedCart } from "@/lib/pricing";
import { DetailRows, EmailLayout, c, formatAmount, formatDate } from "./EmailLayout";

export interface OrderEmailData {
  orderId: string;
  paymentId: string;
  cart: PricedCart;
  /** Amount Razorpay actually captured, in rupees (verified in the webhook). */
  paidAmount?: number;
  /** Payment was made with Razorpay test keys — not real money. */
  testMode?: boolean;
  /** Problems the owner must check before shipping (price changed, old order…). */
  alerts?: string[];
  /** When the payment was made. */
  placedAt?: Date;
  /** Public site URL, for links in the email. */
  siteUrl?: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    note?: string;
  };
}

const label = { color: c.muted, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "0 0 4px" };
const value = { color: c.paan, fontSize: "15px", lineHeight: "22px", margin: 0 };
const cell = { padding: "10px 0", borderBottom: `1px solid ${c.pistaDeep}`, color: c.paan, fontSize: "14px" };

export default function OwnerNewOrder({
  orderId,
  paymentId,
  cart,
  customer,
  paidAmount,
  testMode,
  alerts,
  placedAt,
  siteUrl = "https://thedesipakwan.com",
}: OrderEmailData) {
  const total = paidAmount ?? cart.total;
  const items = cart.lines.reduce((n, l) => n + l.qty, 0);
  const waText = encodeURIComponent(`Hi ${customer.name}, your Desi Pakwan order ${orderId} is confirmed and being prepared.`);

  return (
    <EmailLayout preview={`${testMode ? "[TEST] " : ""}New order ${formatAmount(total)} · ${customer.name}`} siteUrl={siteUrl}>
      {testMode ? (
        <Section style={{ backgroundColor: c.sindoor, padding: "12px 32px" }}>
          <Text style={{ color: c.white, fontSize: "14px", fontWeight: 700, margin: 0, textAlign: "center" }}>
            TEST PAYMENT — DO NOT SHIP · paid with Razorpay test keys, no real money received
          </Text>
        </Section>
      ) : null}

      {alerts?.length ? (
        <Section style={{ padding: "20px 32px 0" }}>
          <Section style={{ backgroundColor: "#FDECE6", border: `2px solid ${c.sindoor}`, borderRadius: "14px", padding: "14px 18px" }}>
            <Text style={{ color: c.sindoor, fontSize: "15px", fontWeight: 800, margin: "0 0 6px" }}>
              ⚠ Check before shipping
            </Text>
            {alerts.map((a) => (
              <Text key={a} style={{ color: c.paan, fontSize: "13px", lineHeight: "20px", margin: "0 0 4px" }}>
                • {a}
              </Text>
            ))}
            <Text style={{ color: c.muted, fontSize: "12px", lineHeight: "18px", margin: "8px 0 0" }}>
              The customer has NOT been sent a confirmation email. Ship it as paid, or refund it from the Razorpay dashboard.
            </Text>
          </Section>
        </Section>
      ) : null}

      {/* headline */}
      <Section style={{ padding: "28px 32px 8px" }}>
        <Text style={{ display: "inline-block", backgroundColor: "#E6F2EB", color: c.mehndi, fontSize: "12px", fontWeight: 700, padding: "6px 12px", borderRadius: "999px", margin: 0 }}>
          ✓ Paid &amp; verified with Razorpay
        </Text>
        <Text style={{ color: c.paan, fontSize: "26px", fontWeight: 800, lineHeight: "32px", margin: "14px 0 4px" }}>
          New order · {formatAmount(total)}
        </Text>
        <Text style={{ color: c.muted, fontSize: "14px", margin: 0 }}>
          {items} {items === 1 ? "item" : "items"} for {customer.name}
          {placedAt ? ` · ${formatDate(placedAt)}` : ""}
        </Text>
      </Section>

      {/* ship to */}
      <Section style={{ padding: "16px 32px 0" }}>
        <Section style={{ backgroundColor: c.pista, border: `1px solid ${c.pistaDeep}`, borderRadius: "16px", padding: "18px 20px" }}>
          <Text style={label}>Ship to</Text>
          <Text style={{ ...value, fontSize: "17px", fontWeight: 700 }}>{customer.name}</Text>
          <Text style={{ ...value, margin: "4px 0 12px" }}>{customer.address}</Text>
          <DetailRows
            rows={[
              {
                label: "Phone",
                value: (
                  <Link href={`tel:+91${customer.phone}`} style={{ color: c.sindoor }}>
                    +91 {customer.phone}
                  </Link>
                ),
              },
              {
                label: "Email",
                value: (
                  <Link href={`mailto:${customer.email}`} style={{ color: c.sindoor }}>
                    {customer.email.split("@")[0]}
                    <wbr />@{customer.email.split("@")[1]}
                  </Link>
                ),
              },
            ]}
          />
        </Section>
      </Section>

      {/* delivery note */}
      {customer.note ? (
        <Section style={{ padding: "12px 32px 0" }}>
          <Section style={{ backgroundColor: "#FFF4E8", borderLeft: `4px solid ${c.kesariya}`, borderRadius: "10px", padding: "12px 16px" }}>
            <Text style={label}>Delivery note from customer</Text>
            <Text style={{ ...value, fontStyle: "italic" }}>&ldquo;{customer.note}&rdquo;</Text>
          </Section>
        </Section>
      ) : null}

      {/* items */}
      <Section style={{ padding: "22px 32px 0" }}>
        <Text style={label}>Pack these</Text>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
          <tbody>
            {cart.lines.map((l) => (
              <tr key={l.sku}>
                <td style={cell}>
                  <strong>{l.name}</strong>
                  <br />
                  <span style={{ color: c.muted, fontSize: "12px" }}>{l.variantLabel}</span>
                </td>
                <td align="center" style={{ ...cell, fontWeight: 700, width: "60px" }}>× {l.qty}</td>
                <td align="right" style={{ ...cell, width: "90px" }}>{formatAmount(l.lineTotal)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} style={{ padding: "10px 0 2px", color: c.muted, fontSize: "14px" }}>Subtotal</td>
              <td align="right" style={{ padding: "10px 0 2px", color: c.paan, fontSize: "14px" }}>{formatAmount(cart.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: "2px 0", color: c.muted, fontSize: "14px" }}>Shipping</td>
              <td align="right" style={{ padding: "2px 0", color: c.paan, fontSize: "14px" }}>{cart.shipping === 0 ? "Free" : formatAmount(cart.shipping)}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: "8px 0 0", color: c.paan, fontSize: "16px", fontWeight: 800 }}>Total paid</td>
              <td align="right" style={{ padding: "8px 0 0", color: c.sindoor, fontSize: "18px", fontWeight: 800 }}>{formatAmount(total)}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* actions */}
      {/* two fixed columns keep the buttons side by side even on narrow phones */}
      <Section style={{ padding: "24px 32px 0" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td width="50%" style={{ paddingRight: "5px" }}>
                <Button
                  href={`https://wa.me/91${customer.phone}?text=${waText}`}
                  style={{ display: "block", textAlign: "center", backgroundColor: c.mehndi, color: c.white, border: `2px solid ${c.mehndi}`, padding: "12px 6px", borderRadius: "999px", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap" }}
                >
                  WhatsApp
                </Button>
              </td>
              <td width="50%" style={{ paddingLeft: "5px" }}>
                <Button
                  href={`tel:+91${customer.phone}`}
                  style={{ display: "block", textAlign: "center", backgroundColor: c.white, color: c.paan, border: `2px solid ${c.paan}`, padding: "12px 6px", borderRadius: "999px", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap" }}
                >
                  Call customer
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* checklist + references */}
      <Section style={{ padding: "24px 32px 28px" }}>
        <Hr style={{ borderColor: c.pistaDeep, margin: "0 0 16px" }} />
        <Text style={label}>Before you ship</Text>
        <Text style={{ ...value, fontSize: "13px", lineHeight: "21px", color: c.paanSoft }}>
          ☐ Write <strong>{orderId}</strong> on the parcel<br />
          ☐ Ship with a tracking number<br />
          ☐ Reply to this email with the courier &amp; AWB for your records
        </Text>
        <Text style={{ color: c.muted, fontSize: "12px", lineHeight: "18px", margin: "14px 0 0" }}>
          Order ID: {orderId}<br />
          Payment ID: {paymentId}
        </Text>
      </Section>
    </EmailLayout>
  );
}

export function ownerNewOrderText(d: OrderEmailData): string {
  const lines = d.cart.lines.map((l) => `- ${l.name} (${l.variantLabel}) x${l.qty} = ₹${l.lineTotal}`).join("\n");
  const total = d.paidAmount ?? d.cart.total;
  return [
    d.testMode ? "*** TEST PAYMENT — DO NOT SHIP (Razorpay test keys, no real money) ***\n" : "",
    d.alerts?.length ? `*** CHECK BEFORE SHIPPING ***\n${d.alerts.map((a) => `- ${a}`).join("\n")}\nThe customer has NOT been sent a confirmation email.\n` : "",
    `NEW ORDER · ₹${total} · Paid & verified with Razorpay`,
    d.placedAt ? formatDate(d.placedAt) : "",
    "",
    "SHIP TO",
    d.customer.name,
    d.customer.address,
    `Phone: +91 ${d.customer.phone}`,
    `Email: ${d.customer.email}`,
    d.customer.note ? `Delivery note: "${d.customer.note}"` : "",
    "",
    "PACK THESE",
    lines,
    `Subtotal: ₹${d.cart.subtotal}`,
    `Shipping: ${d.cart.shipping === 0 ? "Free" : `₹${d.cart.shipping}`}`,
    `Total paid: ₹${total}`,
    "",
    `Order ID: ${d.orderId}`,
    `Payment ID: ${d.paymentId}`,
  ]
    .filter((x) => x !== "")
    .join("\n");
}
