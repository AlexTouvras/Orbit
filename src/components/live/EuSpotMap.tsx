"use client";

import { useMemo, useState } from "react";
import type { EuSpotView, EuZoneId } from "@/lib/live/eu-spot-types";
import {
  categoryValue,
  formatCategoryValue,
  type EuCategoryId,
} from "@/lib/live/eu-category-meta";
import { EU_ZONE_MAP } from "@/content/live/eu-zone-paths";

function fillFor(
  value: number,
  min: number,
  max: number,
  diverging: boolean,
): string {
  if (diverging) {
    const span = Math.max(Math.abs(min), Math.abs(max), 1);
    const t = Math.min(1, Math.max(-1, value / span));
    if (t >= 0) {
      return `hsl(350 ${50 + t * 25}% ${42 + t * 8}%)`;
    }
    return `hsl(190 ${55 + Math.abs(t) * 20}% ${42 + Math.abs(t) * 8}%)`;
  }
  const span = max - min || 1;
  const t = Math.min(1, Math.max(0, (value - min) / span));
  const h = 190 - t * 170;
  const s = 55 + t * 20;
  const l = 42 + (1 - Math.abs(t - 0.5)) * 8;
  return `hsl(${h} ${s}% ${l}%)`;
}

export function EuSpotMap({
  view,
  selected,
  category,
  onSelect,
}: {
  view: EuSpotView;
  selected: EuZoneId;
  category: EuCategoryId;
  onSelect: (id: EuZoneId) => void;
}) {
  const pulseById = useMemo(
    () => new Map(view.pulses.map((p) => [p.id, p])),
    [view.pulses],
  );
  const liveByStem = useMemo(
    () => new Map(view.today.map((z) => [z.geoStem, z])),
    [view.today],
  );
  const liveStems = useMemo(() => new Set(liveByStem.keys()), [liveByStem]);

  const metricRows = useMemo(() => {
    return view.today
      .map((z) => {
        const pulse = pulseById.get(z.id);
        const raw =
          category === "market"
            ? z.baseload
            : categoryValue(pulse, category);
        return { id: z.id, geoStem: z.geoStem, label: z.label, value: raw };
      })
      .filter((r) => r.value !== null) as Array<{
      id: EuZoneId;
      geoStem: string;
      label: string;
      value: number;
    }>;
  }, [view.today, pulseById, category]);

  const values = metricRows.map((r) => r.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const diverging = category === "transmission";
  const byId = new Map(metricRows.map((r) => [r.id, r]));

  const [hover, setHover] = useState<{
    id: EuZoneId;
    label: string;
    value: number | null;
    x: number;
    y: number;
  } | null>(null);

  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-white">
        Europe by category
      </h2>
      <p className="mt-1 mb-4 text-sm text-slate-400">
        Hover for a quick read. Press a filled zone for the full desk (load,
        generation, price — Finland-style).
      </p>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-void-800/80">
        <svg
          viewBox={EU_ZONE_MAP.viewBox}
          role="img"
          aria-label="European bidding-zone map"
          className="h-auto w-full"
          onMouseLeave={() => setHover(null)}
        >
          <title>EU spot map — European bidding zones</title>
          <rect width="100%" height="100%" className="fill-void" />
          <defs>
            <pattern
              id="eu-spot-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="rgba(255,255,255,0.035)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#eu-spot-grid)" />

          {Object.entries(EU_ZONE_MAP.shapes).map(([stem, shape]) => {
            if (liveStems.has(stem)) return null;
            return (
              <path
                key={stem}
                d={shape.d}
                className="fill-white/[0.04] stroke-white/15"
                strokeWidth={0.55}
                aria-hidden
              />
            );
          })}

          {view.today.map((z) => {
            const shape = EU_ZONE_MAP.shapes[z.geoStem];
            if (!shape) return null;
            const row = byId.get(z.id);
            const active = selected === z.id;
            const hasMetric = row !== undefined;
            const fill = hasMetric
              ? fillFor(row.value, min, max, diverging)
              : "rgba(255,255,255,0.08)";
            return (
              <g key={z.id}>
                <path
                  d={shape.d}
                  fill={fill}
                  fillOpacity={active ? 0.95 : hasMetric ? 0.78 : 0.35}
                  stroke={active ? "white" : "rgba(255,255,255,0.45)"}
                  strokeWidth={active ? 2 : 0.9}
                  className="cursor-pointer transition-[fill-opacity,stroke-width]"
                  role="button"
                  tabIndex={0}
                  aria-label={`${z.label}, ${formatCategoryValue(category, row?.value ?? null)}`}
                  aria-pressed={active}
                  onClick={() => onSelect(z.id)}
                  onMouseEnter={(e) => {
                    const svg = e.currentTarget.ownerSVGElement;
                    if (!svg) return;
                    const rect = svg.getBoundingClientRect();
                    setHover({
                      id: z.id,
                      label: z.label,
                      value: row?.value ?? null,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  onMouseMove={(e) => {
                    const svg = e.currentTarget.ownerSVGElement;
                    if (!svg) return;
                    const rect = svg.getBoundingClientRect();
                    setHover((prev) =>
                      prev
                        ? {
                            ...prev,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          }
                        : prev,
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(z.id);
                    }
                  }}
                />
                {active ? (
                  <>
                    <text
                      x={shape.labelX}
                      y={shape.labelY}
                      textAnchor="middle"
                      className="fill-white pointer-events-none"
                      fontSize={12}
                      fontFamily="ui-monospace, monospace"
                      fontWeight={600}
                    >
                      {z.id}
                    </text>
                    <text
                      x={shape.labelX}
                      y={shape.labelY + 14}
                      textAnchor="middle"
                      className="fill-white/90 pointer-events-none"
                      fontSize={11}
                      fontFamily="ui-monospace, monospace"
                    >
                      {formatCategoryValue(category, row?.value ?? null)}
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}
        </svg>

        {hover ? (
          <div
            className="pointer-events-none absolute z-10 min-w-[9rem] rounded-lg border border-white/15 bg-void/95 px-3 py-2 shadow-lg"
            style={{
              left: Math.min(hover.x + 12, 280),
              top: Math.max(hover.y - 8, 8),
            }}
          >
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-slate-400">
              {hover.id}
            </p>
            <p className="text-sm font-medium text-white">{hover.label}</p>
            <p className="mt-1 font-mono text-sm tabular-nums text-neon-cyan">
              {formatCategoryValue(category, hover.value)}
            </p>
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        {EU_ZONE_MAP.attribution}
      </p>
    </section>
  );
}
