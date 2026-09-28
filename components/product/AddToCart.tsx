"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { flyToCart } from "@/lib/flyToCart";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export default function AddToCart({
  sku,
  productName,
  qty = 1,
  imageRef,
  openDrawerOnAdd = false,
  size = "lg",
  className = "",
}: {
  sku: string;
  productName: string;
  qty?: number;
  /** The product image element the fly-to-cart clone starts from. */
  imageRef?: React.RefObject<HTMLElement | null>;
  openDrawerOnAdd?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const show = useToast((s) => s.show);
  const btnRef = useRef<HTMLButtonElement>(null);

  const onAdd = () => {
    add(sku, qty);
    flyToCart(imageRef?.current ?? null);
    if (!prefersReducedMotion() && btnRef.current) {
      gsap.fromTo(
        btnRef.current,
        { scale: 0.92 },
        { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }
      );
    }
    if (openDrawerOnAdd) {
      setTimeout(openDrawer, 650);
    } else {
      show(`${productName} added to cart`);
    }
  };

  return (
    <Button ref={btnRef} size={size} className={className} onClick={onAdd}>
      Add to cart
    </Button>
  );
}
