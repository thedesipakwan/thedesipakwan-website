"use client";

import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Clones the product image and flies it along a bezier arc into the cart
 * icon. Pure decoration — cart state is updated by the caller regardless.
 */
export function flyToCart(sourceImg: HTMLElement | null) {
  if (!sourceImg || prefersReducedMotion()) return;
  const cartBtn = document.getElementById("cart-button");
  if (!cartBtn) return;

  const from = sourceImg.getBoundingClientRect();
  const to = cartBtn.getBoundingClientRect();

  const clone = sourceImg.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    borderRadius: "20px",
    zIndex: "96",
    pointerEvents: "none",
    margin: "0",
    objectFit: "cover",
  });
  document.body.appendChild(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const tl = gsap.timeline({ onComplete: () => clone.remove() });
  // Two-step arc: rise up-and-over, then drop into the cart while shrinking.
  tl.to(clone, {
    x: dx * 0.4,
    y: dy - 120,
    scale: 0.5,
    duration: 0.35,
    ease: "power2.out",
  }).to(clone, {
    x: dx,
    y: dy,
    scale: 0.08,
    opacity: 0.4,
    duration: 0.35,
    ease: "power2.in",
  });
}
