/** Accepts "9876543210", "+91 98765 43210", "09876543210" or "919876543210" → "919876543210". */
function normalizeIndianWhatsapp(raw: string | undefined): string {
  const digits = (raw ?? "").replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return "";
}

export const site = {
  name: "The Desi Pakwan",
  tagline: "Ghar ka khasta, ghar tak.",
  description:
    "Handmade thekua & chakli from a Bihari kitchen. Desi ghee. No maida, no palm oil, no preservatives. Shipped fresh across India.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://thedesipakwan.com",
  /** Public brand domain — used in emails even while testing on localhost. */
  publicUrl: "https://thedesipakwan.com",
  email: "info@thedesipakwan.com",
  // Set NEXT_PUBLIC_WHATSAPP in .env.local (e.g. 919876543210).
  whatsapp: normalizeIndianWhatsapp(process.env.NEXT_PUBLIC_WHATSAPP) || "919999999999",
  instagram: "https://instagram.com/thedesipakwan",
  fssai: "FSSAI Lic. No. 10000000000000 (to be updated)",
  hours: "Mon–Sat, 10 AM – 7 PM IST",
  city: "Patna", // jurisdiction city for terms

  shipping: {
    flat: 49,
    freeAbove: 499,
    dispatchDays: "2–3 working days",
    deliveryDays: "3–7 days",
  },

  breakagePromise:
    "If more than 20% of your order arrives broken, send a photo on WhatsApp within 24 hours of delivery and we ship a replacement free.",

  announcement:
    "Free shipping on orders above ₹499 · Made fresh after you order",
} as const;

export function waLink(text: string, phone: string = site.whatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
