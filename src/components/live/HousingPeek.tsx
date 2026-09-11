import { readHousingSnapshot } from "@/lib/live/housing";

/** Static Helsinki €/m² sparkline for portfolio tiles — no keys. */
export function HousingPeek() {
  const snap = readHousingSnapshot();
  const hki = snap?.regions.find((r) => r.id === "091");
  const points =
    hki?.monthly
      .filter((p) => p.eurM2 !== null)
      .map((p) => p.eurM2 as number) ?? [];

  if (points.length < 2) {
    return (
      <div className="flex h-full w-full items-end gap-1 bg-void-800 px-4 pb-4 pt-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-neon-cyan/20"
            style={{ height: `${30 + ((i * 17) % 50)}%` }}
          />
        ))}
      </div>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const W = 320;
  const H = 180;
  const pad = 12;
  const xs = points.map((_, i) =>
    points.length === 1
      ? W / 2
      : pad + (i / (points.length - 1)) * (W - pad * 2),
  );
  const ys = points.map(
    (v) => pad + (1 - (v - min) / span) * (H - pad * 2),
  );
  const line = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`)
    .join(" ");
  const area = `${line} L ${xs[xs.length - 1]} ${H - pad} L ${xs[0]} ${H - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      aria-hidden
      focusable="false"
    >
      <rect width="100%" height="100%" className="fill-void-800" />
      <path d={area} fill="rgba(34, 211, 238, 0.14)" />
      <path
        d={line}
        fill="none"
        stroke="rgb(34, 211, 238)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={xs[xs.length - 1]}
        cy={ys[ys.length - 1]}
        r={4}
        fill="rgb(34, 211, 238)"
      />
    </svg>
  );
}
