/**
 * Renders both order emails with sample data, writes HTML previews to
 * scripts/.email-preview/, and (with --send) emails them to OWNER_EMAIL.
 * Run: npx tsx --tsconfig scripts/tsconfig.scripts.json scripts/preview-emails.tsx [--send]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { render } from "@react-email/render";
import { Resend } from "resend";
import OwnerNewOrder, { ownerNewOrderText, type OrderEmailData } from "../emails/OwnerNewOrder";
import CustomerConfirmation, { customerConfirmationText } from "../emails/CustomerConfirmation";
import { LOGO_CID } from "../emails/EmailLayout";
import { priceCart } from "../lib/pricing";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const cart = priceCart([
  { sku: "TK-GUR-400", qty: 1 },
  { sku: "CO-CLA-NP", qty: 1 },
]);

const sample: OrderEmailData = {
  orderId: "order_PREVIEW12345",
  paymentId: "pay_PREVIEW67890",
  cart,
  paidAmount: cart.total,
  placedAt: new Date(),
  testMode: false,
  siteUrl: "https://thedesipakwan.com",
  customer: {
    name: "Priya Sharma",
    phone: "9876543210",
    email: env.OWNER_EMAIL,
    address: "Flat 402, Sunrise Apartments, Sector 62, Noida, Uttar Pradesh, 201310",
    note: "Please be careful with the boxes, it shouldn't be broken",
  },
};
const supportWhatsapp = (env.NEXT_PUBLIC_WHATSAPP || "919999999999").replace(/\D/g, "");

const owner = <OwnerNewOrder {...sample} />;
const customer = <CustomerConfirmation {...sample} supportWhatsapp={supportWhatsapp} />;

async function main() {
// local HTML previews (logo swapped to a file path so it shows in a browser)
mkdirSync("scripts/.email-preview", { recursive: true });
const logoPath = "../../public/images/email-logo.png";
for (const [name, node] of [["owner", owner], ["customer", customer]] as const) {
  const html = (await render(node)).replaceAll(`cid:${LOGO_CID}`, logoPath);
  writeFileSync(`scripts/.email-preview/${name}.html`, html);
}
console.log("previews written to scripts/.email-preview/");

if (process.argv.includes("--send")) {
  const resend = new Resend(env.RESEND_API_KEY);
  const attachments = [
    {
      filename: "the-desi-pakwan.png",
      content: readFileSync("public/images/email-logo.png").toString("base64"),
      contentId: LOGO_CID,
    },
  ];
  for (const [subject, node, text] of [
    ["[PREVIEW] New order #order_PREVIEW12345 · ₹" + cart.total + " · Priya Sharma, Noida", owner, ownerNewOrderText(sample)],
    ["[PREVIEW] Your Desi Pakwan order is confirmed 🟠", customer, customerConfirmationText({ ...sample, supportWhatsapp })],
  ] as const) {
    const { data, error } = await resend.emails.send({
      from: env.FROM_EMAIL,
      to: env.OWNER_EMAIL,
      subject,
      react: node,
      text,
      attachments,
    });
    console.log(error ? `FAILED ${subject}: ${error.message}` : `sent: ${subject} (${data?.id})`);
  }
}
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
