"use client";

import { useMemo, useState } from "react";
import type {
  EconomyGeoId,
  EconomyLatestCell,
  EconomyMetricId,
  EconomyView,
} from "@/lib/live/economy-types";
import {
  ECONOMY_DEFAULT_GEO,
  ECONOMY_GEOS,
  ECONOMY_METRICS,
  economyMetricMeta,
} from "@/lib/live/economy-types";
import { BackLink } from "@/components/ui/BackLink";
import { Badge } from "@/components/ui/Badge";
import { EconomyTape } from "@/components/live/EconomyTape";
import { economyMonthlyBrief } from "@/lib/live/economy-brief";

function formatHelsinki(iso: string): string {
  return `${new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} Helsinki`;
}

function formatHeadlineDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZoneName: undefined,
  });
}

function formatPeriod(period: string): string {
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split("-");
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
    return date.toLocaleString("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  if (/^\d{4}-Q\d$/.test(period)) {
    return `${period.slice(0, 4)} ${period.slice(5)}`;
  }
  if (/^\d{4}Q\d$/.test(period)) {
    return `${period.slice(0, 4)} Q${period.slice(5)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return new Date(`${period}T00:00:00Z`).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  return period;
}

function formatValue(metric: EconomyMetricId, n: number | null): string {
  if (n === null) return "—";
  if (metric === "confidence") {
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(1)}`;
  }
  if (metric === "gdp") {
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(1)}%`;
  }
  return `${n.toFixed(1)}%`;
}

function formatDelta(metric: EconomyMetricId, n: number | null): string {
  if (n === null) return "—";
  const sign = n > 0 ? "+" : "";
  if (metric === "confidence") return `${sign}${n.toFixed(1)}`;
  return `${sign}${n.toFixed(1)} pp`;
}

function toneForMetric(
  metric: EconomyMetricId,
  delta: number | null,
): string {
  if (delta === null || delta === 0) return "text-white";
  const meta = economyMetricMeta(metric);
  const warmerIsUp = meta?.higherIsWarmer ?? true;
  const up = delta > 0;
  // Warm (rose) when the “bad” direction moves; cool (emerald) otherwise.
  // Confidence: higher is cooler → up is emerald. Inflation/unemployment: up is rose.
  if (warmerIsUp) return up ? "text-rose-300" : "text-emerald-300";
  return up ? "text-emerald-300" : "text-rose-300";
}

function cellFor(
  latest: EconomyLatestCell[],
  metric: EconomyMetricId,
): EconomyLatestCell | undefined {
  return latest.find((c) => c.metric === metric);
}

const TAPE_STROKE: Record<EconomyMetricId, string> = {
  inflation: "rgb(251, 146, 60)",
  unemployment: "rgb(244, 114, 182)",
  confidence: "rgb(52, 211, 153)",
  gdp: "rgb(96, 165, 250)",
  policyRate: "rgb(34, 211, 238)",
};

const TAPE_FILL: Record<EconomyMetricId, string> = {
  inflation: "rgba(251, 146, 60, 0.12)",
  unemployment: "rgba(244, 114, 182, 0.12)",
  confidence: "rgba(52, 211, 153, 0.12)",
  gdp: "rgba(96, 165, 250, 0.12)",
  policyRate: "rgba(34, 211, 238, 0.12)",
};

export function EconomyDesk({ view }: { view: EconomyView }) {
  const [geoId, setGeoId] = useState<EconomyGeoId>(
    view.defaultGeo ?? ECONOMY_DEFAULT_GEO,
  );

  const focus = useMemo(
    () => view.geos.find((g) => g.id === geoId) ?? view.euroArea,
    [view, geoId],
  );
  const euroArea = view.euroArea;
  const spotlighting = focus && focus.id !== ECONOMY_DEFAULT_GEO;

  const headlines = useMemo(() => {
    const forGeo = view.headlines.filter((h) => h.geo === geoId);
    if (forGeo.length > 0) return forGeo;
    // Soft fallback when a country wire fetch was empty.
    if (geoId !== ECONOMY_DEFAULT_GEO) {
      return view.headlines.filter((h) => h.geo === ECONOMY_DEFAULT_GEO);
    }
    return [];
  }, [view.headlines, geoId]);

  const headlinesFallback =
    headlines.length > 0 &&
    geoId !== ECONOMY_DEFAULT_GEO &&
    headlines.every((h) => h.geo === ECONOMY_DEFAULT_GEO);

  const monthlyBrief = useMemo(
    () => (focus ? economyMonthlyBrief(focus, euroArea) : ""),
    [focus, euroArea],
  );

  if (!focus) {
    return <EconomyMissing />;
  }

  return (
    <article className="space-y-10">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />

      <header>
        <Badge tone="cyan" className="mb-4">
          Eurostat + ECB · monthly brief
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          How is the euro area economy printing?
        </h1>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block max-w-md">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
            Spotlight
          </span>
          <select
            value={geoId}
            onChange={(e) => setGeoId(e.target.value as EconomyGeoId)}
            className="focus-ring mt-2 w-full appearance-none rounded-xl border border-white/10 bg-void-800 px-4 py-3 text-sm text-white"
          >
            <optgroup label="Areas">
              {ECONOMY_GEOS.filter((g) => g.kind === "area").map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Countries">
              {ECONOMY_GEOS.filter((g) => g.kind === "country").map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
          Showing {focus.label}
          {spotlighting ? " · vs euro area below" : ""}
        </p>
      </div>

      <p className="max-w-3xl text-base leading-relaxed text-slate-300">
        {monthlyBrief}
      </p>

      <section aria-label={`${focus.label} latest`}>
        <p className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
          Latest · {focus.label}
        </p>
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {ECONOMY_METRICS.map((m) => {
            const cell = cellFor(focus.latest, m.id);
            return (
              <div key={m.id}>
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                  {m.label}
                </dt>
                <dd
                  className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${toneForMetric(m.id, cell?.delta ?? null)}`}
                >
                  {formatValue(m.id, cell?.value ?? null)}
                </dd>
                <p className="mt-1 font-mono text-[0.7rem] text-slate-500">
                  {cell ? formatPeriod(cell.period) : "—"}
                  {cell?.delta !== null && cell?.delta !== undefined
                    ? ` · ${formatDelta(m.id, cell.delta)}`
                    : ""}
                </p>
              </div>
            );
          })}
        </dl>
        {spotlighting && focus.kind === "country" ? (
          <p className="mt-4 text-sm text-slate-500">
            ECB deposit rate is the euro-area instrument — same print on every
            country spotlight.
          </p>
        ) : null}
      </section>

      {spotlighting && euroArea ? (
        <section aria-label="Euro area comparison">
          <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
            Euro area · same periods where available
          </p>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {ECONOMY_METRICS.map((m) => {
              const cell = cellFor(euroArea.latest, m.id);
              const focusCell = cellFor(focus.latest, m.id);
              const gap =
                cell?.value !== null &&
                cell?.value !== undefined &&
                focusCell?.value !== null &&
                focusCell?.value !== undefined
                  ? focusCell.value - cell.value
                  : null;
              return (
                <div key={m.id} className="border-l border-white/10 pl-3">
                  <dt className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-slate-500">
                    {m.label}
                  </dt>
                  <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-200">
                    {formatValue(m.id, cell?.value ?? null)}
                  </dd>
                  <p className="mt-0.5 font-mono text-[0.65rem] text-slate-500">
                    {gap === null
                      ? "—"
                      : `gap ${gap > 0 ? "+" : ""}${gap.toFixed(1)}`}
                  </p>
                </div>
              );
            })}
          </dl>
        </section>
      ) : null}

      <section className="space-y-8" aria-label="Trends">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">
            Trends
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            History for {focus.label}. Policy rate is ECB deposit facility
            (change dates).
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {ECONOMY_METRICS.map((m) => {
            const series = focus.series.find((s) => s.metric === m.id);
            const points =
              series?.points
                .filter((p) => p.value !== null)
                .map((p) => ({ period: p.period, value: p.value as number })) ??
              [];
            return (
              <EconomyTape
                key={m.id}
                points={points}
                label={m.label}
                unit={m.unit}
                stroke={TAPE_STROKE[m.id]}
                fill={TAPE_FILL[m.id]}
              />
            );
          })}
        </div>
      </section>

      {headlines.length > 0 ? (
        <section aria-label="Headlines">
          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-white">
              Headlines
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {geoId === ECONOMY_DEFAULT_GEO || headlinesFallback
                ? "Latest ECB press and statistics — euro-area official channel."
                : `Recent macro wires mentioning ${focus.label} (Google News) — inflation, growth, labour, fiscal. Not corporate investment noise, not official statistical releases.`}
              {headlinesFallback
                ? ` No country wires for ${focus.label} this refresh — showing ECB.`
                : ""}
            </p>
          </div>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {headlines.map((h) => (
              <li key={h.id}>
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring group flex flex-col gap-1 py-4 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <span className="text-sm leading-snug text-slate-200 group-hover:text-white">
                    {h.title}
                  </span>
                  <span className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
                    {h.source}
                    {h.publishedAt
                      ? ` · ${formatHeadlineDate(h.publishedAt)}`
                      : ""}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="border-t border-white/10 pt-6 text-sm leading-relaxed text-slate-400">
        <p>As of {formatHelsinki(view.asOf)}.</p>
        <p className="mt-2">
          {view.source}. {view.license}.
        </p>
        <p className="mt-2 text-slate-500">
          HICP is all-items YoY. Unemployment is seasonally adjusted. Confidence
          is the EU consumer confidence balance. GDP is chain-linked QoQ.
          Not a forecast.
        </p>
      </footer>
    </article>
  );
}

export function EconomyMissing() {
  return (
    <article className="space-y-6">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />
      <h1 className="font-display text-3xl font-bold text-white">
        Europe Economy Pulse
      </h1>
      <p className="max-w-xl text-slate-300">
        No snapshot on disk. Run{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-neon-cyan">
          npm run live:fetch-economy
        </code>{" "}
        then reload.
      </p>
    </article>
  );
}
