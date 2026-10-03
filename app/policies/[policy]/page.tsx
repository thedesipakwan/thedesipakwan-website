import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/data/site";

interface Policy {
  title: string;
  description: string;
  /** shown under the title, e.g. "Last updated: …" */
  updated?: string;
  /** a string is a paragraph; a string[] is a bulleted list */
  sections: { heading?: string; body: (string | string[])[] }[];
}

// "919876543210" → "+91 98765 43210"
const displayPhone = `+${site.whatsapp.slice(0, 2)} ${site.whatsapp.slice(2, 7)} ${site.whatsapp.slice(7)}`;

// "Business name, full address" — left out until the owner fills it in (data/site.ts)
const businessLine = [[site.business.legalName, site.business.address].filter(Boolean).join(", ")].filter(Boolean);

const policies: Record<string, Policy> = {
  shipping: {
    title: "Shipping policy",
    description:
      "Free shipping across India on every order. Dispatched in 2–3 working days, delivered in 5–10 working days.",
    sections: [
      {
        heading: "Free shipping across India",
        body: [
          "Shipping is free on every order, with no minimum order value. The price you see is the price you pay.",
        ],
      },
      {
        heading: "When your order is dispatched",
        body: [
          `Every order is made fresh after you place it, so we dispatch within ${site.shipping.dispatchDays}.`,
        ],
      },
      {
        heading: "Delivery time",
        body: [
          `Cities and urban areas: ${site.shipping.deliveryDays}`,
          `Rural and remote areas: ${site.shipping.deliveryDaysRemote}`,
        ],
      },
      {
        heading: "Our courier partners",
        body: [
          "We ship through trusted courier partners: Delhivery, DTDC and Shree Tirupati Courier Services. The partner is chosen based on your PIN code, so your parcel reaches you safely and on time.",
        ],
      },
      {
        heading: "Tracking your order",
        body: [
          "Once your order is dispatched, we'll send you the tracking details on email or WhatsApp.",
        ],
      },
      {
        heading: "Where we deliver",
        body: [
          "We currently deliver only within India. If your PIN code isn't serviceable, we'll let you know and refund your order in full.",
        ],
      },
      {
        heading: "Festival season",
        body: [
          "During festival weeks like Chhath and Diwali, dispatch can take an extra day or two. We'll tell you on WhatsApp if it does.",
        ],
      },
      {
        heading: "Correct address, please",
        body: [
          "Please double-check your address, PIN code and phone number at checkout. We can't be responsible for delays or failed deliveries caused by incorrect details.",
        ],
      },
      {
        heading: "Delays outside our control",
        body: [
          "Sometimes weather, strikes, or courier issues can delay delivery. We'll stay in touch with the courier and keep you updated.",
        ],
      },
    ],
  },
  refunds: {
    title: "Refund & breakage policy",
    description:
      "Cancel within 2 hours for a full refund. Broken, wrong or missing items are replaced or refunded.",
    sections: [
      {
        body: [
          "Every Desi Pakwan order is made fresh after you place it, so we can't take back food once it has left our kitchen. But if something isn't right, we'll make it right.",
        ],
      },
      {
        heading: "Cancelling an order",
        body: [
          "You can cancel within 2 hours of placing your order for a full refund. Just message us on WhatsApp or email us with your order ID. After that, your order is usually being prepared, so we're unable to cancel it.",
        ],
      },
      {
        heading: "Damaged or broken items",
        body: [
          "If your order arrives noticeably broken, crushed, or with a damaged box, send us photos on WhatsApp within 24 hours of delivery. We'll send a replacement or refund the affected item.",
        ],
      },
      {
        heading: "Wrong or missing items",
        body: [
          "If you received the wrong product or something is missing, tell us within 24 hours of delivery with a photo of what arrived. We'll send the correct item or refund it.",
        ],
      },
      {
        heading: "Quality concerns",
        body: [
          "If anything tastes stale, smells off, or contains something it shouldn't, please don't eat it. Message us within 24 hours of delivery with photos and your order ID. We'll replace or refund it.",
          "We can't offer refunds just because a product wasn't to your taste. Our products contain wheat and ghee and may contain nuts and sesame, so please check the ingredients if you have allergies.",
        ],
      },
      {
        heading: "Delivery problems",
        body: [
          "If your parcel is lost, or shows \"delivered\" but never reached you, contact us within 3 days and we'll check with the courier and then reship or refund.",
          "If a parcel comes back to us because of a wrong address or because nobody was available to receive it, we can reship it once you pay the shipping again. Since our food is perishable, we can't refund returned parcels.",
        ],
      },
      {
        heading: "Payment issues",
        body: [
          "If money was deducted but your order didn't go through, or you were charged twice, the amount is reversed automatically by Razorpay, usually within 5–7 working days. If it isn't, message us with your payment ID.",
        ],
      },
      {
        heading: "How to reach us",
        body: [
          `WhatsApp: ${displayPhone} · Email: ${site.email}`,
          "Share your order ID, a short description and photos. We reply within 24 hours on working days.",
        ],
      },
      {
        heading: "Refund timelines",
        body: [
          "Approved refunds go back to your original payment method. UPI refunds usually arrive in 2–3 working days; cards and net banking take 5–7 working days, depending on your bank.",
        ],
      },
      {
        heading: "Grievance officer",
        body: [
          `${site.grievanceOfficer.name} · ${site.email} · ${displayPhone}`,
          ...businessLine,
          "We acknowledge every complaint within 24 hours on working days and aim to resolve it within 15 days.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    description:
      "We collect only what we need to make and deliver your order. We never sell your data.",
    updated: site.policiesUpdated,
    sections: [
      {
        body: [
          "At The Desi Pakwan, we collect only what we need to make and deliver your order. This policy explains what we collect, why, who we share it with, and the choices you have.",
        ],
      },
      {
        heading: "What we collect",
        body: [
          "When you place an order, we collect:",
          [
            "Your name, phone number and email address",
            "Your delivery address and PIN code",
            "Any delivery note you add",
            "Your order details (products, quantities, amount paid) and payment reference ID",
          ],
          "When you browse our website, basic technical information such as your device type, browser and approximate location may be recorded by our hosting and analytics providers. This doesn't identify you personally.",
        ],
      },
      {
        heading: "What we don't collect",
        body: [
          "We never see or store your card, UPI or bank details. Payments are handled entirely by Razorpay, a secure, RBI-authorised payment gateway.",
        ],
      },
      {
        heading: "Why we use your information",
        body: [
          [
            "To prepare, pack and deliver your order",
            "To send order confirmations, dispatch and tracking updates by email or WhatsApp",
            "To respond to your questions, complaints and refund requests",
            "To keep records required by tax and accounting laws",
          ],
          "We'll send you offers or promotional messages only if you've agreed to receive them, and you can stop them anytime.",
        ],
      },
      {
        heading: "Who we share it with",
        body: [
          "We share your information only with the services needed to complete your order:",
          [
            "Razorpay — to process your payment",
            "Our courier partners (Delhivery, DTDC, Shree Tirupati Courier Services) — your name, address and phone number, to deliver your parcel",
            "Our email and hosting providers — to run the website and send order emails",
          ],
          "We do not sell, rent or trade your personal information to anyone.",
        ],
      },
      {
        heading: "Where your information is stored",
        body: [
          "Your order details are stored in our payment dashboard (Razorpay) and our business email. Some of our service providers may process data on servers outside India, with appropriate security measures in place.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "We keep your order information for as long as needed to complete your order, handle any issues, and meet legal requirements such as GST record-keeping. After that, we delete it.",
        ],
      },
      {
        heading: "Cookies and browser storage",
        body: [
          "Our website saves your cart in your own browser so it isn't lost if you refresh the page. We may also use basic analytics to understand how visitors use the site, so we can improve it. We don't use advertising or tracking cookies.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask us to:",
          [
            "Tell you what information we hold about you",
            "Correct anything that's wrong or out of date",
            "Delete your information (except what we must keep by law)",
            "Stop sending you promotional messages",
          ],
          `To make a request, email ${site.email}. We'll reply within 24 hours on working days and complete your request within 15 days.`,
        ],
      },
      {
        heading: "Children",
        body: [
          "Our website is meant for adults. If you're under 18, please place orders with the help of a parent or guardian.",
        ],
      },
      {
        heading: "Changes to this policy",
        body: ["If we update this policy, we'll change the date at the top of this page."],
      },
      {
        heading: "Grievance officer",
        body: [
          "If you have any concern about how your information is handled, contact:",
          `${site.grievanceOfficer.name}, Grievance Officer`,
          `Email: ${site.email} · Phone/WhatsApp: ${displayPhone}`,
          ...businessLine,
        ],
      },
    ],
  },
  terms: {
    title: "Terms of service",
    description: "The plain-language terms for ordering from The Desi Pakwan.",
    updated: site.policiesUpdated,
    sections: [
      {
        body: [
          "Welcome to The Desi Pakwan. By using this website or placing an order, you agree to these terms. Please read them along with our Shipping, Refund & Breakage, and Privacy policies.",
        ],
      },
      {
        heading: "About us",
        body: [
          [
            site.business.legalName
              ? `The Desi Pakwan is run by ${businessLine[0]}.`
              : site.business.address
                ? `The Desi Pakwan is based at ${site.business.address}.`
                : "",
            site.fssaiNumber ? `FSSAI Registration No. ${site.fssaiNumber}.` : "",
          ]
            .filter(Boolean)
            .join(" ") || "The Desi Pakwan makes handmade Bihari snacks and ships them across India.",
        ],
      },
      {
        heading: "Our products",
        body: [
          [
            "All our products are vegetarian and handmade in small batches.",
            "They are made in a kitchen that handles wheat, dairy (ghee), nuts and sesame. If you have a serious allergy, please don't risk it.",
            "Because everything is handmade, shape, size, colour and pattern may vary slightly from the photos on our website. Photos are for illustration.",
            "Each product's shelf life and storage instructions are shown on the product page and the pack. Please store as directed and consume before the best-before date.",
          ],
        ],
      },
      {
        heading: "Prices and payment",
        body: [
          [
            "All prices are in Indian Rupees (INR) and include all applicable taxes.",
            "Shipping is free on all orders within India.",
            "All orders are prepaid through Razorpay. Cash on Delivery is not available.",
            "Prices may change from time to time, but the price shown when you place your order is the price you pay.",
          ],
        ],
      },
      {
        heading: "Placing an order",
        body: [
          [
            "Your order is confirmed once your payment is successful and you receive our confirmation email.",
            "If a product is unavailable, or a price was shown incorrectly because of a technical error, we may cancel the order and refund you in full.",
            "You must be 18 or older to place an order, or order with the help of a parent or guardian.",
            "Please make sure your name, phone number and address are correct. We're not responsible for delays or failed deliveries caused by incorrect details.",
          ],
        ],
      },
      {
        heading: "Cancellations, refunds and delivery",
        body: [
          "Cancellations, refunds, replacements and delivery timelines are explained in our Refund & Breakage Policy and Shipping Policy, which form part of these terms.",
        ],
      },
      {
        heading: "Use of our website",
        body: [
          "All content on this website, including our name, logo, photos, illustrations and text, belongs to The Desi Pakwan. Please don't copy or use it without our written permission.",
        ],
      },
      {
        heading: "Our responsibility",
        body: [
          "We take great care in making and packing every order. Our responsibility for any order is limited to the amount you paid for it. We're not responsible for delays caused by courier partners, weather, or events outside our control, though we'll always help you sort them out.",
        ],
      },
      {
        heading: "Changes to these terms",
        body: [
          "We may update these terms from time to time. The date at the top of this page shows when they were last changed.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          `These terms are governed by the laws of India. Any disputes are subject to the courts of ${site.city}, ${site.state}.`,
        ],
      },
      {
        heading: "Contact and grievances",
        body: [
          `Email ${site.email} or message us on WhatsApp at ${displayPhone}.`,
          `Grievance Officer: ${site.grievanceOfficer.name} · ${site.email} · ${displayPhone}`,
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
        {data.updated ? (
          <p className="mt-3 text-[14px] text-paan-700/60">Last updated: {data.updated}</p>
        ) : null}
        {data.sections.map((s, i) => (
          <section key={i} className="mt-8">
            {s.heading ? (
              <h2 className="font-display mb-3 text-[24px] font-bold text-paan-900">{s.heading}</h2>
            ) : null}
            {s.body.map((p, j) =>
              Array.isArray(p) ? (
                <ul key={j} className="mb-4 list-disc space-y-1.5 pl-6 text-[17px] leading-[1.7] text-paan-700 marker:text-kesariya-500">
                  {p.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={j} className="mb-4 text-[17px] leading-[1.7] text-paan-700">
                  {p}
                </p>
              ),
            )}
          </section>
        ))}
        <p className="mt-12 text-[14px] text-paan-700/60">
          Questions? Email {site.email} or message us on WhatsApp.
        </p>
      </div>
    </div>
  );
}
