import type { Metadata } from "next";
import { Caveat, Fraunces, Manrope, Noto_Sans_Devanagari } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import LenisProvider from "@/components/motion/LenisProvider";
import Navbar from "@/components/nav/Navbar";
import Footer from "@/components/nav/Footer";
import WhatsAppButton from "@/components/nav/WhatsAppButton";
import CartDrawer from "@/components/cart/CartDrawer";
import { Toaster } from "@/components/ui/Toast";
import { site } from "@/data/site";
import { organizationJsonLd } from "@/lib/seo";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "The Desi Pakwan — Handmade Thekua & Chakli, Shipped Across India",
  description: site.description,
  openGraph: {
    title: "The Desi Pakwan — Handmade Thekua & Chakli",
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    images: [{ url: `${site.url}/images/og-image.jpg`, width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        {/* Runs before first paint: hides the server-rendered preloader for
            repeat visits in this session (or reduced motion), so it never flashes.
            A <style> tag is used (not a class on <html>) because React can reset
            <html> attributes when it re-renders the document. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var h=true;try{h=!!sessionStorage.getItem("tdp-seen")||matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}if(h){var s=document.createElement("style");s.id="tdp-pre-hide";s.textContent="#tdp-preloader{display:none!important}";document.head.appendChild(s)}})()`,
          }}
        />
        <noscript>
          <style>{`.hero-pending .hero-bg,.hero-pending .hero-headline,.hero-pending .hero-sub,.hero-pending .hero-ctas,.hero-pending .hero-cue{opacity:1}`}</style>
        </noscript>
      </head>
      <body
        className={`${fraunces.variable} ${manrope.variable} ${devanagari.variable} ${caveat.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()).replace(/</g, "\\u003c") }}
        />
        <LenisProvider>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
          <Toaster />
        </LenisProvider>
        <Analytics />
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
