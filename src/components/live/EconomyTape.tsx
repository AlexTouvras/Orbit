type TapePoint = {
  period: string;
  value: number;
};

const W = 960;
const H = 168;
const PAD = { l: 48, r: 12, t: 14, b: 28 };

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

function formatTick(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 100) return String(Math.round(n));
  if (abs >= 10) return n.toFixed(0);
  return n.toFixed(1);
}

function shortPeriod(period: string): string {
  if (/^\d{4}-\d{2}$/.test(period)) return `${period.slice(2, 4)}-${period.slice(5)}`;
  if (/^\d{4}M\d{2}$/.test(period)) return `${period.slice(2, 4)}-${period.slice(5)}`;
  if (/^\d{4}-Q\d$/.test(period)) return `${period.slice(2, 4)}Q${period.slice(6)}`;
  if (/^\d{4}Q\d$/.test(period)) return `${period.slice(2, 4)}Q${period.slice(5)}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return period.slice(2, 7);
  return period;
}

export function EconomyTape({
  points,
  label,
  unit,
  stroke = "rgb(34, 211, 238)",
  fill = "rgba(34, 211, 238, 0.12)",
}: {
  points: TapePoint[];
  label: string;
  unit: string;
  stroke?: string;
  fill?: string;
}) {
  const usable = points.filter((p) => Number.isFinite(p.value));
  if (usable.length < 2) return null;

  let min = usable[0]!.value;
  let max = min;
  for (const p of usable) {
    min = Math.min(min, p.value);
    max = Math.max(max, p.value);
  }
  const pad = Math.max(0.15, (max - min) * 0.12);
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
        aria-label={`${label}: ${formatTick(last.value)} ${unit}`}
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
                {formatTick(g)}
              </text>
            </g>
          );
        })}
        <path d={areaPath(xs, ys)} fill={fill} />
        <path
          d={linePath(xs, ys)}
          fill="none"
          stroke={stroke}
          strokeWidth={2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={xs[xs.length - 1]}
          cy={ys[ys.length - 1]}
          r={4}
          fill={stroke}
        />
        {ticks.map((i) => {
          const p = usable[i];
          if (!p) return null;
          return (
            <text
              key={`${p.period}-${i}`}
              x={xs[i]}
              y={H - 8}
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
