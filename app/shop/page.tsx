import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import ShopClient from "./ShopClient";

export const metadata = pageMetadata(
  "Shop",
  "All Desi Pakwan products — gud thekua, cheeni thekua, chakli and namak pare. Handmade with desi ghee, no preservatives, shipped fresh across India.",
  "/shop"
);

export default function ShopPage() {
  return (
    <Suspense>
      <ShopClient />
    </Suspense>
  );
}
