/**
 * End-to-end security checks against the running local site (npm run dev).
 * Uses the Razorpay TEST keys in .env.local. Creates a few unpaid test
 * orders; sends no emails (no payment is ever captured).
 * Run: node scripts/security-check.mjs
 */
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import Razorpay from "razorpay";

const BASE = "http://localhost:3000";
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

const customer = {
  name: "Test Buyer",
  phone: "9876543210",
  email: env.OWNER_EMAIL,
  line1: "12 Test Road",
  city: "Patna",
  state: "Bihar",
  pin: "800001",
  note: "",
};
const order = (body, ip) =>
  fetch(`${BASE}/api/razorpay/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });

// 1. security headers
const home = await fetch(BASE);
for (const h of ["x-frame-options", "content-security-policy", "x-content-type-options", "referrer-policy", "permissions-policy", "strict-transport-security"]) {
  check(`header ${h}`, !!home.headers.get(h), home.headers.get(h) ?? "missing");
}
check("no x-powered-by header", !home.headers.get("x-powered-by"));

// 2. input validation
let r = await order({ items: [{ sku: "TK-GUR-400", qty: 1 }], customer: { ...customer, name: "Evil\r\nBcc: x@y.com" } }, "10.0.0.1");
check("rejects newline in name", r.status === 400, await r.text());
r = await order({ items: [{ sku: "TK-GUR-400", qty: 1 }], customer: { ...customer, state: "Narnia" } }, "10.0.0.1");
check("rejects unknown state", r.status === 400, await r.text());
r = await order({ items: [{ sku: "tk-gur-400x9|X", qty: 1 }], customer }, "10.0.0.1");
check("rejects malformed SKU", r.status === 400);
r = await order({ items: [{ sku: "TK-GUR-400", qty: 99 }], customer }, "10.0.0.1");
check("rejects qty > 20", r.status === 400);

// 3. valid order: duplicates merged, prices recorded in notes, amount server-side
r = await order({ items: [{ sku: "TK-GUR-400", qty: 1 }, { sku: "TK-GUR-400", qty: 2 }, { sku: "CH-CLA-200", qty: 1 }] , customer }, "10.0.0.2");
const created = await r.json();
check("valid order created", r.status === 200 && !!created.orderId, created.orderId ?? JSON.stringify(created));
const rp = new Razorpay({ key_id: env.NEXT_PUBLIC_RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
if (created.orderId) {
  const o = await rp.orders.fetch(created.orderId);
  check("duplicate SKUs merged + unit prices recorded", o.notes.items === "TK-GUR-400x3@379|CH-CLA-200x1@190", o.notes.items);
  check("amount = server price (3×379 + 190, free shipping)", Number(o.amount) === (3 * 379 + 190) * 100, String(o.amount));
  check("city stored separately", o.notes.city === "Patna");
}

// 4. rate limit on order creation (8/min per IP)
let limited = false;
for (let i = 0; i < 10; i++) {
  const x = await order({ items: [{ sku: "BAD", qty: 1 }], customer }, "10.0.0.99");
  if (x.status === 429) limited = true;
}
check("order endpoint rate-limited", limited);

// 5. webhook
const sign = (body, secret) => crypto.createHmac("sha256", secret).update(body).digest("hex");
const hook = (body, sig) => fetch(`${BASE}/api/razorpay/webhook`, { method: "POST", headers: { "x-razorpay-signature": sig }, body });
const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_Fake1234567890", order_id: created.orderId ?? "order_x" } } } });
r = await hook(body, sign(body, "wrong-secret"));
check("webhook: forged signature rejected", r.status === 400);
r = await hook(body, sign(body, env.RAZORPAY_WEBHOOK_SECRET) + "zz");
check("webhook: signature with junk appended rejected", r.status === 400);
r = await hook(body, sign(body, env.RAZORPAY_WEBHOOK_SECRET));
check("webhook: valid signature but fake payment → no email, asks retry", r.status === 503, await r.text());

// 6. status endpoint
r = await fetch(`${BASE}/api/razorpay/status?order=${created.orderId}`);
const st = await r.json();
check("status: unpaid order reports paid=false", st.paid === false);
check("status: no-store cache header", r.headers.get("cache-control") === "no-store");
r = await fetch(`${BASE}/api/razorpay/status?order=<script>`);
check("status: bad id rejected", r.status === 400);

// 7. robots
const robots = await (await fetch(`${BASE}/robots.txt`)).text();
check("robots disallows /checkout /order /api", ["/checkout", "/order/", "/api/"].every((p) => robots.includes(p)));
const checkoutHtml = await (await fetch(`${BASE}/checkout`)).text();
check("checkout page is noindex", /name="robots" content="noindex/.test(checkoutHtml));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
