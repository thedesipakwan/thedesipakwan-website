"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * Theme-styled, searchable replacement for a native <select> (whose option
 * list can't be coloured). Type to filter, arrows to move, Enter to pick.
 */
export default function StateSelect({
  label,
  options,
  value,
  onChange,
  onBlur,
  error,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query]
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onBlur]);

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
    onBlur?.();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      if (open && filtered[active]) {
        e.preventDefault();
        pick(filtered[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-bold text-paan-900">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-invalid={!!error}
          autoComplete="off"
          value={open ? query : value}
          placeholder={value || "Select…"}
          onFocus={() => {
            setOpen(true);
            setQuery("");
            setActive(Math.max(0, options.indexOf(value)));
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={onKey}
          className={`w-full rounded-[14px] border-2 bg-white px-4 py-3 pr-10 text-[16px] text-paan-900 placeholder:text-paan-700/40 transition-colors focus:outline-none ${
            error ? "border-sindoor-600/60" : "border-pista-200 focus:border-kesariya-500"
          }`}
        />
        <svg
          viewBox="0 0 12 8"
          className={`pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 text-paan-700 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {open ? (
        <ul
          id={`${id}-list`}
          ref={listRef}
          role="listbox"
          data-lenis-prevent
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl bg-paan-900 py-1.5 shadow-[var(--shadow-dark)]"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-2.5 text-[14px] text-pista-100/60">No match</li>
          ) : (
            filtered.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={o === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-[14px] font-bold ${
                  i === active ? "bg-paan-700 text-kesariya-300" : "text-pista-100/85"
                } ${o === value ? "text-kesariya-500" : ""}`}
              >
                {o}
                {o === value ? <span aria-hidden>✓</span> : null}
              </li>
            ))
          )}
        </ul>
      ) : null}

      {error ? <p className="mt-1 text-[14px] font-medium text-sindoor-600">{error}</p> : null}
    </div>
  );
}
