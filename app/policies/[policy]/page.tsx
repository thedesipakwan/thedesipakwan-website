import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/data/site";

interface Policy {
  title: string;
  description: string;
  sections: { heading?: string; body: string[] }[];
}

const policies: Record<string, Policy> = {
  shipping: {
    title: "Shipping policy",
    description: "Dispatch in 2–3 working days, delivery in 3–7 days, free shipping above ₹499.",
    sections: [
      {
        body: [
          "Orders are made fresh and dispatched within 2–3 working days. Delivery takes 3–7 days depending on location.",
          `Shipping is ₹${site.shipping.flat}; free on orders above ₹${site.shipping.freeAbove}.`,
          "We ship across India via trusted courier partners and share tracking on email/WhatsApp.",
          "During festival weeks (Chhath, Diwali) dispatch can take an extra day or two — we'll tell you on WhatsApp if it does.",
        ],
      },
    ],
  },
  refunds: {
    title: "Refund & breakage policy",
    description: "No returns on fresh food, but broken or wrong orders are replaced free.",
    sections: [
      {
        body: [
          "Because every order is made fresh, we don't accept returns.",
          "If your order arrives damaged, with more than 20% broken pieces, send a photo on WhatsApp within 24 hours of delivery and we'll ship a replacement free.",
          "Wrong or missing items are replaced or refunded in full within 5–7 working days.",
          "Refunds, where applicable, go back to the original payment method via Razorpay.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    description: "We collect only what's needed to deliver your order. We never sell your data.",
    sections: [
      {
        body: [
          "We collect your name, phone, email and address only to deliver your order and send order updates.",
          "Payments are processed by Razorpay; we never see or store card details.",
          "We don't sell your data. Order details live in our payment dashboard and email — nowhere else.",
          `Contact us at ${site.email} to delete your information.`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms of service",
    description: "The plain-language terms for ordering from The Desi Pakwan.",
    sections: [
      {
        body: [
          "All products are vegetarian, made in a home-style kitchen that handles wheat, dairy and nuts. If you have a serious allergy, please don't risk it.",
          "Prices are in INR and include GST.",
          `Disputes are subject to ${site.city} jurisdiction.`,
          "By placing an order you agree to the shipping and refund policies above.",
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(policies).map((policy) => ({ policy }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ policy: string }>;
}): Promise<Metadata> {
  const { policy } = await params;
  const data = policies[policy];
  if (!data) return {};
  return pageMetadata(data.title, data.description, `/policies/${policy}`);
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ policy: string }>;
}) {
  const { policy } = await params;
  const data = policies[policy];
  if (!data) notFound();

  return (
    <div className="grain min-h-screen bg-pista-100 pb-24 pt-36">
      <div className="mx-auto max-w-[70ch] px-6">
        <h1 className="font-display text-[clamp(36px,5vw,56px)] font-black leading-[1.05] text-paan-900">
          {data.title}
        </h1>
        {data.sections.map((s, i) => (
          <section key={i} className="mt-8">
            {s.heading ? (
              <h2 className="font-display mb-3 text-[24px] font-bold text-paan-900">{s.heading}</h2>
            ) : null}
            {s.body.map((p, j) => (
              <p key={j} className="mb-4 text-[17px] leading-[1.7] text-paan-700">
                {p}
              </p>
            ))}
          </section>
        ))}
        <p className="mt-12 text-[14px] text-paan-700/60">
          Questions? Email {site.email} or message us on WhatsApp.
        </p>
      </div>
    </div>
  );
}
