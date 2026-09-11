"use client";

import { useMemo } from "react";
import type { EuZonePulse } from "@/lib/live/eu-category-meta";
import {
  EU_CATEGORIES,
  formatCategoryValue,
  type EuCategoryId,
} from "@/lib/live/eu-category-meta";
import { PriceTape } from "@/components/live/PriceTape";
import {
  nowcastForPulse,
  windImportExceptions,
} from "@/lib/live/zone-nowcast";

function formatMw(n: number | null): string {
  if (n === null) return "—";
  return `${Math.round(n).toLocaleString("en-US")} MW`;
}

function formatEur(n: number | null): string {
  if (n === null) return "—";
  return `€${n.toFixed(1)}`;
}

function formatHelsinkiUnix(unix: number): string {
  return new Date(unix * 1000).toLocaleString("en-GB", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const W = 960;
const H = 220;
const PAD = { l: 44, r: 8, t: 16, b: 28 };

function ZoneGridTape({ pulse }: { pulse: EuZonePulse }) {
  const n = pulse.t.length;
  if (n < 2) return null;
  let max = 1;
  for (let i = 0; i < n; i++) {
    max = Math.max(
      max,
      pulse.load[i] ?? 0,
      pulse.wind[i] ?? 0,
      Math.abs(pulse.netImport[i] ?? 0),
    );
  }
  const xAt = (i: number) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
  const yAt = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max);
  const xs = pulse.t.map((_, i) => xAt(i));
  const windY = pulse.wind.map((v) => yAt(v ?? 0));
  const loadY = pulse.load.map((v) => yAt(v ?? 0));
  const importY = pulse.netImport.map((v) => yAt(Math.max(0, v ?? 0)));
  const baseY = yAt(0);
  const area = (() => {
    if (!xs.length) return "";
    return `M ${xs[0]} ${baseY} ${xs.map((x, i) => `L ${x} ${windY[i]}`).join(" ")} L ${xs[n - 1]} ${baseY} Z`;
  })();
  const line = (ys: number[]) =>
    xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Load, wind, and net import over the last two days"
      >
        <rect width={W} height={H} className="fill-void-800/40" />
        <path d={area} className="fill-neon-cyan/25" />
        <path
          d={line(windY)}
          fill="none"
          className="stroke-neon-cyan"
          strokeWidth={2}
        />
        <path d={line(loadY)} fill="none" stroke="white" strokeWidth={2} />
        <path
          d={line(importY)}
          fill="none"
          className="stroke-rose-400"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-400">
        <span className="text-neon-cyan">Wind</span>
        <span className="text-white">Load</span>
        <span className="text-rose-400">Net import</span>
      </figcaption>
    </figure>
  );
}

function categoryHeadline(c: EuCategoryId, pulse: EuZonePulse): number | null {
  const L = pulse.latest;
  switch (c) {
    case "market":
      return L.price;
    case "load":
      return L.loadMw;
    case "generation":
      return L.genMw;
    case "transmission":
      return L.netImportMw;
    case "outages":
      return L.outageCount;
    case "balancing":
      return L.imbalanceEur;
    case "operation":
      return L.loadErrorPct;
    case "omi":
      return L.installedMw;
  }
}

/** Zone desk: net flow, mix, tape, mix nowcast — same spine for every zone. */
export function EuZonePulsePanel({
  pulse,
  category,
  onCategory,
}: {
  pulse: EuZonePulse;
  category: EuCategoryId;
  onCategory: (id: EuCategoryId) => void;
}) {
  const L = pulse.latest;
  const importing = (L.netImportMw ?? 0) > 40;
  const exporting = (L.netImportMw ?? 0) < -40;
  const nowcast = useMemo(() => nowcastForPulse(pulse), [pulse]);
  const exceptions = useMemo(() => windImportExceptions(pulse), [pulse]);
  const windShare =
    L.loadMw && L.windMw !== null ? (L.windMw / L.loadMw) * 100 : null;

  return (
    <section className="space-y-8 border-t border-white/10 pt-8">
      <header>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-slate-400">
          Zone desk · {pulse.id}
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {pulse.label}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
          Is {pulse.label} importing because the wind dropped? Mix, load, and
          a one-step nowcast against published day-ahead.
        </p>
      </header>

      <div className="border-y border-white/10 py-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-slate-400">
          Net flow now
        </p>
        <p
          className={`mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl ${
            importing
              ? "text-rose-300"
              : exporting
                ? "text-neon-cyan"
                : "text-white"
          }`}
        >
          {L.netImportMw === null
            ? "—"
            : importing
              ? "Importing"
              : exporting
                ? "Exporting"
                : "Balanced"}
          {L.netImportMw !== null ? (
            <span className="ml-3 text-2xl font-semibold tabular-nums text-white">
              {formatMw(Math.abs(L.netImportMw))}
            </span>
          ) : null}
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
          Wind {formatMw(L.windMw)}
          {windShare !== null ? ` · ${windShare.toFixed(0)}% of load` : ""}
          {" · "}Nuclear {formatMw(L.nuclearMw)} · Hydro {formatMw(L.hydroMw)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {(
          [
            ["Wind", L.windMw],
            ["Nuclear", L.nuclearMw],
            ["Hydro", L.hydroMw],
            ["Load", L.loadMw],
          ] as const
        ).map(([label, v]) => (
          <div key={label}>
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
              {label}
            </dt>
            <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
              {formatMw(v)}
            </dd>
          </div>
        ))}
      </dl>

      <div>
        <h3 className="font-display text-lg font-semibold text-white">
          Transparency categories
        </h3>
        <p className="mt-1 mb-4 text-sm text-slate-400">
          Headline from each ENTSO-E domain. Tap to colour the map.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EU_CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onCategory(c.id)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-neon-cyan/50 bg-neon-cyan/10"
                    : "border-white/10 bg-white/5 hover:border-white/25"
                }`}
              >
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-slate-400">
                  {c.label}
                </p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
                  {formatCategoryValue(c.id, categoryHeadline(c.id, pulse))}
                </p>
                <p className="mt-1 text-xs text-slate-500">{c.blurb}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-white">
          Last two days on the tape
        </h3>
        <p className="mt-1 mb-4 text-sm text-slate-400">
          When the cyan fill falls and the rose dashed line rises, this zone
          is covering the gap with imports.
        </p>
        <ZoneGridTape pulse={pulse} />
      </div>

      {nowcast && nowcast.score.n > 0 ? (
        <div>
          <h3 className="font-display text-lg font-semibold text-white">
            Mix nowcast vs day-ahead
          </h3>
          <p className="mt-1 mb-4 text-sm text-slate-400">
            Wind share, net import, and load from the previous hour, plus the
            last print. White is day-ahead; amber is the nowcast.
          </p>
          <p className="mb-5 text-sm leading-relaxed text-slate-300">
            Last print {formatEur(nowcast.lastActual)} · nowcast{" "}
            {formatEur(nowcast.lastNowcast)}
            {nowcast.nextHour !== null
              ? ` · next hour ${formatEur(nowcast.nextHour)}`
              : ""}
          </p>
          <dl className="mb-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                Nowcast MAE
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
                {formatEur(nowcast.score.mae)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                Last-print MAE
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
                {formatEur(nowcast.score.persistMae)}
              </dd>
            </div>
            {nowcast.score.ydayMae !== null ? (
              <div>
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                  Yesterday MAE
                </dt>
                <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
                  {formatEur(nowcast.score.ydayMae)}
                </dd>
              </div>
            ) : null}
          </dl>
          <PriceTape
            points={nowcast.points.map((p) => ({
              t: p.t,
              actual: p.actual,
              nowcast: p.nowcast,
            }))}
          />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            {nowcast.score.mae < nowcast.score.persistMae ? "Beats" : "Loses to"}{" "}
            last-print persistence
            {nowcast.score.ydayMae !== null
              ? ` · ${nowcast.score.mae < nowcast.score.ydayMae ? "beats" : "loses to"} yesterday same hour`
              : ""}
            . {nowcast.score.n} hours in this window.
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          Not enough mix + price hours on this zone yet for a nowcast.
        </p>
      )}

      <div>
        <h3 className="font-display text-lg font-semibold text-white">
          Wind down, imports up
        </h3>
        {exceptions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            No hourly step in this window had both a wind drop and an import
            rise over 80 MW.
          </p>
        ) : (
          <ol className="mt-4 space-y-3 border-l border-white/10 pl-4">
            {exceptions.map((ex) => (
              <li key={ex.t} className="text-sm leading-relaxed text-slate-300">
                <span className="font-mono text-slate-400">
                  {formatHelsinkiUnix(ex.t)}
                </span>
                <span className="mt-0.5 block">{ex.note}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
