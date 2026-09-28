import type { Metadata } from "next";
import Preloader from "@/components/home/Preloader";
import Hero from "@/components/home/Hero";
import Ingredients from "@/components/home/Ingredients";
import ProductShowcase from "@/components/home/ProductShowcase";
import MadeStory from "@/components/home/MadeStory";
import TrustStrip from "@/components/home/TrustStrip";
import ChaiMoment from "@/components/home/ChaiMoment";
import Testimonials from "@/components/home/Testimonials";
import Stories from "@/components/home/Stories";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "The Desi Pakwan — Buy Thekua & Chakli Online | Handmade in Bihar",
  description:
    "Buy thekua online — authentic Bihari thekua and chakli, handmade with desi ghee, 100% atta (no maida), no palm oil, no preservatives. Order for Chhath Puja, gifting, or chai time. Shipped fresh across India.",
  alternates: { canonical: site.url },
};

export default function HomePage() {
  return (
    <>
      <Preloader />
      <Hero />
      <Ingredients />
      <ProductShowcase />
      <MadeStory />
      <TrustStrip />
      <ChaiMoment />
      <Testimonials />
      <Stories />
    </>
  );
}
