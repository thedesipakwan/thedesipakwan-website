"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-[transform,background-color,color,box-shadow] duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-sindoor-600 text-pista-100 hover:scale-[1.03] hover:shadow-[0_0_0_2px_var(--kesariya-500)]",
  secondary:
    "border-2 border-kesariya-500 text-kesariya-500 hover:bg-kesariya-500 hover:text-paan-900",
  ghost: "text-pista-100 hover:text-kesariya-500",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-6 text-[15px]",
  lg: "h-14 px-8 text-[17px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "lg", className = "", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
});

export function ButtonLink({
  variant = "primary",
  size = "lg",
  className = "",
  href,
  children,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  href: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
