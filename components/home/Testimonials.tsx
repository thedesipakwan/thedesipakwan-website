import Marquee from "./Marquee";
import { testimonials, type Testimonial } from "@/data/testimonials";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5 text-kesar-400" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-4 w-4 ${i < n ? "" : "opacity-25"}`} fill="currentColor" aria-hidden>
          <path d="M10 1.5 12.6 7l6 .6-4.5 4 1.3 5.9L10 14.4 4.6 17.5 5.9 11.6 1.4 7.6l6-.6Z" />
        </svg>
      ))}
    </span>
  );
}

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="mx-3 w-[300px] shrink-0 rounded-[28px] bg-white/70 p-6 shadow-[var(--shadow-light)] md:w-[340px]">
      <Stars n={t.stars} />
      <blockquote className="mt-3 text-[16px] leading-relaxed text-paan-900">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-3 text-[14px] font-bold text-paan-700/70">
        {t.name} · {t.city}
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const rowA = testimonials.filter((_, i) => i % 2 === 0);
  const rowB = testimonials.filter((_, i) => i % 2 === 1);

  return (
    <section className="grain overflow-hidden bg-pista-100 pb-20 pt-4 md:pb-32" aria-label="Customer reviews">
      <div className="mx-auto mb-10 max-w-[1280px] px-6">
        <h2 className="font-display text-[clamp(34px,4.5vw,48px)] font-black leading-[1.05] text-paan-900">
          People keep reordering
        </h2>
      </div>
      <div className="flex flex-col gap-6">
        <Marquee duration={45} pauseOnHover ariaLabel="Customer reviews, row one">
          {rowA.map((t) => (
            <Card key={t.name} t={t} />
          ))}
        </Marquee>
        <Marquee duration={45} reverse pauseOnHover ariaLabel="Customer reviews, row two">
          {rowB.map((t) => (
            <Card key={t.name} t={t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
