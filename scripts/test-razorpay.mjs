/**
 * Checks the Razorpay keys in .env.local (read-only API call, no order created).
 * Run: node scripts/test-razorpay.mjs
 */
import { readFileSync } from "node:fs";
import Razorpay from "razorpay";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const id = env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
const secret = env.RAZORPAY_KEY_SECRET ?? "";
const hook = env.RAZORPAY_WEBHOOK_SECRET ?? "";

console.log("Key ID:", /^rzp_(test|live)_/.test(id) ? `${id.slice(0, 9)}… (${id.startsWith("rzp_test_") ? "TEST mode" : "LIVE mode"})` : "MISSING or wrong format");
console.log("Key Secret:", secret && !secret.startsWith("dummy") ? `set (${secret.length} chars)` : "MISSING");
console.log("Webhook secret:", hook && !hook.startsWith("dummy") ? "set" : "MISSING");

try {
  await new Razorpay({ key_id: id, key_secret: secret }).orders.all({ count: 1 });
  console.log("Razorpay login: OK ✅");
} catch (e) {
  console.log("Razorpay login: FAILED ❌", e?.error?.description ?? e?.message ?? e);
  process.exit(1);
}
