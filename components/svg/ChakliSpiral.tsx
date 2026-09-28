/** Single-stroke Archimedean spiral — the chakli. Used as spinner, bullet, progress ring. */

function spiralPath(cx: number, cy: number, turns = 3.25, spacing = 6.2, step = 0.18): string {
  let d = `M ${cx} ${cy}`;
  for (let t = step; t <= turns * Math.PI * 2; t += step) {
    const r = spacing * (t / (Math.PI * 2)) * 2 + 1.5;
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

export const CHAKLI_PATH = spiralPath(50, 50);

export default function ChakliSpiral({
  className = "",
  strokeWidth = 5,
  title,
}: {
  className?: string;
  strokeWidth?: number;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path
        d={CHAKLI_PATH}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
