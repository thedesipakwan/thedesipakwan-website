"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CartButton from "./CartButton";
import MobileMenu from "./MobileMenu";
import ChakliSpiral from "@/components/svg/ChakliSpiral";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Story" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  // Transparent nav only makes sense over the dark home hero; everywhere
  // else the bar is solid so cream links stay readable on light pages.
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);
      setHidden(y > 400 && y > lastY);
      lastY = y;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? y / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[60] transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav
        className={`transition-colors duration-300 ${
          scrolled || !overHero
            ? "bg-paan-900/90 shadow-[var(--shadow-dark)] backdrop-blur-md"
            : "bg-transparent"
        }`}
        aria-label="Main"
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:h-[72px]">
          <Link
            href="/"
            aria-label="The Desi Pakwan — home"
            className="shrink-0 transition-transform hover:scale-[1.03]"
          >
            <span className="relative block h-11 w-[103px] md:h-[52px] md:w-[122px]">
              <Image src="/images/logo-trim.webp" alt="The Desi Pakwan" fill priority sizes="122px" className="object-contain" />
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[15px] font-bold text-pista-100 transition-colors hover:text-kesariya-500"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {/* scroll progress chakli */}
            <div
              aria-hidden
              className={`mr-1 hidden h-6 w-6 text-kesariya-500 transition-opacity duration-300 md:block ${
                scrolled ? "opacity-100" : "opacity-0"
              }`}
              style={{ transform: `rotate(${progress * 720}deg)` }}
            >
              <ChakliSpiral className="h-full w-full" strokeWidth={9} />
            </div>
            <CartButton />
            <MobileMenu links={links} />
          </div>
        </div>
      </nav>
    </header>
  );
}
