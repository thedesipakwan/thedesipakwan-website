import { pageMetadata } from "@/lib/seo";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  ...pageMetadata(
    "Checkout",
    "Secure checkout — pay by UPI, card or netbanking via Razorpay. Free shipping above ₹499.",
    "/checkout"
  ),
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
