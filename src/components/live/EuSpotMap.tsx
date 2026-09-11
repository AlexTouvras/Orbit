"use client";

import { useMemo, useState, type MouseEvent } from "react";
import type { EuSpotView, EuZoneId } from "@/lib/live/eu-spot-types";
import {
  categoryValue,
  formatCategoryValue,
  type EuCategoryId,
  type EuZonePulse,
} from "@/lib/live/eu-category-meta";
import { EU_ZONE_MAP } from "@/content/live/eu-zone-paths";
import { nowcastForPulse, type ZoneNowcast } from "@/lib/live/zone-nowcast";
import { fillFor } from "@/lib/live/eu-map-fill";

function formatMw(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "—";
  return `${Math.round(n).toLocaleString("en-US")} MW`;
}

function formatEur(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "—";
  return `€${n.toFixed(1)}`;
}

function lastFinite(arr: Array<number | null> | undefined): number | null {
  if (!arr) return null;
  for (let i = arr.length - 1; i >= 0; i--) {
    const v = arr[i];
    if (v !== null && Number.isFinite(v)) return v;
  }
  return null;
}

function formatHelsinkiHour(unix: number | undefined): string {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleString("en-GB", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

type MetricRow = {
  id: EuZoneId;
  geoStem: string;
  label: string;
  value: number;
};

function MapLegend({
  low,
  high,
  category,
  diverging,
}: {
  low: MetricRow | null;
  high: MetricRow | null;
  category: EuCategoryId;
  diverging: boolean;
}) {
  const lowVal = low ? formatCategoryValue(category, low.value) : "—";
  const highVal = high ? formatCategoryValue(category, high.value) : "—";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
        Scale
      </p>
      <div className="min-w-[14rem] flex-1">
        <div
          className="h-2.5 rounded-full"
          style={{
            background: diverging
              ? "linear-gradient(90deg, hsl(190 75% 50%), hsl(0 0% 35%), hsl(350 75% 50%))"
              : "linear-gradient(90deg, hsl(190 55% 50%), hsl(105 65% 48%), hsl(20 75% 50%))",
          }}
          aria-hidden
        />
        <div className="mt-1 flex justify-between gap-3 font-mono text-[0.7rem] tabular-nums text-slate-400">
          <span className="max-w-[45%]">
            {diverging ? "Export" : "Lowest"} {lowVal}
            {low ? (
              <span className="mt-0.5 block truncate text-slate-300">
                {low.id} · {low.label}
              </span>
            ) : null}
          </span>
          <span className="max-w-[45%] text-right">
            {diverging ? "Import" : "Highest"} {highVal}
            {high ? (
              <span className="mt-0.5 block truncate text-slate-300">
                {high.id} · {high.label}
              </span>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}

function HoverCard({
  today,
  pulse,
  nowcast,
  category,
  metric,
}: {
  today: EuSpotView["today"][number];
  pulse: EuZonePulse | undefined;
  nowcast: ZoneNowcast | null;
  category: EuCategoryId;
  metric: number | null;
}) {
  const L = pulse?.latest;
  const lastT = pulse?.t.length ? pulse.t[pulse.t.length - 1] : undefined;
  const solar = lastFinite(pulse?.solar);
  const nextHour = nowcast?.nextHour ?? nowcast?.lastNowcast ?? null;

  return (
    <>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-slate-400">
        {today.id}
      </p>
      <p className="text-sm font-medium text-white">{today.label}</p>
      <p className="mt-0.5 font-mono text-[0.65rem] text-slate-500">
        {formatHelsinkiHour(lastT)} Helsinki
      </p>
      <p className="mt-1.5 font-mono text-sm tabular-nums text-neon-cyan">
        {formatCategoryValue(category, metric)}
        <span className="ml-1 text-slate-500">
          {category === "market" ? "baseload" : ""}
        </span>
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[0.7rem] tabular-nums text-slate-300">
        <div>
          <dt className="text-slate-500">Latest hour</dt>
          <dd>{formatEur(L?.price ?? today.latest)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Next-hour nowcast</dt>
          <dd className="text-amber-300">{formatEur(nextHour)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Peak</dt>
          <dd>{formatEur(today.peak)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Trough</dt>
          <dd>{formatEur(today.trough)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Load</dt>
          <dd>{formatMw(L?.loadMw ?? null)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Generation</dt>
          <dd>{formatMw(L?.genMw ?? null)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Wind</dt>
          <dd>{formatMw(L?.windMw ?? null)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Solar</dt>
          <dd>{formatMw(solar)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Nuclear</dt>
          <dd>{formatMw(L?.nuclearMw ?? null)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Hydro</dt>
          <dd>{formatMw(L?.hydroMw ?? null)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Net import</dt>
          <dd>{formatMw(L?.netImportMw ?? null)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Outages</dt>
          <dd>
            {L?.outageCount === null || L?.outageCount === undefined
              ? "—"
              : String(L.outageCount)}
          </dd>
        </div>
      </dl>
    </>
  );
}

export function EuSpotMap({
  view,
  selected,
  category,
  onSelect,
}: {
  view: EuSpotView;
  selected: EuZoneId | null;
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

  const nowcastById = useMemo(() => {
    const m = new Map<string, ZoneNowcast | null>();
    for (const p of view.pulses) m.set(p.id, nowcastForPulse(p));
    return m;
  }, [view.pulses]);

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
      .filter((r) => r.value !== null) as MetricRow[];
  }, [view.today, pulseById, category]);

  const values = metricRows.map((r) => r.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const diverging = category === "transmission";
  const byId = new Map(metricRows.map((r) => [r.id, r]));
  const lowRow =
    metricRows.reduce<MetricRow | null>(
      (acc, r) => (!acc || r.value < acc.value ? r : acc),
      null,
    );
  const highRow =
    metricRows.reduce<MetricRow | null>(
      (acc, r) => (!acc || r.value > acc.value ? r : acc),
      null,
    );

  const [hover, setHover] = useState<{
    id: EuZoneId;
    nx: number;
    ny: number;
  } | null>(null);

  const peekId = hover?.id ?? selected;
  const peekPulse = peekId ? pulseById.get(peekId) : undefined;
  const peekRow = peekId ? byId.get(peekId) : undefined;
  const peekToday = peekId
    ? view.today.find((z) => z.id === peekId)
    : undefined;
  const peekNowcast = peekId ? (nowcastById.get(peekId) ?? null) : null;

  const setHoverFromEvent = (
    id: EuZoneId,
    e: MouseEvent<SVGPathElement>,
  ) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    setHover({
      id,
      nx: (e.clientX - rect.left) / w,
      ny: (e.clientY - rect.top) / h,
    });
  };

  const clearHoverIfFinePointer = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }
    setHover(null);
  };

  const peekCardProps = peekToday
    ? {
        today: peekToday,
        pulse: peekPulse,
        nowcast: peekNowcast,
        category,
        metric: peekRow?.value ?? null,
      }
    : null;

  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-white">
        Europe by category
      </h2>
      <p className="mt-1 mb-4 text-sm text-slate-400">
        Colour is this category. Hover for mix, peak, and next-hour nowcast.
        On a phone, tap a zone — the mix card sits under the map. Press for
        the full desk.
      </p>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-void-800/80">
        <div className="relative">
          <svg
          viewBox={EU_ZONE_MAP.viewBox}
          role="img"
          aria-label="European bidding-zone map"
          className="h-auto w-full"
          onMouseLeave={clearHoverIfFinePointer}
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
              <path
                key={z.id}
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
                onMouseEnter={(e) => setHoverFromEvent(z.id, e)}
                onMouseMove={(e) => setHoverFromEvent(z.id, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(z.id);
                  }
                }}
              />
            );
          })}
        </svg>

        {hover && peekCardProps ? (
          <div
            className="pointer-events-none absolute z-10 hidden max-h-[min(22rem,calc(100%-1rem))] w-[min(18rem,calc(100%-1rem))] overflow-y-auto rounded-lg border border-white/15 bg-void/95 px-3 py-2.5 shadow-lg md:block"
            style={{
              left: hover.nx > 0.5 ? undefined : 8,
              right: hover.nx > 0.5 ? 8 : undefined,
              top: hover.ny > 0.5 ? undefined : 8,
              bottom: hover.ny > 0.5 ? 8 : undefined,
            }}
          >
            <HoverCard {...peekCardProps} />
          </div>
        ) : null}
        </div>
        {peekCardProps ? (
          <div className="border-t border-white/10 px-3 py-3 md:hidden">
            <HoverCard {...peekCardProps} />
          </div>
        ) : null}
      </div>
      <MapLegend
        low={lowRow}
        high={highRow}
        category={category}
        diverging={diverging}
      />
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        {EU_ZONE_MAP.attribution} Next-hour nowcast is OLS on this zone’s last
        two days of mix + day-ahead — not an official ENTSO-E forecast.
      </p>
    </section>
  );
}
