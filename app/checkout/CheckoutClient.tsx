"use client";

import Image from "next/image";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart, cartTotals } from "@/lib/cart";
import { findVariant } from "@/data/products";
import { INDIAN_STATES } from "@/data/states";
import { formatINR } from "@/lib/pricing";
import { Input, Textarea } from "@/components/ui/Input";
import StateSelect from "@/components/ui/StateSelect";
import CartSummary from "@/components/cart/CartSummary";
import ChakliSpiral from "@/components/svg/ChakliSpiral";
import type { SavedDetails } from "@/lib/checkoutDetails";

const schema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number"),
  email: z.string().email("Enter a valid email").max(120),
  line1: z.string().trim().min(3, "Address is required").max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required").max(60),
  state: z.string().min(2, "Pick a state"),
  pin: z.string().regex(/^\d{6}$/, "PIN must be 6 digits"),
  note: z.string().trim().max(200).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const EMPTY_FORM: FormValues = { name: "", phone: "", email: "", line1: "", line2: "", city: "", state: "", pin: "", note: "" };

/** Autofill may give "+91 98765 43210" or "098765 43210" — keep the 10-digit mobile. */
function normalizePhone(raw: string): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/**
 * Saves (values) or forgets (null) the customer's details for next checkout.
 * Never throws and gives up after 3 s, so it can't hold up the redirect.
 */
async function rememberDetails(values: FormValues | null) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  try {
    if (values) {
      const details: SavedDetails = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address1: values.line1,
        address2: values.line2 || "",
        city: values.city,
        state: values.state,
        pin: values.pin,
      };
      await fetch("/api/checkout-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
        signal: ctrl.signal,
      });
    } else {
      await fetch("/api/checkout-details", { method: "DELETE", signal: ctrl.signal });
    }
  } catch {
    /* saving is a convenience — never block the order */
  } finally {
    clearTimeout(timer);
  }
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (resp: unknown) => void) => void;
    };
  }
}

export default function CheckoutClient() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const [mounted, setMounted] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [saveDetails, setSaveDetails] = useState(false);
  /** First name of a returning customer whose saved details were filled in. */
  const [welcomeName, setWelcomeName] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  const { detailed, subtotal, shipping, total } = cartTotals(mounted ? lines : []);

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_FORM,
  });
  const [addrName, addr1, addr2, addrCity, addrState, addrPin] = useWatch({
    control,
    name: ["name", "line1", "line2", "city", "state", "pin"],
  });

  // Returning customer: fill in the details they chose to save last time.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout-details", { cache: "no-store" });
        if (!res.ok) return;
        const saved: Partial<SavedDetails> = await res.json();
        if (cancelled || !saved.name || !saved.phone) return;
        // don't overwrite anything the customer has already started typing
        if (Object.values(getValues()).some((v) => typeof v === "string" && v.trim())) return;
        reset({
          ...EMPTY_FORM,
          name: saved.name,
          phone: saved.phone,
          email: saved.email ?? "",
          line1: saved.address1 ?? "",
          line2: saved.address2 ?? "",
          city: saved.city ?? "",
          state: saved.state ?? "",
          pin: saved.pin ?? "",
        });
        setWelcomeName(saved.name.split(/\s+/)[0]);
        // they opted in last time — keep saving unless they untick it
        setSaveDetails(true);
      } catch {
        /* no saved details — plain empty form */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getValues, reset]);

  const clearSavedDetails = () => {
    setWelcomeName(null);
    setSaveDetails(false);
    reset(EMPTY_FORM);
    void rememberDetails(null);
  };

  const onSubmit = async (values: FormValues) => {
    setPayError(null);
    setPaying(true);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // ignore stale SKUs left in localStorage from removed products
          items: lines
            .filter((l) => findVariant(l.sku))
            .map((l) => ({ sku: l.sku, qty: l.qty })),
          customer: {
            name: values.name,
            phone: values.phone,
            email: values.email,
            line1: values.line1,
            line2: values.line2 || "",
            city: values.city,
            state: values.state,
            pin: values.pin,
            note: values.note || "",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start the payment.");
      if (!window.Razorpay) throw new Error("Payment library didn't load. Check your connection and retry.");

      // The success page only shows this browser's cart for the order it created.
      try {
        sessionStorage.setItem("tdp-last-order", data.orderId);
      } catch {
        /* storage blocked — success page falls back to a neutral confirmation */
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "The Desi Pakwan",
        description: "Handmade thekua & chakli",
        image: "/images/logo-mark.png",
        order_id: data.orderId,
        prefill: { name: values.name, email: values.email, contact: values.phone },
        theme: { color: "#FF8A3C" },
        modal: { ondismiss: () => setPaying(false) },
        handler: async (resp: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resp),
            });
            const verify = await verifyRes.json();
            if (!verify.valid) throw new Error("verify failed");
            await rememberDetails(saveDetails ? values : null);
            router.push(`/order/success?order=${encodeURIComponent(resp.razorpay_order_id)}`);
          } catch {
            setPaying(false);
            setPayError(
              "We received the payment but couldn't confirm it automatically. Don't pay again — message us on WhatsApp with your name and we'll confirm."
            );
          }
        },
      });
      rzp.on("payment.failed", () => {
        setPaying(false);
        setPayError("Payment didn't go through. Nothing was charged. Try again or pay by UPI.");
      });
      rzp.open();
    } catch (err) {
      setPaying(false);
      setPayError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  };

  if (mounted && detailed.length === 0) {
    return (
      <div className="grain flex min-h-screen flex-col items-center justify-center gap-5 bg-pista-100 px-6 pt-24 text-center">
        <ChakliSpiral className="animate-spin-slow h-20 w-20 text-kesariya-500" strokeWidth={6} />
        <p className="font-display text-[32px] font-black text-paan-900">Your cart is empty</p>
        <p className="text-[17px] text-paan-700/70">Add something khasta first, then come back.</p>
        <Link
          href="/shop"
          className="mt-2 rounded-full bg-sindoor-600 px-8 py-3.5 text-[17px] font-bold text-pista-100 transition-transform hover:scale-[1.03]"
        >
          Shop the crunch
        </Link>
      </div>
    );
  }

  return (
    <div className="grain min-h-screen bg-pista-100 pb-24 pt-32">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="mx-auto max-w-[1180px] px-6">
        {/* step indicator */}
        <ol className="flex flex-wrap items-center gap-2 text-[13px] font-bold" aria-label="Checkout progress">
          <li>
            <Link href="/cart" className="inline-flex items-center gap-2 rounded-full bg-mehndi-600/10 px-3 py-1.5 text-mehndi-600 hover:bg-mehndi-600/15">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mehndi-600 text-[11px] text-white">✓</span>
              Cart
            </Link>
          </li>
          <li aria-hidden className="h-px w-6 bg-paan-900/20" />
          <li aria-current="step" className="inline-flex items-center gap-2 rounded-full bg-paan-900 px-3 py-1.5 text-kesariya-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-kesariya-500 text-[11px] text-paan-900">2</span>
            Details
          </li>
          <li aria-hidden className="h-px w-6 bg-paan-900/20" />
          <li className="inline-flex items-center gap-2 rounded-full bg-paan-900/5 px-3 py-1.5 text-paan-700/60">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-paan-900/10 text-[11px]">3</span>
            Payment
          </li>
        </ol>

        <h1 className="font-display mt-6 text-[clamp(40px,5.5vw,64px)] font-black leading-none text-paan-900">
          Almost there.
        </h1>
        <p className="mt-3 text-[17px] text-paan-700/70">
          Tell us where to send it — the kitchen starts the moment you pay.
        </p>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            {welcomeName ? (
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-mehndi-600/20 bg-mehndi-600/10 px-5 py-3.5 text-[15px] text-paan-900">
                <p>
                  <span className="font-bold">Welcome back, {welcomeName}!</span> We&apos;ve filled in your details.
                </p>
                <button
                  type="button"
                  onClick={clearSavedDetails}
                  className="font-bold text-sindoor-600 underline-offset-4 hover:underline"
                >
                  Not you? Clear details
                </button>
              </div>
            ) : null}

            {/* 1 · contact */}
            <fieldset className="rounded-[28px] border border-pista-200 bg-white/75 p-6 shadow-[0_16px_40px_rgba(6,28,19,0.06)] md:p-7">
              <legend className="sr-only">Contact details</legend>
              <div className="mb-5 flex items-center gap-3">
                <span className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-kesariya-500 text-[16px] font-black text-paan-900">1</span>
                <h2 className="font-display text-[22px] font-black text-paan-900">Contact</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
                <Input
                  label="Phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  hint="10 digits, for delivery updates"
                  error={errors.phone?.message}
                  {...register("phone", { setValueAs: normalizePhone })}
                />
              </div>
              <Input
                className="mt-5"
                label="Email"
                type="email"
                autoComplete="email"
                hint="Your order confirmation goes here"
                error={errors.email?.message}
                {...register("email")}
              />
            </fieldset>

            {/* 2 · address */}
            <fieldset className="rounded-[28px] border border-pista-200 bg-white/75 p-6 shadow-[0_16px_40px_rgba(6,28,19,0.06)] md:p-7">
              <legend className="sr-only">Delivery address</legend>
              <div className="mb-5 flex items-center gap-3">
                <span className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-kesariya-500 text-[16px] font-black text-paan-900">2</span>
                <h2 className="font-display text-[22px] font-black text-paan-900">Delivery address</h2>
              </div>
              {welcomeName ? (
                <div className="mb-5 rounded-2xl border-2 border-dashed border-kesariya-500/50 bg-kesariya-500/[0.06] px-5 py-4">
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-paan-700/60">Delivering to</p>
                  <p className="mt-1.5 text-[16px] font-bold text-paan-900">{addrName}</p>
                  <p className="text-[15px] leading-relaxed text-paan-900">
                    {[addr1, addr2, addrCity, addrState].filter(Boolean).join(", ")}
                    {addrPin ? ` – ${addrPin}` : ""}
                  </p>
                  <p className="mt-1 text-[13px] text-paan-700/60">Not right? Change it in the fields below before you pay.</p>
                </div>
              ) : null}
              <div className="space-y-5">
                <Input label="Address line 1" placeholder="House no., building, street" autoComplete="address-line1" error={errors.line1?.message} {...register("line1")} />
                <Input label="Address line 2 (optional)" placeholder="Area, landmark" autoComplete="address-line2" error={errors.line2?.message} {...register("line2")} />
                <div className="grid gap-5 sm:grid-cols-3">
                  <Input label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
                  <Controller
                    control={control}
                    name="state"
                    render={({ field }) => (
                      <StateSelect
                        label="State"
                        name="state"
                        autoComplete="address-level1"
                        options={INDIAN_STATES}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.state?.message}
                      />
                    )}
                  />
                  <Input
                    label="PIN code"
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                    error={errors.pin?.message}
                    {...register("pin")}
                  />
                </div>
                <Textarea
                  label="Delivery note (optional)"
                  placeholder="Landmark, best time, gift message…"
                  error={errors.note?.message}
                  {...register("note")}
                />
              </div>
            </fieldset>

            <label className="flex cursor-pointer items-start gap-3 px-1">
              <input
                type="checkbox"
                checked={saveDetails}
                onChange={(e) => setSaveDetails(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-sindoor-600"
              />
              <span className="text-[15px] font-bold text-paan-900">
                Save my details for faster checkout next time
                <span className="mt-0.5 block text-[13px] font-normal text-paan-700/60">
                  Name, contact and address only, in a secure cookie in this browser. Never payment details.
                </span>
              </span>
            </label>

            {payError ? (
              <div role="alert" className="rounded-2xl border-2 border-sindoor-600/30 bg-sindoor-600/10 px-5 py-4 text-[15px] font-medium text-sindoor-600">
                {payError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={paying || !mounted}
              className="flex h-16 w-full items-center justify-center gap-3 rounded-full bg-sindoor-600 text-[18px] font-bold text-pista-100 shadow-[0_16px_40px_rgba(176,58,15,0.30)] transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
            >
              {paying ? (
                <>
                  <ChakliSpiral className="animate-spin-slow h-6 w-6" strokeWidth={8} />
                  Opening payment…
                </>
              ) : (
                <>
                  <LockIcon />
                  Pay {formatINR(total)} securely
                </>
              )}
            </button>
            <p className="text-center text-[13px] text-paan-700/60">
              Payments handled by Razorpay — UPI, cards, netbanking. We never see your card details.
            </p>
          </form>

          {/* ---------- summary ---------- */}
          <aside className="rounded-[28px] border border-pista-200 bg-white p-6 shadow-[0_24px_60px_rgba(6,28,19,0.10)] md:p-7 lg:sticky lg:top-28">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-[22px] font-black text-paan-900">Your order</h2>
              <Link href="/cart" className="text-[14px] font-bold text-sindoor-600 underline-offset-4 hover:underline">
                Edit
              </Link>
            </div>
            <ul className="mb-5 space-y-3 border-b border-paan-900/10 pb-5">
              {detailed.map((l) => (
                <li key={l.sku} className="flex items-center gap-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-pista-200">
                    <Image src={l.product.images[0]} alt={l.product.name} fill sizes="56px" className="object-cover" />
                    <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-bl-lg bg-paan-900 px-1 text-[11px] font-bold text-kesariya-500">
                      {l.qty}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-paan-900">{l.product.name}</span>
                    <span className="block text-[13px] text-paan-700/60">{l.variant.label}</span>
                  </span>
                  <span className="text-[15px] font-bold text-paan-900 tabular-nums">
                    {formatINR(l.variant.price * l.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <CartSummary subtotal={subtotal} shipping={shipping} total={total} light />
            <ul className="mt-5 space-y-2 border-t border-paan-900/10 pt-5 text-[13px] font-bold text-mehndi-600">
              <li>✓ Made fresh after you order</li>
              <li>✓ Dispatched in 2–3 working days</li>
              <li>✓ Breakage-safe packing, free replacement promise</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d="M8 11 V7.5 a4 4 0 0 1 8 0 V11" />
    </svg>
  );
}
