import { readEconomySnapshot } from "@/lib/live/economy";

/** Euro-area HICP sparkline for portfolio tiles — no keys. */
export function EconomyPeek() {
  const snap = readEconomySnapshot();
  const ea = snap?.geos.find((g) => g.id === "EA21");
  const series = ea?.series.find((s) => s.metric === "inflation");
  const points =
    series?.points
      .filter((p) => p.value !== null)
      .map((p) => p.value as number) ?? [];

  if (points.length < 2) {
    return (
      <div className="flex h-full w-full items-end gap-1 bg-void-800 px-4 pb-4 pt-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-orange-400/25"
            style={{ height: `${28 + ((i * 19) % 55)}%` }}
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
      <path d={area} fill="rgba(251, 146, 60, 0.16)" />
      <path
        d={line}
        fill="none"
        stroke="rgb(251, 146, 60)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={xs[xs.length - 1]}
        cy={ys[ys.length - 1]}
        r={4}
        fill="rgb(251, 146, 60)"
      />
    </svg>
  );
}
