"use client";

import { useMemo, useState } from "react";
import type { HousingRegionSeries } from "@/lib/live/housing-types";
import {
  HOUSING_MAP_ATTRIBUTION,
  HOUSING_MAP_SHAPES,
  HOUSING_MAP_VIEWBOX,
  type HousingMapShapeId,
} from "@/content/live/housing-map-paths";
import { housingFill } from "@/lib/live/housing-map-fill";

function latestEurM2(
  monthly: HousingRegionSeries["monthly"],
): { eurM2: number; period: string; provisional: boolean } | null {
  for (let i = monthly.length - 1; i >= 0; i--) {
    const row = monthly[i];
    if (row && row.eurM2 !== null) {
      return {
        eurM2: row.eurM2,
        period: row.period,
        provisional: row.provisional,
      };
    }
  }
  return null;
}

function formatEur(n: number): string {
  return `€${Math.round(n).toLocaleString("en-US")}`;
}

function formatPeriod(period: string): string {
  const m = period.match(/^(\d{4})M(\d{2})$/);
  if (!m) return period;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1));
  return date.toLocaleString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

type MapRow = {
  id: HousingMapShapeId;
  label: string;
  eurM2: number;
  period: string;
  provisional: boolean;
};

export function HousingMap({
  regions,
}: {
  regions: HousingRegionSeries[];
}) {
  const [hover, setHover] = useState<HousingMapShapeId | null>(null);

  const rows = useMemo(() => {
    const out: MapRow[] = [];
    for (const shape of HOUSING_MAP_SHAPES) {
      const series = regions.find((r) => r.id === shape.id);
      if (!series) continue;
      const latest = latestEurM2(series.monthly);
      if (!latest) continue;
      out.push({
        id: shape.id,
        label: shape.label,
        eurM2: latest.eurM2,
        period: latest.period,
        provisional: latest.provisional,
      });
    }
    return out;
  }, [regions]);

  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);
  const values = rows.map((r) => r.eurM2);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const active = hover ? byId.get(hover) : null;
  const period = rows[0]?.period;
  const provisional = rows.some((r) => r.provisional);

  if (rows.length < 2) return null;

  return (
    <section aria-label="Capital region price map">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">
            Capital region map
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Latest monthly €/m² for old flats — cool is cheaper, warm is dearer
            {period ? ` · ${formatPeriod(period)}` : ""}
            {provisional ? " · provisional" : ""}.
          </p>
        </div>
        {active ? (
          <p className="font-mono text-sm tabular-nums text-neon-cyan">
            {active.label} · {formatEur(active.eurM2)}/m²
          </p>
        ) : (
          <p className="font-mono text-sm text-slate-500">
            Hover a municipality
          </p>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-void-900/60 p-3 sm:p-4">
        <svg
          viewBox={HOUSING_MAP_VIEWBOX}
          className="mx-auto h-auto w-full max-w-xl"
          role="img"
          aria-label="Helsinki, Espoo–Kauniainen, and Vantaa colored by euro per square metre"
        >
          <rect
            width="100%"
            height="100%"
            className="fill-void-950/80"
          />
          {HOUSING_MAP_SHAPES.map((shape) => {
            const row = byId.get(shape.id);
            const selected = hover === shape.id;
            return (
              <path
                key={shape.id}
                d={shape.d}
                fill={
                  row
                    ? housingFill(row.eurM2, min, max)
                    : "rgba(255,255,255,0.06)"
                }
                fillOpacity={row ? (selected ? 1 : 0.88) : 0.4}
                stroke={
                  selected ? "rgb(34, 211, 238)" : "rgba(255,255,255,0.35)"
                }
                strokeWidth={selected ? 2.2 : 1.1}
                className="cursor-pointer transition-[fill-opacity,stroke] duration-150"
                onMouseEnter={() => setHover(shape.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(shape.id)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="button"
                aria-label={
                  row
                    ? `${row.label}: ${formatEur(row.eurM2)} per square metre`
                    : shape.label
                }
              />
            );
          })}
          {/* City labels */}
          {HOUSING_MAP_SHAPES.map((shape) => {
            const row = byId.get(shape.id);
            if (!row) return null;
            // Rough label anchors from path bbox midpoints (hand-tuned).
            const anchors: Record<HousingMapShapeId, { x: number; y: number }> =
              {
                "091": { x: 430, y: 310 },
                "049": { x: 220, y: 300 },
                "092": { x: 400, y: 140 },
              };
            const a = anchors[shape.id];
            return (
              <text
                key={`${shape.id}-label`}
                x={a.x}
                y={a.y}
                textAnchor="middle"
                className="fill-white pointer-events-none"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                {shape.label.split("–")[0]}
              </text>
            );
          })}
        </svg>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
            €/m²
          </p>
          <div className="min-w-[12rem] flex-1">
            <div
              className="h-2.5 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, hsl(190 55% 50%), hsl(105 65% 48%), hsl(35 75% 50%))",
              }}
              aria-hidden
            />
            <div className="mt-1 flex justify-between font-mono text-[0.65rem] tabular-nums text-slate-500">
              <span>{formatEur(min)}</span>
              <span>{formatEur(max)}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        {HOUSING_MAP_ATTRIBUTION}. Prices: Statistics Finland ashi (CC BY 4.0).
      </p>
    </section>
  );
}
