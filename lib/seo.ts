import type { Metadata } from "next";
import { site } from "@/data/site";

export function pageMetadata(title: string, description: string, path = ""): Metadata {
  const fullTitle = `${title} · The Desi Pakwan — Handmade Thekua & Chakli`;
  const url = `${site.url}${path}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: site.name,
      type: "website",
      images: [{ url: `${site.url}/images/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/images/logo-mark.png`,
    sameAs: [site.instagram],
    contactPoint: {
      "@type": "ContactPoint",
      email: site.email,
      contactType: "customer service",
      areaServed: "IN",
    },
  };
}
