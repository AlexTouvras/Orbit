"use client";

import { useMemo, useState } from "react";
import type { HousingPostalPoint } from "@/lib/live/housing-types";
import {
  HOUSING_POSTAL_ATTRIBUTION,
  HOUSING_POSTAL_SHAPES,
  HOUSING_POSTAL_VIEWBOX,
} from "@/content/live/housing-postal-paths";
import { housingFill } from "@/lib/live/housing-map-fill";

function formatEur(n: number): string {
  return `€${Math.round(n).toLocaleString("en-US")}`;
}

export function HousingMap({
  postalAreas,
  postalPeriod,
}: {
  postalAreas: HousingPostalPoint[];
  postalPeriod: string | null;
}) {
  const [hover, setHover] = useState<string | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, HousingPostalPoint>();
    for (const a of postalAreas) {
      if (a.eurM2 !== null) m.set(a.id, a);
    }
    return m;
  }, [postalAreas]);

  const values = useMemo(
    () => [...byId.values()].map((a) => a.eurM2 as number),
    [byId],
  );
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const active = hover ? byId.get(hover) : null;
  const priced = byId.size;

  if (priced < 8) return null;

  return (
    <section aria-label="Capital region postal price map">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">
            Postal-code map
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Yearly €/m² for old flats and terraced houses by postinumero — cool
            is cheaper, warm is dearer
            {postalPeriod ? ` · ${postalPeriod}` : ""}. Same grain as
            Asuntomaatti; sparse codes stay empty.
          </p>
        </div>
        {active ? (
          <p className="font-mono text-sm tabular-nums text-neon-cyan">
            {active.id} {active.label} · {formatEur(active.eurM2!)}/m²
            {active.transactions != null
              ? ` · ${active.transactions} sales`
              : ""}
          </p>
        ) : (
          <p className="font-mono text-sm text-slate-500">
            Hover a postal area · {priced} with prices
          </p>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-void-900/60 p-2 sm:p-3">
        <svg
          viewBox={HOUSING_POSTAL_VIEWBOX}
          className="mx-auto h-auto w-full max-w-3xl"
          role="img"
          aria-label="Capital region colored by postal-code euro per square metre"
        >
          <rect width="100%" height="100%" className="fill-void-950/80" />
          {HOUSING_POSTAL_SHAPES.map((shape) => {
            const row = byId.get(shape.id);
            const selected = hover === shape.id;
            return (
              <path
                key={shape.id}
                d={shape.d}
                fill={
                  row
                    ? housingFill(row.eurM2 as number, min, max)
                    : "rgba(255,255,255,0.05)"
                }
                fillOpacity={row ? (selected ? 1 : 0.9) : 0.35}
                stroke={
                  selected ? "rgb(34, 211, 238)" : "rgba(255,255,255,0.22)"
                }
                strokeWidth={selected ? 1.6 : 0.45}
                className="cursor-pointer transition-[fill-opacity,stroke] duration-100"
                onMouseEnter={() => setHover(shape.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(shape.id)}
                onBlur={() => setHover(null)}
                tabIndex={row ? 0 : -1}
                role={row ? "button" : undefined}
                aria-label={
                  row
                    ? `${shape.id} ${shape.label}: ${formatEur(row.eurM2 as number)} per square metre`
                    : `${shape.id} ${shape.label}: no price`
                }
              />
            );
          })}
        </svg>

        <div className="mt-3 flex flex-wrap items-center gap-3 px-1">
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
        {HOUSING_POSTAL_ATTRIBUTION}. Prices: Statistics Finland ashi 13mu (CC
        BY 4.0), sales-weighted across flat sizes and terraced houses.
      </p>
    </section>
  );
}
