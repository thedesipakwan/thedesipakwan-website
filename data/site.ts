/** Accepts "9876543210", "+91 98765 43210", "09876543210" or "919876543210" → "919876543210". */
function normalizeIndianWhatsapp(raw: string | undefined): string {
  const digits = (raw ?? "").replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return "";
}

/** Owner: your FSSAI registration number (14 digits). */
const fssaiNumber = "22726446003880";

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
  fssaiNumber,
  fssai: fssaiNumber ? `FSSAI Reg. No. ${fssaiNumber}` : "FSSAI Reg. No. (to be updated)",
  hours: "Mon–Sat, 10 AM – 7 PM IST",
  // jurisdiction for the terms (district courts for Greater Noida)
  city: "Gautam Buddh Nagar",
  state: "Uttar Pradesh",

  shipping: {
    // shipping is free on every order (see lib/pricing.ts shippingFor)
    dispatchDays: "2–3 working days",
    deliveryDays: "5–7 working days",
    deliveryDaysRemote: "7–10 working days",
  },

  breakagePromise:
    "If your order arrives broken or crushed, send photos on WhatsApp within 24 hours of delivery and we'll send a replacement or refund the affected item.",

  /** "Last updated" date on the privacy policy. Owner: set this to the launch date. */
  policiesUpdated: "3 October 2026",

  /** Shown on the policy pages. Owner: add the registered business name and full address;
   *  each line appears on the site once it's filled in. */
  business: {
    legalName: "",
    address: "Paramount Golfforeste, Greater Noida, Gautam Buddh Nagar, Uttar Pradesh 201306",
  },
  grievanceOfficer: {
    name: "Mamta Sinha",
  },

  announcement:
    "Free shipping across India · Made fresh after you order",
} as const;

export function waLink(text: string, phone: string = site.whatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
