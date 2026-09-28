"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Single-open accordion: opening one item closes the others. Height animates
 * via the grid-template-rows 0fr → 1fr technique, so it works for any
 * content length without measuring.
 */
export default function Accordion({
  items,
  defaultOpen = 0,
  className = "mt-8 space-y-3",
}: {
  items: { title: string; content: ReactNode }[];
  defaultOpen?: number | null;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div className={className}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div
            key={item.title}
            className={`rounded-[20px] border transition-all duration-400 ease-out ${
              isOpen
                ? "border-kesariya-500/40 bg-white shadow-[0_16px_40px_rgba(6,28,19,0.08)]"
                : "border-pista-200 bg-white/60 hover:border-paan-900/20"
            }`}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-bold text-paan-900"
              >
                {item.title}
                <span
                  aria-hidden
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[18px] transition-all duration-400 ease-out ${
                    isOpen ? "rotate-45 bg-kesariya-500 text-paan-900" : "bg-paan-900/5 text-paan-700"
                  }`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows] duration-400 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`px-6 pb-5 text-[15px] leading-relaxed text-paan-700/80 transition-all duration-400 ease-out ${
                    isOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                  }`}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
