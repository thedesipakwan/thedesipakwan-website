import ChakliSpiral from "@/components/svg/ChakliSpiral";
import { MouldStamp } from "@/components/svg/MouldPattern";

/**
 * Layered animated background for dark hero sections: fading dot grid,
 * breathing glow, counter-rotating mould mandalas and drifting kitchen
 * motifs. Pure CSS motion (stops for reduced-motion). Place inside a
 * `relative overflow-hidden` section.
 */

type Motif = {
  kind: "chakli" | "mould" | "wheat";
  className: string;
  delay: string;
  opacity: number;
};

const motifs: Motif[] = [
  { kind: "chakli", className: "left-[7%] top-[22%] h-14 w-14", delay: "0s", opacity: 0.35 },
  { kind: "mould", className: "left-[14%] bottom-[18%] h-20 w-20", delay: "1.4s", opacity: 0.22 },
  { kind: "wheat", className: "left-[4%] top-[55%] h-16 w-10 hidden md:block", delay: "2.6s", opacity: 0.3 },
  { kind: "mould", className: "right-[9%] top-[20%] h-16 w-16", delay: "0.8s", opacity: 0.25 },
  { kind: "chakli", className: "right-[6%] bottom-[26%] h-20 w-20", delay: "2s", opacity: 0.3 },
  { kind: "wheat", className: "right-[17%] bottom-[12%] h-14 w-9 hidden md:block", delay: "3.2s", opacity: 0.28 },
  { kind: "chakli", className: "left-[30%] top-[12%] h-8 w-8 hidden lg:block", delay: "1s", opacity: 0.25 },
  { kind: "mould", className: "right-[30%] bottom-[8%] h-10 w-10 hidden lg:block", delay: "2.4s", opacity: 0.2 },
];

export default function PatternBackdrop({ mandalaSize = "lg" }: { mandalaSize?: "md" | "lg" }) {
  const outer = mandalaSize === "lg" ? "h-[680px] w-[680px] md:h-[820px] md:w-[820px]" : "h-[520px] w-[520px] md:h-[640px] md:w-[640px]";
  const inner = mandalaSize === "lg" ? "h-[380px] w-[380px] md:h-[460px] md:w-[460px]" : "h-[300px] w-[300px] md:h-[360px] md:w-[360px]";

  return (
    <>
      {/* dot grid, fading out from the centre */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(var(--kesariya-300) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 60% at center, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at center, black 20%, transparent 75%)",
        }}
      />

      {/* breathing glow */}
      <div
        aria-hidden
        className="animate-glow pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,138,60,0.16) 0%, rgba(255,138,60,0) 65%)" }}
      />

      {/* counter-rotating mould mandalas */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-spin-very-slow text-kesariya-500 opacity-[0.07]">
          <MouldStamp className={outer} />
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-spin-very-slow-reverse text-mehndi-300 opacity-[0.06]">
          <MouldStamp className={inner} />
        </div>
      </div>

      {/* drifting kitchen motifs */}
      {motifs.map((m, i) => (
        <div
          key={i}
          aria-hidden
          className={`animate-motif-drift pointer-events-none absolute text-kesariya-500 ${m.className}`}
          style={{ animationDelay: m.delay, opacity: m.opacity }}
        >
          {m.kind === "chakli" ? (
            <ChakliSpiral className="h-full w-full" strokeWidth={6} />
          ) : m.kind === "mould" ? (
            <MouldStamp className="h-full w-full" />
          ) : (
            <WheatMotif />
          )}
        </div>
      ))}

      {/* bottom fade into the next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paan-900 to-transparent"
      />
    </>
  );
}

function WheatMotif() {
  return (
    <svg viewBox="0 0 40 64" className="h-full w-full" fill="none" aria-hidden>
      <path d="M20 62 V14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {[0, 1, 2, 3].map((j) => (
        <g key={j}>
          <ellipse cx="14" cy={20 + j * 9} rx="5.5" ry="3.2" fill="currentColor" transform={`rotate(-35 14 ${20 + j * 9})`} />
          <ellipse cx="26" cy={20 + j * 9} rx="5.5" ry="3.2" fill="currentColor" transform={`rotate(35 26 ${20 + j * 9})`} />
        </g>
      ))}
      <ellipse cx="20" cy="10" rx="3.5" ry="6" fill="currentColor" />
    </svg>
  );
}
