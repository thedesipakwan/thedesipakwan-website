import Image from "next/image";
import Link from "next/link";
import { site, waLink } from "@/data/site";
import { MouldDivider } from "@/components/svg/MouldPattern";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-paan-900 pt-20 text-pista-100">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-6 gap-y-10 px-6 pb-12 md:grid-cols-4 md:gap-12">
        <div className="col-span-2">
          <Link
            href="/"
            aria-label="The Desi Pakwan — home"
            className="inline-block"
          >
            <span className="relative block h-[88px] w-[180px]">
              <Image src="/images/logo-trim.webp" alt="The Desi Pakwan" fill sizes="180px" className="object-contain" />
            </span>
          </Link>
          <p className="mt-2 max-w-sm text-[15px] text-pista-100/70">
            Handmade thekua & chakli from a Bihari kitchen. Made fresh after you order, shipped
            across India.
          </p>
          <p className="mt-4 text-[13px] text-pista-100/50">{site.fssai}</p>

          <p className="mb-2 mt-8 text-[14px] font-bold text-pista-100/70">
            New batches, festival boxes, no spam:
          </p>
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent("Add me to the Desi Pakwan list")}`}
            className="inline-flex items-center gap-2 rounded-full border-2 border-pista-100/25 px-5 py-2.5 text-[15px] font-bold text-pista-100 hover:border-kesariya-500 hover:text-kesariya-500"
          >
            Join by email →
          </a>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2.5 text-[15px]">
          <p className="mb-1 font-bold text-kesariya-500">Explore</p>
          <Link className="hover:text-kesariya-300" href="/shop">Shop</Link>
          <Link className="hover:text-kesariya-300" href="/about">Our story</Link>
          <Link className="hover:text-kesariya-300" href="/contact">Contact</Link>
          <Link className="hover:text-kesariya-300" href="/cart">Cart</Link>
        </nav>

        <div className="flex flex-col gap-2.5 text-[15px]">
          <p className="mb-1 font-bold text-kesariya-500">Help</p>
          <Link className="hover:text-kesariya-300" href="/policies/shipping">Shipping</Link>
          <Link className="hover:text-kesariya-300" href="/policies/refunds">Refunds & breakage</Link>
          <Link className="hover:text-kesariya-300" href="/policies/privacy">Privacy</Link>
          <Link className="hover:text-kesariya-300" href="/policies/terms">Terms</Link>
          <SocialLinks className="mt-3 hidden md:flex" />
        </div>

        {/* on phones the buttons get their own full-width row under both lists */}
        <SocialLinks className="col-span-2 flex md:hidden" />
      </div>

      <MouldDivider className="text-kesariya-500" />

      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-6 pb-6 pt-4 text-[13px] text-pista-100/50">
        <p>© {new Date().getFullYear()} The Desi Pakwan. Ghar ka khasta, ghar tak.</p>
        <p>Made with desi ghee in Bihar.</p>
      </div>
    </footer>
  );
}

function SocialLinks({ className }: { className: string }) {
  return (
    <div className={`gap-3 ${className}`}>
      <a
        href={waLink("Hi Desi Pakwan!")}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border-2 border-mehndi-600 px-4 py-1.5 text-[13px] font-bold text-mehndi-300 hover:bg-mehndi-600 hover:text-white"
      >
        WhatsApp
      </a>
      <a
        href={site.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border-2 border-kesariya-500 px-4 py-1.5 text-[13px] font-bold text-kesariya-500 hover:bg-kesariya-500 hover:text-paan-900"
      >
        Instagram
      </a>
    </div>
  );
}