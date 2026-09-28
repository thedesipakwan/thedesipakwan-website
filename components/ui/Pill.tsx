"use client";

export function Pill({
  active = false,
  onClick,
  children,
  className = "",
  onDark = false,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  onDark?: boolean;
}) {
  const idle = onDark
    ? "border-pista-100/30 text-pista-100 hover:border-kesariya-500 hover:text-kesariya-500"
    : "border-paan-900/25 text-paan-900 hover:border-paan-900";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 shrink-0 rounded-full border-2 px-5 text-[15px] font-bold transition-colors duration-200 ${
        active ? "border-paan-900 bg-paan-900 text-kesariya-500" : idle
      } ${className}`}
    >
      {children}
    </button>
  );
}
