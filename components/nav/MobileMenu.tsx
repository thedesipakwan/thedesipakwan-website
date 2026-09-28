"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { site, waLink } from "@/data/site";

export default function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // close when the route changes
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Rendered into <body>: the navbar's slide transform would otherwise trap
  // this fixed overlay inside the thin navbar strip.
  const overlay = (
    <div
      className={`fixed inset-0 z-[58] bg-paan-900 pt-20 transition-opacity duration-300 md:hidden ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <nav className="flex flex-col px-6 pt-6" aria-label="Mobile">
        {[{ href: "/", label: "Home" }, ...links].map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
            className={`font-display border-b border-pista-100/10 py-4 text-[34px] font-bold transition-all duration-300 hover:text-kesariya-500 ${
              pathname === l.href ? "text-kesariya-500" : "text-pista-100"
            } ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="px-6 pt-10">
        <a
          href={waLink("Hi Desi Pakwan! I have a question.")}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={open ? 0 : -1}
          className="inline-flex h-12 items-center rounded-full bg-mehndi-600 px-6 text-[15px] font-bold text-white"
        >
          WhatsApp us
        </a>
        <p className="mt-4 text-[13px] text-pista-100/50">{site.hours}</p>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative z-[60] flex h-11 w-11 items-center justify-center rounded-full text-pista-100"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          {open ? <path d="M6 6 L18 18 M18 6 L6 18" /> : <path d="M4 7 h16 M4 12 h16 M4 17 h10" />}
        </svg>
      </button>
      {mounted ? createPortal(overlay, document.body) : null}
    </div>
  );
}
