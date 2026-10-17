import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EncryptJWT, jwtDecrypt } from "jose";
import { savedDetailsSchema } from "@/lib/checkoutDetails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/checkout-details — remembers a returning customer's contact and
 * delivery details in an encrypted, HttpOnly cookie set by the server
 * (Safari wipes script-written storage after 7 days; server cookies last).
 * The cookie is scoped to this route, so it never travels with page requests.
 *
 * POST saves, GET reads ({} when missing/expired/invalid), DELETE forgets.
 */

const COOKIE = "dp_details";
const COOKIE_PATH = "/api/checkout-details";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Personal details: never cached anywhere, never served to someone else.
const noStore = { "Cache-Control": "no-store, private" };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: noStore });
}

/** 32-byte A256GCM key derived from CHECKOUT_COOKIE_SECRET (null if not configured). */
function encryptionKey(): Uint8Array | null {
  const secret = process.env.CHECKOUT_COOKIE_SECRET;
  if (!secret || secret.length < 32) return null;
  return new Uint8Array(crypto.createHash("sha256").update(secret).digest());
}

/** Only our own pages may save or clear details (stops other sites planting an address). */
function fromOurSite(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function clearCookie(res: NextResponse) {
  res.cookies.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: 0,
  });
  return res;
}

export async function POST(req: Request) {
  if (!fromOurSite(req) || !req.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false }, 403);
  }
  const key = encryptionKey();
  if (!key) {
    console.error("CHECKOUT_COOKIE_SECRET missing or shorter than 32 characters — details not saved");
    return json({ ok: false }, 503);
  }

  let parsed;
  try {
    parsed = savedDetailsSchema.safeParse(await req.json());
  } catch {
    return json({ ok: false }, 400);
  }
  if (!parsed.success) return json({ ok: false }, 400);

  const token = await new EncryptJWT({ d: parsed.data })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .encrypt(key);

  const res = json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    // browsers drop Secure cookies on plain-http localhost in some cases; always Secure when live
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: MAX_AGE,
  });
  return res;
}

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value;
  const key = encryptionKey();
  if (!token || !key) return json({});

  try {
    const { payload } = await jwtDecrypt(token, key, {
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256GCM"],
    });
    const parsed = savedDetailsSchema.safeParse(payload.d);
    if (parsed.success) return json(parsed.data);
  } catch {
    /* expired, tampered or encrypted with an old secret */
  }
  // unreadable cookie: drop it so the next save starts clean
  return clearCookie(json({}));
}

export async function DELETE(req: Request) {
  if (!fromOurSite(req)) return json({ ok: false }, 403);
  return clearCookie(json({ ok: true }));
}
