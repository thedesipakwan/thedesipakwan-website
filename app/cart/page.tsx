import { pageMetadata } from "@/lib/seo";
import CartPageClient from "./CartPageClient";

export const metadata = {
  ...pageMetadata(
    "Cart",
    "Your Desi Pakwan cart — review your thekua and chakli, then checkout securely with UPI, cards or netbanking.",
    "/cart"
  ),
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageClient />;
}
