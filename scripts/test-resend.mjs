/**
 * Sends one test email to OWNER_EMAIL using the keys in .env.local.
 * Run: node scripts/test-resend.mjs
 */
import { readFileSync } from "node:fs";
import { Resend } from "resend";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const key = env.RESEND_API_KEY ?? "";
const to = env.OWNER_EMAIL ?? "";
const from = env.FROM_EMAIL ?? "";

console.log("RESEND_API_KEY:", key.startsWith("re_") ? `set (re_…, ${key.length} chars)` : "MISSING or wrong format");
console.log("OWNER_EMAIL:", to || "MISSING");
console.log("FROM_EMAIL:", from || "MISSING");
if (!key.startsWith("re_") || !to || !from) process.exit(1);

const { data, error } = await new Resend(key).emails.send({
  from,
  to,
  subject: "Test from The Desi Pakwan website ✅",
  text: "If you can read this, Resend is set up correctly. Order emails will arrive here.",
});

if (error) {
  console.log("FAILED:", error.name, "-", error.message);
  process.exit(1);
}
console.log("SENT ✅ email id:", data?.id);
