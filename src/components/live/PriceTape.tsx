type PricePt = {
  t: number;
  actual: number;
  nowcast: number;
};

const W = 960;
const H = 220;
const PAD = { l: 44, r: 8, t: 16, b: 28 };

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

function helsinkiHour(unix: number): string {
  return new Date(unix * 1000).toLocaleString("en-GB", {
    timeZone: "Europe/Helsinki",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function PriceTape({ points }: { points: PricePt[] }) {
  if (points.length < 2) return null;
  let min = points[0]?.actual ?? 0;
  let max = min;
  for (const p of points) {
    min = Math.min(min, p.actual, p.nowcast);
    max = Math.max(max, p.actual, p.nowcast);
  }
  const pad = Math.max(4, (max - min) * 0.08);
  min -= pad;
  max += pad;
  const n = points.length;
  const xs = points.map((_, i) => xAt(i, n));
  const actualY = points.map((p) => yAt(p.actual, min, max));
  const nowcastY = points.map((p) => yAt(p.nowcast, min, max));
  const ticks = [0, Math.round(n / 2), n - 1];
  const grid = [min, min + (max - min) / 2, max];

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Day-ahead price versus mix nowcast, euro per megawatt-hour"
        className="h-auto w-full"
      >
        <title>Day-ahead vs mix nowcast (€/MWh)</title>
        {grid.map((v) => {
          const y = yAt(v, min, max);
          return (
            <g key={v}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-white/10"
                strokeWidth={1}
              />
              <text
                x={PAD.l - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-500"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
              >
                {Math.round(v)}
              </text>
            </g>
          );
        })}
        <path
          d={linePath(xs, actualY)}
          className="stroke-white"
          fill="none"
          strokeWidth={1.6}
        />
        <path
          d={linePath(xs, nowcastY)}
          className="stroke-amber-400"
          fill="none"
          strokeWidth={1.6}
          strokeDasharray="5 4"
        />
        {ticks.map((i) => {
          const pt = points[i];
          if (!pt) return null;
          return (
            <text
              key={i}
              x={xs[i]}
              y={H - 8}
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
              className="fill-slate-500"
              fontSize={11}
              fontFamily="ui-monospace, monospace"
            >
              {helsinkiHour(pt.t)}
            </text>
          );
        })}
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">
        <span>
          <span className="mr-1.5 inline-block h-0.5 w-4 translate-y-[-3px] bg-white" />
          Day-ahead €/MWh
        </span>
        <span>
          <span className="mr-1.5 inline-block h-0.5 w-4 translate-y-[-3px] border-t border-dashed border-amber-400" />
          Mix nowcast
        </span>
      </figcaption>
    </figure>
  );
}
