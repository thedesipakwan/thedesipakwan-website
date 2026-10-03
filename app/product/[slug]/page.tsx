import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/data/products";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";
import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

const regionalNames: Record<string, string> = {
  thekua: "Also known as Thekua, Khajuria or Tikari",
  chakli: "Also known as Chakli, Murukku or Chakkuli",
  namkeen: "Also known as Namak Pare, Nimki or Namkeen Shakarpara",
  combo: "Thekua, chakli and namak pare combos",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return pageMetadata(
    product.name,
    `${product.tagline} ${regionalNames[product.family]}. Handmade with desi ghee, no preservatives, shipped fresh across India. From ₹${Math.min(...product.variants.map((v) => v.price))}.`,
    `/product/${product.slug}`
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const minPrice = Math.min(...product.variants.map((v) => v.price));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.images.map((i) => `${site.url}${i}`),
      brand: { "@type": "Brand", name: site.name },
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        lowPrice: minPrice,
        highPrice: Math.max(...product.variants.map((v) => v.price)),
        offerCount: product.variants.length,
        availability: product.variants.some((v) => v.inStock)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: `${site.url}/product/${product.slug}`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Shop", item: `${site.url}/shop` },
        { "@type": "ListItem", position: 3, name: product.name, item: `${site.url}/product/${product.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `How long does ${product.name} stay fresh?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${product.shelfLifeDays} days in a closed, airtight jar away from direct sunlight. No preservatives are used.`,
          },
        },
        {
          "@type": "Question",
          name: "How is it shipped?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Made fresh after you order, dispatched within ${site.shipping.dispatchDays}, delivered in ${site.shipping.deliveryDays}. Breakage-safe packing; free shipping across India.`,
          },
        },
        {
          "@type": "Question",
          name: "Is it vegetarian?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Everything is vegetarian, made in a home-style kitchen that handles wheat, dairy and nuts.",
          },
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
