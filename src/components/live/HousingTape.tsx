type TapePoint = {
  period: string;
  value: number;
};

const W = 960;
const H = 200;
const PAD = { l: 52, r: 12, t: 16, b: 32 };

function xAt(i: number, n: number): number {
  if (n <= 1) return PAD.l;
  return PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
}

function yAt(v: number, min: number, max: number): number {
  const inner = H - PAD.t - PAD.b;
  const span = max - min || 1;
  return PAD.t + inner * (1 - (v - min) / span);
}

function linePath(xs: number[], ys: number[]): string {
  return xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
}

function areaPath(xs: number[], ys: number[]): string {
  if (xs.length === 0) return "";
  const base = H - PAD.b;
  const line = linePath(xs, ys);
  const lastX = xs[xs.length - 1] ?? PAD.l;
  const firstX = xs[0] ?? PAD.l;
  return `${line} L ${lastX} ${base} L ${firstX} ${base} Z`;
}

function formatEur(n: number): string {
  if (n >= 1000) return `${Math.round(n / 100) / 10}k`;
  return String(Math.round(n));
}

function shortPeriod(period: string): string {
  if (/^\d{4}M\d{2}$/.test(period)) {
    return `${period.slice(2, 4)}-${period.slice(5)}`;
  }
  if (/^\d{4}Q\d$/.test(period)) {
    return `${period.slice(2, 4)}Q${period.slice(5)}`;
  }
  return period;
}

export function HousingTape({
  points,
  label,
  unit = "€/m²",
}: {
  points: TapePoint[];
  label: string;
  unit?: string;
}) {
  const usable = points.filter((p) => Number.isFinite(p.value));
  if (usable.length < 2) return null;

  let min = usable[0]!.value;
  let max = min;
  for (const p of usable) {
    min = Math.min(min, p.value);
    max = Math.max(max, p.value);
  }
  const pad = Math.max(40, (max - min) * 0.1);
  min -= pad;
  max += pad;

  const n = usable.length;
  const xs = usable.map((_, i) => xAt(i, n));
  const ys = usable.map((p) => yAt(p.value, min, max));
  const ticks = [0, Math.round((n - 1) / 2), n - 1];
  const grid = [min, min + (max - min) / 2, max];
  const last = usable[usable.length - 1]!;

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${label}: ${formatEur(last.value)} ${unit}`}
        className="h-auto w-full"
      >
        <title>{label}</title>
        {grid.map((g) => {
          const y = yAt(g, min, max);
          return (
            <g key={g}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
              />
              <text
                x={PAD.l - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
              >
                {formatEur(g)}
              </text>
            </g>
          );
        })}
        <path
          d={areaPath(xs, ys)}
          fill="rgba(34, 211, 238, 0.12)"
        />
        <path
          d={linePath(xs, ys)}
          fill="none"
          stroke="rgb(34, 211, 238)"
          strokeWidth={2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={xs[xs.length - 1]}
          cy={ys[ys.length - 1]}
          r={4}
          fill="rgb(34, 211, 238)"
        />
        {ticks.map((i) => {
          const p = usable[i];
          if (!p) return null;
          return (
            <text
              key={p.period}
              x={xs[i]}
              y={H - 10}
              textAnchor="middle"
              className="fill-slate-500"
              fontSize={11}
              fontFamily="ui-monospace, monospace"
            >
              {shortPeriod(p.period)}
            </text>
          );
        })}
      </svg>
      <figcaption className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
        {label} · {unit}
      </figcaption>
    </figure>
  );
}
