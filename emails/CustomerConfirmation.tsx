import { Button, Column, Hr, Link, Row, Section, Text } from "@react-email/components";
import { findVariant } from "@/data/products";
import type { OrderEmailData } from "./OwnerNewOrder";
import { DetailRows, EmailLayout, c, formatAmount, formatDate } from "./EmailLayout";

type Props = OrderEmailData & { supportWhatsapp: string };

const label = { color: c.muted, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "0 0 4px" };
const cell = { padding: "10px 0", borderBottom: `1px solid ${c.pistaDeep}`, color: c.paan, fontSize: "14px" };

/** Shortest shelf life among the ordered products (combos already use their parts' minimum). */
function shelfLifeDays(skus: string[]) {
  const days = skus.map((s) => findVariant(s)?.product.shelfLifeDays).filter((d): d is number => typeof d === "number");
  return days.length ? Math.min(...days) : 30;
}

const steps = [
  { title: "Made fresh", copy: "Your order is kneaded, pressed and fried just for you." },
  { title: "Dispatched in 2–3 working days", copy: "Packed breakage-safe, with tracking shared on email & WhatsApp." },
  { title: "Delivered in 5–7 working days", copy: "7–10 working days in rural and remote areas." },
];

export default function CustomerConfirmation({
  orderId,
  cart,
  customer,
  paidAmount,
  placedAt,
  supportWhatsapp,
  siteUrl = "https://thedesipakwan.com",
}: Props) {
  const total = paidAmount ?? cart.total;
  const firstName = customer.name.split(" ")[0] || customer.name;
  const waLink = `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(`Hi Desi Pakwan, I have a question about order ${orderId}`)}`;
  const days = shelfLifeDays(cart.lines.map((l) => l.sku));

  return (
    <EmailLayout preview={`Thank you ${firstName}! Your order ${orderId} is confirmed.`} siteUrl={siteUrl}>
      {/* hero */}
      <Section style={{ padding: "32px 32px 8px", textAlign: "center" }}>
        <Text style={{ fontSize: "40px", lineHeight: "40px", margin: "0 0 8px" }}>🎉</Text>
        <Text style={{ color: c.paan, fontSize: "26px", fontWeight: 800, lineHeight: "32px", margin: "0 0 6px" }}>
          Thank you, {firstName}!
        </Text>
        <Text style={{ color: c.paanSoft, fontSize: "16px", lineHeight: "24px", margin: 0 }}>
          Your order is confirmed and the kitchen has your name.
        </Text>
      </Section>

      {/* order meta */}
      <Section style={{ padding: "20px 32px 0" }}>
        <Section style={{ backgroundColor: c.pista, border: `1px solid ${c.pistaDeep}`, borderRadius: "16px", padding: "10px 20px" }}>
          <DetailRows
            rows={[
              { label: "Order ID", value: orderId },
              placedAt ? { label: "Placed on", value: formatDate(placedAt) } : { label: "Status", value: "Paid" },
            ]}
          />
        </Section>
      </Section>

      {/* items */}
      <Section style={{ padding: "22px 32px 0" }}>
        <Text style={label}>Your order</Text>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
          <tbody>
            {cart.lines.map((l) => (
              <tr key={l.sku}>
                <td style={cell}>
                  <strong>{l.name}</strong>
                  <br />
                  <span style={{ color: c.muted, fontSize: "12px" }}>
                    {l.variantLabel} · Qty {l.qty}
                  </span>
                </td>
                <td align="right" style={{ ...cell, width: "90px" }}>{formatAmount(l.lineTotal)}</td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: "10px 0 2px", color: c.muted, fontSize: "14px" }}>Subtotal</td>
              <td align="right" style={{ padding: "10px 0 2px", color: c.paan, fontSize: "14px" }}>{formatAmount(cart.subtotal)}</td>
            </tr>
            <tr>
              <td style={{ padding: "2px 0", color: c.muted, fontSize: "14px" }}>Shipping</td>
              <td align="right" style={{ padding: "2px 0", color: cart.shipping === 0 ? c.mehndi : c.paan, fontSize: "14px", fontWeight: cart.shipping === 0 ? 700 : 400 }}>
                {cart.shipping === 0 ? "Free" : formatAmount(cart.shipping)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0 0", color: c.paan, fontSize: "16px", fontWeight: 800 }}>Total paid</td>
              <td align="right" style={{ padding: "8px 0 0", color: c.sindoor, fontSize: "18px", fontWeight: 800 }}>{formatAmount(total)}</td>
            </tr>
          </tbody>
        </table>
        <Text style={{ color: c.muted, fontSize: "12px", margin: "6px 0 0" }}>Inclusive of all taxes · paid securely via Razorpay</Text>
      </Section>

      {/* delivery */}
      <Section style={{ padding: "22px 32px 0" }}>
        <Text style={label}>Delivering to</Text>
        <Text style={{ color: c.paan, fontSize: "15px", fontWeight: 700, margin: 0 }}>{customer.name}</Text>
        <Text style={{ color: c.paanSoft, fontSize: "14px", lineHeight: "21px", margin: "2px 0 0" }}>
          {customer.address}
          <br />
          +91 {customer.phone}
        </Text>
      </Section>

      {/* what happens next */}
      <Section style={{ padding: "24px 32px 0" }}>
        <Text style={label}>What happens next</Text>
        {steps.map((s, i) => (
          <Row key={s.title} style={{ marginTop: "10px" }}>
            <Column style={{ width: "40px", verticalAlign: "top" }}>
              <Text style={{ backgroundColor: c.kesariya, color: c.paan, width: "28px", height: "28px", lineHeight: "28px", borderRadius: "999px", textAlign: "center", fontWeight: 800, fontSize: "14px", margin: 0 }}>
                {i + 1}
              </Text>
            </Column>
            <Column style={{ verticalAlign: "top" }}>
              <Text style={{ color: c.paan, fontSize: "14px", fontWeight: 700, margin: "4px 0 0" }}>{s.title}</Text>
              <Text style={{ color: c.muted, fontSize: "13px", lineHeight: "19px", margin: "2px 0 0" }}>{s.copy}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* care */}
      <Section style={{ padding: "22px 32px 0" }}>
        <Section style={{ backgroundColor: "#FFF4E8", borderRadius: "14px", padding: "14px 18px" }}>
          <Text style={{ color: c.paan, fontSize: "13px", lineHeight: "20px", margin: 0 }}>
            <strong>Keep it khasta:</strong> close the jar tightly and store away from sunlight — it stays
            fresh for up to {days} days, no fridge needed.
          </Text>
          <Text style={{ color: c.paan, fontSize: "13px", lineHeight: "20px", margin: "8px 0 0" }}>
            <strong>Breakage promise:</strong> if your order arrives broken or crushed, WhatsApp us photos
            within 24 hours of delivery and we&apos;ll replace or refund the affected item.
          </Text>
        </Section>
      </Section>

      {/* help */}
      <Section style={{ padding: "26px 32px 30px", textAlign: "center" }}>
        <Hr style={{ borderColor: c.pistaDeep, margin: "0 0 20px" }} />
        <Text style={{ color: c.paan, fontSize: "15px", fontWeight: 700, margin: "0 0 12px" }}>Questions about your order?</Text>
        <Button
          href={waLink}
          style={{ backgroundColor: c.mehndi, color: c.white, padding: "13px 26px", borderRadius: "999px", fontWeight: 700, fontSize: "14px" }}
        >
          Chat with us on WhatsApp
        </Button>
        <Text style={{ color: c.muted, fontSize: "12px", margin: "12px 0 0" }}>
          or simply reply to this email · <Link href={siteUrl} style={{ color: c.sindoor }}>Visit our shop</Link>
        </Text>
      </Section>
    </EmailLayout>
  );
}

export function customerConfirmationText(d: Props): string {
  const total = d.paidAmount ?? d.cart.total;
  const lines = d.cart.lines.map((l) => `- ${l.name} (${l.variantLabel}) x${l.qty} = ₹${l.lineTotal}`).join("\n");
  return [
    `Thank you, ${d.customer.name.split(" ")[0]}! Your Desi Pakwan order is confirmed.`,
    "",
    `Order ID: ${d.orderId}`,
    d.placedAt ? `Placed on: ${formatDate(d.placedAt)}` : "",
    "",
    lines,
    `Subtotal: ₹${d.cart.subtotal}`,
    `Shipping: ${d.cart.shipping === 0 ? "Free" : `₹${d.cart.shipping}`}`,
    `Total paid: ₹${total}`,
    "",
    "Delivering to:",
    d.customer.name,
    d.customer.address,
    "",
    "What happens next: made fresh → dispatched in 2–3 working days → delivered in 5–7 working days (7–10 in remote areas).",
    `Keep the jar closed; it stays fresh for up to ${shelfLifeDays(d.cart.lines.map((l) => l.sku))} days.`,
    "Breakage promise: if your order arrives broken or crushed, WhatsApp photos within 24 hours of delivery and we'll replace or refund the affected item.",
    "",
    `Questions? WhatsApp us: https://wa.me/${d.supportWhatsapp} or reply to this email.`,
  ]
    .filter((x) => x !== "")
    .join("\n");
}
