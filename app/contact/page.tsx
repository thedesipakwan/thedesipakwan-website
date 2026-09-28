import { pageMetadata } from "@/lib/seo";
import { site, waLink } from "@/data/site";
import SplitTextReveal from "@/components/motion/SplitTextReveal";
import PatternBackdrop from "@/components/motion/PatternBackdrop";
import { MouldDivider } from "@/components/svg/MouldPattern";
import ContactForm, { WhatsAppGlyph } from "./ContactForm";
import Faq from "./Faq";

export const metadata = pageMetadata(
  "Contact",
  "Questions about your order, bulk gifting or Chhath pre-orders — reach The Desi Pakwan on WhatsApp or email.",
  "/contact"
);

const handle = `@${site.instagram.split("/").filter(Boolean).pop()}`;

const channels = [
  {
    title: "WhatsApp",
    value: "Chat with us",
    hint: "Fastest way to reach us",
    href: waLink("Hi Desi Pakwan! I have a question."),
    external: true,
    icon: <WhatsAppGlyph className="h-7 w-7" />,
    accent: "bg-mehndi-600 text-white",
  },
  {
    title: "Email",
    value: "Email us",
    hint: site.email,
    href: `mailto:${site.email}`,
    external: false,
    icon: <MailIcon />,
    accent: "bg-kesariya-500 text-paan-900",
  },
  {
    title: "Instagram",
    value: handle,
    hint: "Fresh batches & behind the scenes",
    href: site.instagram,
    external: true,
    icon: <InstaIcon />,
    accent: "bg-sindoor-600 text-pista-100",
  },
];

const faqs = [
  {
    q: "How soon will my order ship?",
    a: `Everything is made fresh after you order and dispatched within ${site.shipping.dispatchDays}. Delivery then takes ${site.shipping.deliveryDays} depending on your city.`,
  },
  {
    q: "What if it arrives broken?",
    a: site.breakagePromise,
  },
  {
    q: "How long does it stay fresh?",
    a: "Thekua stays khasta for about 40 days and chakli and namak pare for about 30 — keep the jar closed and away from direct sunlight. No preservatives, so no fridge needed.",
  },
  {
    q: "Do you take bulk or festival orders?",
    a: "Yes — for Chhath, Diwali, weddings or corporate gifting, message us on WhatsApp with the products, quantity and date and we'll send a quote.",
  },
  {
    q: "Is shipping free?",
    a: `Shipping is ₹${site.shipping.flat}, and free on orders above ₹${site.shipping.freeAbove}. We ship across India.`,
  },
];

export default function ContactPage() {
  return (
    <div className="bg-paan-900">
      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden bg-paan-900 px-6 pb-24 pt-40">
        <PatternBackdrop mandalaSize="md" />

        <div className="relative z-10 mx-auto flex max-w-[1080px] flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-kesariya-500/30 bg-paan-700/40 px-4 py-1.5 text-[13px] font-bold tracking-wide text-kesariya-300 backdrop-blur-sm">
            <span className="font-devanagari">बात करें?</span>
            <span className="h-1 w-1 rounded-full bg-kesariya-500" />
            Get in touch
          </span>

          <SplitTextReveal
            as="h1"
            className="font-display mt-7 text-[clamp(46px,7vw,92px)] font-black leading-[0.98] text-kesariya-500"
          >
            Say namaste.
          </SplitTextReveal>

          <SplitTextReveal
            as="p"
            className="mt-6 max-w-[52ch] text-[18px] leading-[1.65] text-pista-100/80"
            delay={0.15}
          >
            Order questions, bulk gifting, Chhath pre-orders — or just to tell us your nani makes it
            better. She probably does.
          </SplitTextReveal>

          {/* channel cards */}
          <div className="mt-12 grid w-full gap-4 md:grid-cols-3">
            {channels.map((c) => (
              <a
                key={c.title}
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className="group relative flex items-center gap-4 overflow-hidden rounded-[24px] border border-pista-100/10 bg-paan-700/40 p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-kesariya-500/50 hover:bg-paan-700/70 hover:shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 ${c.accent}`}
                >
                  {c.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold tracking-wide text-kesariya-300/80">
                    {c.title}
                  </span>
                  <span className="block truncate text-[17px] font-bold text-pista-100">{c.value}</span>
                  <span className="block text-[13px] text-pista-100/55">{c.hint}</span>
                </span>
                <span
                  aria-hidden
                  className="ml-auto text-[20px] text-kesariya-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2"
                >
                  →
                </span>
              </a>
            ))}
          </div>

          <p className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-paan-700/40 px-5 py-2 text-[14px] font-bold text-pista-100/75">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mehndi-300 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mehndi-300" />
            </span>
            Kitchen hours: {site.hours}
          </p>
        </div>
      </section>

      <MouldDivider className="text-kesariya-500" />

      {/* ---------- form + FAQ ---------- */}
      <section className="grain relative bg-pista-100 py-20 md:py-28">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          <ContactForm />

          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-paan-900/5 px-4 py-1.5 text-[13px] font-bold tracking-wide text-mehndi-600">
              <span className="h-1.5 w-1.5 rounded-full bg-kesariya-500" />
              Before you ask
            </span>
            <h2 className="font-display mt-5 text-[clamp(30px,3.6vw,44px)] font-black leading-[1.05] text-paan-900">
              Quick answers
            </h2>

            <Faq items={faqs} />
          </div>
        </div>
      </section>
    </div>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function InstaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}
