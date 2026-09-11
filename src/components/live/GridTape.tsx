import type { PowerTapePoint } from "@/lib/live/power-types";

const W = 960;
const H = 260;
const PAD = { l: 44, r: 8, t: 16, b: 28 };

function maxAbs(tape: PowerTapePoint[]): number {
  let m = 1;
  for (const p of tape) {
    m = Math.max(m, p.wind, p.load, Math.abs(p.importMw));
  }
  return m;
}

function xAt(i: number, n: number): number {
  if (n <= 1) return PAD.l;
  return PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
}

function yAt(v: number, max: number): number {
  const inner = H - PAD.t - PAD.b;
  return PAD.t + inner * (1 - v / max);
}

function areaPath(xs: number[], ys: number[], baselineY: number): string {
  if (xs.length === 0) return "";
  const start = `M ${xs[0]} ${baselineY}`;
  const top = xs.map((x, i) => `L ${x} ${ys[i]}`).join(" ");
  const end = `L ${xs[xs.length - 1]} ${baselineY} Z`;
  return `${start} ${top} ${end}`;
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

/** 24h Finnish grid tape: wind fill, load line, import line. */
export function GridTape({ tape }: { tape: PowerTapePoint[] }) {
  if (tape.length < 2) return null;
  const max = maxAbs(tape);
  const n = tape.length;
  const xs = tape.map((_, i) => xAt(i, n));
  const windY = tape.map((p) => yAt(p.wind, max));
  const loadY = tape.map((p) => yAt(p.load, max));
  const importY = tape.map((p) => yAt(Math.max(0, p.importMw), max));
  const baseY = yAt(0, max);
  const ticks = [0, Math.round(n / 2), n - 1];

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Wind, load, and net imports for Finland over the last day, megawatts"
        className="h-auto w-full"
      >
        <title>Finland grid tape — wind, load, net import (MW)</title>
        <rect width={W} height={H} fill="transparent" />
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = yAt(max * frac, max);
          return (
            <g key={frac}>
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
                {Math.round((max * frac) / 100) * 100}
              </text>
            </g>
          );
        })}
        <path
          d={areaPath(xs, windY, baseY)}
          className="fill-neon-cyan/25"
        />
        <path
          d={linePath(xs, windY)}
          className="stroke-neon-cyan"
          fill="none"
          strokeWidth={1.75}
        />
        <path
          d={linePath(xs, loadY)}
          className="stroke-white"
          fill="none"
          strokeWidth={1.5}
        />
        <path
          d={linePath(xs, importY)}
          className="stroke-rose-400"
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        {ticks.map((i) => {
          const pt = tape[i];
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
          <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-neon-cyan/70" />
          Wind MW
        </span>
        <span>
          <span className="mr-1.5 inline-block h-0.5 w-4 translate-y-[-3px] bg-white" />
          Load MW
        </span>
        <span>
          <span className="mr-1.5 inline-block h-0.5 w-4 translate-y-[-3px] border-t border-dashed border-rose-400" />
          Net import MW
        </span>
        <span>Y-axis MW · Helsinki time</span>
      </figcaption>
    </figure>
  );
}
