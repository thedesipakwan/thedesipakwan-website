"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart, cartTotals, type CartLine } from "@/lib/cart";
import { formatINR } from "@/lib/pricing";
import { site, waLink } from "@/data/site";
import ChakliSpiral, { CHAKLI_PATH } from "@/components/svg/ChakliSpiral";
import { MouldStamp } from "@/components/svg/MouldPattern";
import { HandmadeIcon, PackingIcon } from "@/components/svg/TrustIcons";
import PatternBackdrop from "@/components/motion/PatternBackdrop";
import { ButtonLink } from "@/components/ui/Button";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Snapshot = ReturnType<typeof cartTotals>;
type Status = "checking" | "paid" | "unpaid";

// Banks can take a few seconds to confirm, so re-check a handful of times.
const CHECKS = 6;
const CHECK_GAP_MS = 2500;

// Ghee drops that burst out of the seal once the spiral finishes drawing.
const DROPS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const r = i % 2 ? 92 : 120;
  return { dx: Math.round(Math.cos(a) * r), dy: Math.round(Math.sin(a) * r), big: i % 3 === 0 };
});

/** The cart lines behind this order, kept for this tab so a refresh still shows them. */
const linesKey = (orderId: string) => `tdp-order-lines:${orderId}`;

function readSavedLines(orderId: string): CartLine[] | null {
  try {
    const raw = sessionStorage.getItem(linesKey(orderId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (l): l is CartLine => typeof l?.sku === "string" && Number.isInteger(l?.qty) && l.qty > 0
    );
  } catch {
    return null;
  }
}

export default function SuccessClient() {
  const params = useSearchParams();
  const rawOrder = params.get("order") ?? "";
  // Ignore anything that isn't a real Razorpay order id (no spoofed text on screen).
  const orderId = /^order_[A-Za-z0-9]{6,40}$/.test(rawOrder) ? rawOrder : "";
  const clear = useCart((s) => s.clear);
  const [status, setStatus] = useState<Status>("checking");
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [burst, setBurst] = useState(false);
  const [copied, setCopied] = useState(false);
  const spiralRef = useRef<SVGPathElement>(null);
  const tickRef = useRef<SVGPathElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Only a Razorpay-confirmed payment counts — the URL alone proves nothing.
  useEffect(() => {
    if (!orderId) {
      setStatus("unpaid");
      return;
    }
    let cancelled = false;
    (async () => {
      for (let i = 0; i < CHECKS && !cancelled; i++) {
        try {
          const res = await fetch(`/api/razorpay/status?order=${encodeURIComponent(orderId)}`, {
            cache: "no-store",
          });
          const data = await res.json();
          if (data.paid) {
            if (cancelled) return;
            setPaidAmount(typeof data.amount === "number" ? data.amount : null);
            // Only treat the cart as "this order" if this browser created it —
            // a link to someone else's paid order must not clear your cart.
            let ours = false;
            try {
              ours = sessionStorage.getItem("tdp-last-order") === orderId;
            } catch {
              /* storage blocked */
            }
            if (ours) {
              const lines = useCart.getState().lines;
              setSnapshot(cartTotals(lines));
              clear();
              try {
                sessionStorage.removeItem("tdp-last-order");
                sessionStorage.setItem(linesKey(orderId), JSON.stringify(lines));
              } catch {
                /* ignore */
              }
            } else {
              // A refresh of this tab: the cart is already cleared, use the saved lines.
              const saved = readSavedLines(orderId);
              if (saved?.length) setSnapshot(cartTotals(saved));
            }
            setStatus("paid");
            return;
          }
        } catch {
          /* network blip — try again */
        }
        await new Promise((r) => setTimeout(r, CHECK_GAP_MS));
      }
      if (!cancelled) setStatus("unpaid");
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, clear]);

  // Always start at the top. On phones the visitor arrives scrolled far down
  // (the Pay button sits low on a long checkout form), and the short
  // "Confirming…" screen keeps them near its bottom — so when the full page
  // appears they'd land mid-page and miss the seal animation.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [status]);

  // Draw the chakli seal, stamp the tick, burst the ghee drops, then reveal
  // the page piece by piece (paid state only).
  useEffect(() => {
    if (status !== "paid") return;
    const path = spiralRef.current;
    const tick = tickRef.current;
    const badge = badgeRef.current;
    const content = contentRef.current;
    if (!path || !tick || !badge || !content) return;
    const pieces = content.querySelectorAll<HTMLElement>("[data-reveal]");
    if (prefersReducedMotion()) {
      gsap.set([badge, ...pieces], { opacity: 1 });
      return;
    }
    const len = path.getTotalLength();
    const tickLen = tick.getTotalLength();
    const tl = gsap.timeline();
    tl.fromTo(
      path,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }
    )
      .fromTo(badge, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.2)" }, "-=0.2")
      .fromTo(
        tick,
        { strokeDasharray: tickLen, strokeDashoffset: tickLen },
        { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" },
        "-=0.15"
      )
      .call(() => setBurst(true), [], "<")
      .fromTo(
        pieces,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.09 },
        "-=0.3"
      );
    return () => {
      tl.kill();
    };
  }, [status]);

  const whatsapp = waLink(`Hi Desi Pakwan, order ${orderId}`);

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the id is still selectable */
    }
  };

  if (status === "checking") {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-paan-900 px-6 py-36 text-center">
        <PatternBackdrop mandalaSize="md" />
        <ChakliSpiral className="animate-spin-slow relative h-16 w-16 text-kesariya-500" strokeWidth={6} />
        <p className="font-display relative text-[28px] font-black text-pista-100">Confirming your payment…</p>
        <p className="relative max-w-sm text-[15px] text-pista-100/60">
          This takes a few seconds. Please don&apos;t close this page or pay again.
        </p>
      </section>
    );
  }

  if (status === "unpaid") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-paan-900 px-6 py-36 text-center">
        <p className="font-display max-w-xl text-[clamp(30px,4vw,44px)] font-black leading-tight text-kesariya-500">
          We couldn&apos;t confirm this payment yet.
        </p>
        <p className="max-w-md text-[16px] leading-relaxed text-pista-100/70">
          If money was deducted, don&apos;t worry — once your bank confirms it you&apos;ll get a
          confirmation email, and if it fails the bank refunds it automatically. Please don&apos;t pay
          again. Message us with your order ID and we&apos;ll check right away.
        </p>
        {orderId ? (
          <p className="text-[14px] text-pista-100/50">
            Order ID: <span className="font-bold text-pista-100/80">{orderId}</span>
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center rounded-full bg-mehndi-600 px-8 text-[17px] font-bold text-white transition-transform hover:scale-[1.03]"
          >
            Message us on WhatsApp
          </a>
          <Link
            href="/cart"
            className="inline-flex h-14 items-center rounded-full border-2 border-kesariya-500 px-8 text-[17px] font-bold text-kesariya-500 transition-colors hover:bg-kesariya-500 hover:text-paan-900"
          >
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  const total = paidAmount ?? snapshot?.total ?? null;
  const steps = [
    {
      title: "Order received",
      when: "Just now",
      body: "Your name is on today's list in the kitchen.",
      icon: <TickIcon className="h-5 w-5" />,
      done: true,
    },
    {
      title: "Made fresh, by hand",
      when: "Starts now",
      body: "Atta, gud and desi ghee — pressed in the family mould and fried to order.",
      icon: <HandmadeIcon className="h-6 w-6" />,
    },
    {
      title: "Packed & dispatched",
      when: `In ${site.shipping.dispatchDays}`,
      body: "Breakage-safe packing, sealed for the journey.",
      icon: <PackingIcon className="h-6 w-6" />,
    },
    {
      title: "At your door",
      when: `${site.shipping.deliveryDays} after dispatch`,
      body: "Put the chai on.",
      icon: <HomeIcon className="h-6 w-6" />,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-paan-900 px-6 pb-24 pt-32 md:pb-32 md:pt-40">
      <PatternBackdrop mandalaSize="md" />

      <div ref={contentRef} className="relative mx-auto max-w-[1120px]">
        {/* ---- seal + headline ---- */}
        <div className="flex flex-col items-center text-center">
          <div className="relative h-36 w-36 md:h-40 md:w-40">
            <span
              aria-hidden
              className="absolute inset-[-18px] rounded-full bg-[radial-gradient(circle,rgba(255,138,60,0.28)_0%,rgba(255,138,60,0)_70%)]"
            />
            <span aria-hidden className="absolute inset-0 rounded-full border border-kesariya-500/30 bg-paan-700/60" />
            <span aria-hidden className="absolute inset-2 rounded-full border border-dashed border-kesariya-500/25" />
            <svg viewBox="0 0 100 100" className="absolute inset-5 text-kesariya-500" fill="none" aria-hidden>
              <path ref={spiralRef} d={CHAKLI_PATH} stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <span
              ref={badgeRef}
              style={{ opacity: 0 }}
              className="absolute -bottom-1 -right-1 flex h-14 w-14 items-center justify-center rounded-full border-4 border-paan-900 bg-mehndi-600 text-pista-100 shadow-[var(--shadow-dark)]"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
                <path
                  ref={tickRef}
                  d="M5 12.5 L10 17.5 L19 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {burst
              ? DROPS.map((d, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={`animate-ghee-burst absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 rounded-full ${
                      d.big ? "h-3 w-3 bg-kesariya-300" : "h-2 w-2 bg-kesariya-500"
                    }`}
                    style={{ "--dx": `${d.dx}px`, "--dy": `${d.dy}px` } as React.CSSProperties}
                  />
                ))
              : null}
          </div>

          <p
            data-reveal
            style={{ opacity: 0 }}
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-mehndi-300/30 bg-mehndi-600/20 px-4 py-1.5 text-[13px] font-bold uppercase tracking-[0.14em] text-mehndi-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mehndi-300 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mehndi-300" />
            </span>
            Payment confirmed
          </p>

          <h1
            data-reveal
            style={{ opacity: 0 }}
            className="font-display mt-6 text-[clamp(40px,6.4vw,80px)] font-black leading-[1.02] text-pista-100"
          >
            Order placed.
            <span className="mt-3 block text-kesariya-500 md:mt-4">The kitchen has your name.</span>
          </h1>

          <p data-reveal style={{ opacity: 0 }} className="mt-5 max-w-xl text-[17px] leading-relaxed text-pista-100/70">
            <span className="font-devanagari font-bold text-kesariya-300">धन्यवाद!</span> Nothing&apos;s sitting on a
            shelf waiting for you — your order gets made fresh, by hand, starting now.
          </p>
        </div>

        {/* ---- receipt + what happens next ---- */}
        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] items-start gap-8 md:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          {/* order receipt */}
          <div
            data-reveal
            style={{ opacity: 0 }}
            className="grain relative mx-auto w-full max-w-[520px] -rotate-[0.6deg] rounded-[28px] bg-pista-100 text-paan-900 shadow-[0_30px_80px_rgba(0,0,0,0.45)] lg:max-w-none"
          >
            {/* rubber "paid" stamp */}
            <span
              aria-hidden
              className="font-display absolute right-4 top-6 rotate-[-14deg] rounded-xl border-[3px] border-sindoor-600/80 px-2.5 py-0.5 text-[17px] font-black uppercase tracking-[0.12em] text-sindoor-600/80 sm:right-5 sm:px-3 sm:text-[22px] md:right-7"
            >
              Paid
            </span>

            <div className="px-6 pb-6 pt-7 md:px-8">
              <div className="pr-20 sm:pr-24">
                <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-paan-700/60">
                  <MouldStamp className="h-5 w-5 text-sindoor-600" />
                  Order receipt
                </p>
                <p className="font-display mt-2 text-[22px] font-black leading-tight sm:text-[26px]">{site.name}</p>
              </div>

              <div className="mt-5">
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-paan-700/55">Order ID</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="break-all font-mono text-[15px] font-bold">{orderId}</span>
                  <button
                    type="button"
                    onClick={copyOrderId}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-paan-900/[0.07] px-3 text-[12px] font-bold text-paan-700 transition-colors hover:bg-paan-900 hover:text-pista-100"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <span aria-live="polite" className="sr-only">
                    {copied ? "Order ID copied" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* perforation with ticket notches */}
            <div aria-hidden className="relative">
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-paan-900" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-paan-900" />
              <div className="mx-6 border-t-2 border-dashed border-paan-900/15 md:mx-8" />
            </div>

            <div className="px-6 pb-7 pt-5 md:px-8">
              {snapshot && snapshot.detailed.length > 0 ? (
                <ul className="space-y-4">
                  {snapshot.detailed.map((l) => (
                    <li key={l.sku} className="flex items-center gap-4">
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-pista-200">
                        <Image src={l.product.images[0]} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[16px] font-bold">{l.product.name}</span>
                        <span className="block text-[14px] text-paan-700/65">
                          {l.variant.label} × {l.qty}
                        </span>
                      </span>
                      <span className="text-[16px] font-bold tabular-nums">{formatINR(l.variant.price * l.qty)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[15px] text-paan-700/70">
                  Your full item list is in the confirmation email.
                </p>
              )}

              <dl className="mt-5 space-y-1.5 border-t border-paan-900/10 pt-4 text-[15px]">
                <div className="flex justify-between">
                  <dt className="text-paan-700/70">Shipping</dt>
                  <dd className="font-bold text-mehndi-600">Free</dd>
                </div>
                {total !== null ? (
                  <div className="flex items-baseline justify-between pt-1">
                    <dt className="text-[17px] font-bold">Total paid</dt>
                    <dd className="font-display text-[30px] font-black tabular-nums text-sindoor-600">
                      {formatINR(total)}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <p className="mt-1 text-[12px] text-paan-700/50">Inclusive of all taxes</p>
            </div>
          </div>

          {/* what happens next */}
          <div
            data-reveal
            style={{ opacity: 0 }}
            className="rounded-[28px] border border-pista-100/10 bg-paan-700/50 p-6 backdrop-blur-sm md:p-8"
          >
            <h2 className="font-display text-[28px] font-black leading-tight text-pista-100">What happens next</h2>
            <ol className="mt-7">
              {steps.map((s, i) => (
                <li key={s.title} className="relative flex gap-5 pb-7 last:pb-0">
                  {i < steps.length - 1 ? (
                    <span
                      aria-hidden
                      className={`absolute left-[23px] top-12 bottom-1 w-0.5 ${
                        s.done
                          ? "bg-gradient-to-b from-kesariya-500 to-pista-100/15"
                          : "bg-[repeating-linear-gradient(to_bottom,rgb(244_248_234/0.18)_0_6px,transparent_6px_12px)]"
                      }`}
                    />
                  ) : null}
                  <span
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      s.done
                        ? "bg-kesariya-500 text-paan-900 shadow-[0_0_0_6px_rgba(255,138,60,0.18)]"
                        : "border border-pista-100/15 bg-paan-900/60 text-kesariya-300"
                    }`}
                  >
                    {s.icon}
                  </span>
                  <div className="pt-1">
                    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <span className="text-[17px] font-bold text-pista-100">{s.title}</span>
                      <span
                        className={`text-[12px] font-bold uppercase tracking-[0.12em] ${
                          s.done ? "text-kesariya-500" : "text-pista-100/45"
                        }`}
                      >
                        {s.when}
                      </span>
                    </p>
                    <p className="mt-1 text-[15px] leading-relaxed text-pista-100/65">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex gap-3 rounded-2xl bg-paan-900/60 p-4 text-[14px] leading-relaxed text-pista-100/70">
              <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-kesariya-300" />
              <p>
                A confirmation email is on its way. Not there in 10 minutes? Check your spam or promotions
                folder.
              </p>
            </div>
          </div>
        </div>

        {/* ---- actions ---- */}
        <div data-reveal style={{ opacity: 0 }} className="mt-14 flex flex-col items-center gap-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/shop">Keep shopping</ButtonLink>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center gap-2.5 rounded-full bg-mehndi-600 px-8 text-[17px] font-bold text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.5-1.4-.7-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3Z" />
              </svg>
              Message us on WhatsApp
            </a>
          </div>
          <p className="max-w-md text-[13px] leading-relaxed text-pista-100/45">
            Arrived broken? Send photos on WhatsApp within 24 hours of delivery and we&apos;ll replace it or
            refund it.
          </p>
        </div>
      </div>
    </section>
  );
}

function TickIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M5 12.5 L10 17.5 L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
      <path
        d="M8 22 L24 9 L40 22 V40 H8 Z M19 40 V29 H29 V40"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M4 7 L12 13 L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
