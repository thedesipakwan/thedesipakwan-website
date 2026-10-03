"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { singleProducts, type Product } from "@/data/products";
import ProductGallery from "@/components/product/ProductGallery";
import VariantPicker from "@/components/product/VariantPicker";
import AddToCart from "@/components/product/AddToCart";
import ProductCard from "@/components/product/ProductCard";
import Marquee from "@/components/home/Marquee";
import Accordion from "@/components/ui/Accordion";
import { Rating } from "@/components/ui/Badge";
import { Stepper } from "@/components/ui/Stepper";
import SplitTextReveal from "@/components/motion/SplitTextReveal";
import { AttaIcon, FreshIcon, GheeIcon, NoPalmOilIcon, PackingIcon } from "@/components/svg/TrustIcons";
import { formatINR } from "@/lib/pricing";
import { site } from "@/data/site";
import { testimonials } from "@/data/testimonials";
import Stars from "@/components/ui/Stars";

const trustChips = ["Desi ghee", "No maida", "No palm oil", "No preservatives", "Made fresh"];

const whyItems = [
  { Icon: GheeIcon, title: "Desi ghee", copy: "In every dough, with rice bran oil. Never palm oil." },
  { Icon: AttaIcon, title: "100% atta, no maida", copy: "Whole wheat atta (plus besan in the chakli), never refined." },
  { Icon: NoPalmOilIcon, title: "No palm oil", copy: "No cheap fats, no shortcuts, nothing you can't pronounce." },
  { Icon: FreshIcon, title: "Made after you order", copy: "Nothing sits on a shelf — your batch is fried for you." },
];

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12 h24 v20 H4 Z" />
      <path d="M28 18 h8 l6 7 v7 H28" />
      <circle cx="12" cy="35" r="4" />
      <circle cx="35" cy="35" r="4" />
    </svg>
  );
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [variant, setVariant] = useState(product.variants[0]);
  const [qty, setQty] = useState(1);
  const imageRef = useRef<HTMLDivElement>(null);
  const buyRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);

  // mobile sticky buy bar appears once the main add-to-cart row scrolls away
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);


  const lineTotal = variant.price * qty;

  const others = singleProducts().filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="bg-pista-100">
      {/* ---------- hero: gallery + buying panel ---------- */}
      <section className="grain relative pb-24 pt-32">
        <div className="mx-auto max-w-[1280px] px-6">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[14px] font-bold text-paan-700/60">
            <Link href="/" className="hover:text-paan-900">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/shop" className="hover:text-paan-900">Shop</Link>
            <span aria-hidden>/</span>
            <span className="text-paan-900" aria-current="page">{product.name}</span>
          </nav>

          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <ProductGallery product={product} imageRef={imageRef} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                {product.rating ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 shadow-[var(--shadow-light)]">
                    <Rating value={product.rating} className="text-paan-900" />
                  </span>
                ) : null}
                <span className="rounded-full bg-paan-900/5 px-3 py-1.5 text-[13px] font-bold text-paan-700/70">
                  {product.shelfLifeDays}-day shelf life
                </span>
              </div>

              <h1 className="font-display mt-5 text-[clamp(42px,5.5vw,68px)] font-black leading-[0.98] text-paan-900">
                {product.name}
              </h1>
              {product.hindiName ? (
                <p className="font-devanagari mt-2 text-[22px] text-kesariya-500">{product.hindiName}</p>
              ) : null}
              <p className="mt-4 text-[19px] text-paan-700">{product.tagline}</p>

              {/* price card */}
              <div className="mt-8 rounded-[28px] border border-pista-200 bg-white/75 p-6 shadow-[0_20px_50px_rgba(6,28,19,0.08)] md:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    {variant.compareAt ? (
                      <span className="mb-2 inline-block rounded-full bg-mehndi-600 px-3 py-1 text-[12px] font-bold text-white">
                        Combo saving · {formatINR((variant.compareAt - variant.price) * qty)}
                      </span>
                    ) : null}
                    <p key={`${variant.sku}-${qty}`} className="animate-price-roll font-display text-[44px] font-black leading-none text-paan-900 tabular-nums">
                      {formatINR(lineTotal)}
                      {variant.compareAt ? (
                        <span className="ml-3 font-sans text-[20px] font-bold text-paan-700/40 line-through">
                          {formatINR(variant.compareAt * qty)}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-2 text-[13px] text-paan-700/60">
                      {qty > 1 ? `${formatINR(variant.price)} × ${qty} · ` : ""}
                      {variant.label} · Inclusive of all taxes
                    </p>
                  </div>
                  {product.variants.length > 1 ? (
                    <VariantPicker variants={product.variants} selected={variant} onSelect={setVariant} />
                  ) : (
                    <span className="rounded-full bg-paan-900 px-5 py-2.5 text-[15px] font-bold text-kesariya-500">
                      {variant.label}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {trustChips.map((t) => (
                    <span
                      key={t}
                      className="whitespace-nowrap rounded-full bg-mehndi-600/10 px-2.5 py-1 text-[12px] font-bold text-mehndi-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div ref={buyRef} className="mt-6 flex flex-wrap items-center gap-4">
                  <Stepper value={qty} onChange={setQty} />
                  <AddToCart
                    sku={variant.sku}
                    productName={product.name}
                    qty={qty}
                    imageRef={imageRef}
                    openDrawerOnAdd
                    className="min-w-[200px] flex-1"
                  />
                </div>

                <p className="mt-5 text-[13px] font-bold text-mehndi-600">
                  Free shipping across India, on every order
                </p>
              </div>

              {/* promise tiles */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { Icon: FreshIcon, t: "Fried fresh", s: `Dispatch in ${site.shipping.dispatchDays}` },
                  { Icon: PackingIcon, t: "Breakage-safe", s: "Replace or refund promise" },
                  { Icon: TruckIcon, t: "Pan-India", s: `Delivered in ${site.shipping.deliveryDays}` },
                ].map(({ Icon, t, s }) => (
                  <div key={t} className="flex items-center gap-3 rounded-[20px] bg-white/60 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paan-900 text-kesariya-500">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span>
                      <span className="block text-[14px] font-bold text-paan-900">{t}</span>
                      <span className="block text-[12px] text-paan-700/60">{s}</span>
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-[17px] leading-[1.7] text-paan-700">{product.description}</p>

              <Accordion
                className="mt-8 space-y-3"
                items={[
                  {
                    title: "What's inside",
                    content: (
                      <div className="flex flex-wrap gap-2">
                        {product.ingredients.map((i) => (
                          <span key={i} className="rounded-full border border-pista-200 bg-pista-100 px-3 py-1.5 text-[14px] font-bold text-paan-900">
                            {i}
                          </span>
                        ))}
                      </div>
                    ),
                  },
                  {
                    title: "Shelf life & storage",
                    content: (
                      <p>
                        Stays khasta for {product.shelfLifeDays} days. Keep the jar closed, away from
                        direct sunlight. No fridge needed — no preservatives either.
                      </p>
                    ),
                  },
                  {
                    title: "Shipping & breakage promise",
                    content: (
                      <p>
                        Made fresh after you order and dispatched within {site.shipping.dispatchDays};
                        delivery takes {site.shipping.deliveryDays}. {site.breakagePromise}
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- why it tastes like home (dark band) ---------- */}
      <section className="relative overflow-hidden bg-paan-900 py-20 md:py-24">
        <div
          aria-hidden
          className="animate-pattern-drift pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "url(/images/svg/mould-pattern.svg)", backgroundSize: "220px 220px" }}
        />
        <div className="relative mx-auto max-w-[1280px] px-6">
          <SplitTextReveal
            as="h2"
            className="font-display max-w-2xl text-[clamp(32px,4vw,48px)] font-black leading-[1.05] text-kesariya-500"
          >
            Why it tastes like home.
          </SplitTextReveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyItems.map(({ Icon, title, copy }) => (
              <div
                key={title}
                className="group rounded-[24px] border border-pista-100/10 bg-paan-700/40 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-kesariya-500/40"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-kesariya-500 text-paan-900 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110">
                  <Icon className="h-8 w-8" />
                </span>
                <h3 className="font-display mt-5 text-[22px] font-black text-pista-100">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-pista-100/65">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- goes well with ---------- */}
      {others.length ? (
        <section className="grain relative py-20 md:py-24">
          <div className="mx-auto max-w-[1280px] px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-[clamp(30px,3.6vw,44px)] font-black leading-[1.05] text-paan-900">
                Goes well with
              </h2>
              <Link href="/shop" className="text-[15px] font-bold text-sindoor-600 hover:underline underline-offset-4">
                See all products →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <div key={p.slug} className="h-full">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------- review cards ---------- */}
      <section className="overflow-hidden pb-24" aria-label="Customer reviews">
        <Marquee duration={50} pauseOnHover ariaLabel="Customer reviews">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="mx-3 w-[300px] shrink-0 rounded-[24px] bg-white/70 p-6 shadow-[var(--shadow-light)]"
            >
              <Stars n={t.stars} />
              <blockquote className="mt-2 text-[15px] leading-relaxed text-paan-900">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-3 text-[13px] font-bold text-paan-700/60">
                {t.name} · {t.city}
              </figcaption>
            </figure>
          ))}
        </Marquee>
      </section>

      {/* ---------- mobile sticky buy bar ---------- */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[54] border-t border-pista-200 bg-pista-100/95 px-4 py-3 backdrop-blur-md transition-transform duration-300 lg:hidden ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!showBar}
      >
        <div className="flex items-center justify-between gap-3 pr-16">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-paan-900">{product.name}</p>
            <p className="text-[13px] text-paan-700/70">
              {formatINR(lineTotal)} · {variant.label}
            </p>
          </div>
          <AddToCart
            sku={variant.sku}
            productName={product.name}
            qty={qty}
            imageRef={imageRef}
            openDrawerOnAdd
            size="md"
          />
        </div>
      </div>
    </div>
  );
}
