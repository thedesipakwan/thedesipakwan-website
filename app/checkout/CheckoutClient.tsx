"use client";

import Image from "next/image";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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

  useEffect(() => setMounted(true), []);
  const { detailed, subtotal, shipping, total } = cartTotals(mounted ? lines : []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { state: "" },
  });

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
                  maxLength={10}
                  autoComplete="tel-national"
                  hint="10 digits, for delivery updates"
                  error={errors.phone?.message}
                  {...register("phone")}
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
