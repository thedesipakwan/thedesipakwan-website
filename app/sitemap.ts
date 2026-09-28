import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/shop", "/about", "/contact"].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const productPages = products.map((p) => ({
    url: `${site.url}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const policyPages = ["shipping", "refunds", "privacy", "terms"].map((p) => ({
    url: `${site.url}/policies/${p}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.3,
  }));

  return [...staticPages, ...productPages, ...policyPages];
}
