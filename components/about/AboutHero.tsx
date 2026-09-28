import SplitTextReveal from "@/components/motion/SplitTextReveal";
import PatternBackdrop from "@/components/motion/PatternBackdrop";
import ChakliSpiral from "@/components/svg/ChakliSpiral";

/** About page hero: centred copy over the shared animated pattern backdrop. */

const stats = [
  { value: "3", label: "ingredients" },
  { value: "0", label: "preservatives" },
  { value: "2–3", label: "days to dispatch" },
];

export default function AboutHero() {
  return (
    <section className="relative flex min-h-[92svh] items-center justify-center overflow-hidden bg-paan-900 px-6 pb-20 pt-36">
      <PatternBackdrop />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-kesariya-500/30 bg-paan-700/40 px-4 py-1.5 text-[13px] font-bold tracking-wide text-kesariya-300 backdrop-blur-sm">
          <span className="font-devanagari">हमारी कहानी</span>
          <span className="h-1 w-1 rounded-full bg-kesariya-500" />
          Our story
        </span>

        <SplitTextReveal
          as="h1"
          className="font-display mt-7 text-[clamp(42px,6.5vw,84px)] font-black leading-[1.0] text-kesariya-500"
        >
          From a kitchen in Bihar to your doorstep
        </SplitTextReveal>

        <SplitTextReveal
          as="p"
          className="mt-7 max-w-[60ch] text-[18px] leading-[1.65] text-pista-100/80"
          delay={0.15}
        >
          The Desi Pakwan started in a kitchen in Bihar, with a mould that&apos;s older than the
          founder. We make thekua the way it was always made — atta, gud, ghee, patience — and chakli
          that doesn&apos;t taste like a factory. Every pack is made after you order and shipped
          within three days.
        </SplitTextReveal>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-baseline gap-2 rounded-2xl border border-pista-100/10 bg-paan-700/40 px-5 py-3 backdrop-blur-sm"
            >
              <span className="font-display text-[28px] font-black leading-none text-kesariya-500">
                {s.value}
              </span>
              <span className="text-[14px] font-bold text-pista-100/70">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12" aria-hidden>
          <ChakliSpiral className="animate-spin-slow h-8 w-8 text-kesariya-500/60" strokeWidth={7} />
        </div>
      </div>
    </section>
  );
}
