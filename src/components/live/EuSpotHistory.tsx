"use client";

import type { EuSpotView, EuZoneId } from "@/lib/live/eu-spot-types";

const W = 960;
const H = 280;
const PAD = { l: 44, r: 12, t: 16, b: 32 };

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
    day: "numeric",
    month: "short",
    hour: "2-digit",
    hour12: false,
  });
}

function formatEur(n: number): string {
  return `€${n.toFixed(1)}`;
}

function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return `hsl(${h} 70% 62%)`;
}

export function EuSpotHistory({
  view,
  selected,
  onSelect,
}: {
  view: EuSpotView;
  selected: EuZoneId;
  onSelect: (id: EuZoneId) => void;
}) {
  const anchor = view.zones.find((z) => z.id === "FI") ?? view.zones[0];
  if (!anchor || anchor.t.length < 2) return null;
  const sliceFrom = Math.max(0, anchor.t.length - 48);
  const hours = anchor.t.slice(sliceFrom);

  let min = Infinity;
  let max = -Infinity;
  const series = view.zones.map((z) => {
    const map = new Map(z.t.map((t, i) => [t, z.price[i] ?? null]));
    const ys = hours.map((t) => {
      const v = map.get(t);
      if (v === null || v === undefined) return null;
      min = Math.min(min, v);
      max = Math.max(max, v);
      return v;
    });
    return { id: z.id, label: z.label, ys };
  });
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  const pad = Math.max(4, (max - min) * 0.08);
  min -= pad;
  max += pad;
  const n = hours.length;
  const xs = hours.map((_, i) => xAt(i, n));
  const ticks = [0, Math.round(n / 2), n - 1];
  const grid = [min, min + (max - min) / 2, max];

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-white">
          Last two days
        </h2>
        <p className="mt-1 mb-4 text-sm text-slate-400">
          All live zones faintly; selected zone bold. Pick a chip or a table
          row to focus.
        </p>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Day-ahead price time series for European bidding zones"
          className="h-auto w-full"
        >
          <title>EU spot history — €/MWh</title>
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
          {series.map((s) => {
            const pathXs: number[] = [];
            const pathYs: number[] = [];
            for (let i = 0; i < s.ys.length; i++) {
              const v = s.ys[i];
              if (v === null) continue;
              pathXs.push(xs[i] ?? PAD.l);
              pathYs.push(yAt(v, min, max));
            }
            const focus = selected === s.id || s.id === "FI";
            return (
              <path
                key={s.id}
                d={linePath(pathXs, pathYs)}
                fill="none"
                stroke={s.id === "FI" ? "#22d3ee" : colorFor(s.id)}
                strokeWidth={selected === s.id ? 2.4 : focus ? 1.5 : 1}
                strokeOpacity={selected === s.id ? 1 : focus ? 0.55 : 0.12}
              />
            );
          })}
          {ticks.map((i) => {
            const t = hours[i];
            if (t === undefined) return null;
            return (
              <text
                key={i}
                x={xs[i]}
                y={H - 8}
                textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
                className="fill-slate-500"
                fontSize={10}
                fontFamily="ui-monospace, monospace"
              >
                {helsinkiHour(t)}
              </text>
            );
          })}
        </svg>
        <div className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-y-auto">
          {view.today.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => onSelect(z.id)}
              className={`focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-2.5 text-xs transition-colors ${
                selected === z.id
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <span
                className="h-2 w-2 rounded-sm"
                style={{
                  background: z.id === "FI" ? "#22d3ee" : colorFor(z.id),
                }}
                aria-hidden
              />
              {z.id}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-white">
          Compare today
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Sorted by baseload, high → low.
        </p>
        <div className="mt-4 max-h-[28rem] overflow-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="sticky top-0 bg-void">
              <tr className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
                <th className="pb-3 font-medium">Zone</th>
                <th className="pb-3 font-medium">Baseload</th>
                <th className="pb-3 font-medium">Peak</th>
                <th className="pb-3 font-medium">Trough</th>
                <th className="pb-3 font-medium">vs FI</th>
                <th className="pb-3 font-medium">DoD</th>
              </tr>
            </thead>
            <tbody>
              {view.today.map((z) => (
                <tr
                  key={z.id}
                  className={`border-t border-white/8 tabular-nums ${
                    selected === z.id ? "text-white" : "text-slate-300"
                  }`}
                >
                  <td className="py-2.5">
                    <button
                      type="button"
                      onClick={() => onSelect(z.id)}
                      className="focus-ring rounded-sm font-medium"
                    >
                      {z.label}
                    </button>
                  </td>
                  <td className="py-2.5 font-mono">{formatEur(z.baseload)}</td>
                  <td className="py-2.5 font-mono">{formatEur(z.peak)}</td>
                  <td className="py-2.5 font-mono">{formatEur(z.trough)}</td>
                  <td className="py-2.5 font-mono">
                    {z.spreadVsFi >= 0 ? "+" : ""}
                    {formatEur(z.spreadVsFi)}
                  </td>
                  <td className="py-2.5 font-mono">
                    {z.dayOverDay === null
                      ? "—"
                      : `${z.dayOverDay >= 0 ? "+" : ""}${formatEur(z.dayOverDay)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
