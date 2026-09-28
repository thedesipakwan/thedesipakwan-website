import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import SuccessClient from "./SuccessClient";

export const metadata = {
  ...pageMetadata("Order placed", "Your Desi Pakwan order is confirmed.", "/order/success"),
  robots: { index: false },
};

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <SuccessClient />
    </Suspense>
  );
}
