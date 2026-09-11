"use client";

import { useState } from "react";
import type { EuSpotView, EuZoneId } from "@/lib/live/eu-spot-types";
import {
  EU_CATEGORIES,
  type EuCategoryId,
} from "@/lib/live/eu-category-meta";
import { BackLink } from "@/components/ui/BackLink";
import { Badge } from "@/components/ui/Badge";
import { EuSpotMap } from "@/components/live/EuSpotMap";
import { EuSpotHistory } from "@/components/live/EuSpotHistory";
import { EuZonePulsePanel } from "@/components/live/EuZonePulsePanel";

function formatEur(n: number): string {
  return `€${n.toFixed(1)}`;
}

function formatHelsinki(iso: string): string {
  return `${new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} Helsinki`;
}

export function EuSpotDesk({ view }: { view: EuSpotView }) {
  const [mode, setMode] = useState<"map" | "history">("map");
  const [selected, setSelected] = useState<EuZoneId>("FI");
  const [category, setCategory] = useState<EuCategoryId>("market");
  const fi = view.today.find((z) => z.id === "FI");
  const selectedPulse = view.pulses.find((p) => p.id === selected);
  const selectedRow = view.today.find((z) => z.id === selected);

  return (
    <article className="space-y-8">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />

      <header>
        <Badge tone="cyan" className="mb-4">
          ENTSO-E · {view.today.length} zones
          {view.pulses.length
            ? ` · ${view.pulses.length} zone desks`
            : ""}
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Where is Europe expensive tonight?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
          Bidding zones across Market, Load, Generation, Transmission,
          Outages, Balancing, Operation, and OMI. Hover the map; press a zone
          for a Finland-style desk.
        </p>
      </header>

      {view.localhostOnly ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
          Localhost only — price source still mixes Energy-Charts private
          zones. Re-run{" "}
          <code className="font-mono text-xs">npm run live:fetch-eu</code> with{" "}
          <code className="font-mono text-xs">ENTSOE_SECURITY_TOKEN</code>{" "}
          before any public deploy.
        </p>
      ) : null}

      <div className="border-y border-white/10 py-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-slate-400">
          FI baseload today
        </p>
        <p className="mt-2 font-display text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl">
          {fi ? formatEur(fi.baseload) : "—"}
          <span className="ml-2 text-lg font-medium text-slate-400">/ MWh</span>
        </p>
        {fi ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
            Peak {formatEur(fi.peak)} · trough {formatEur(fi.trough)}
            {fi.dayOverDay !== null
              ? ` · day-over-day ${fi.dayOverDay >= 0 ? "+" : ""}${formatEur(fi.dayOverDay)}`
              : ""}
          </p>
        ) : null}
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="ENTSO-E category"
      >
        {EU_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={`focus-ring min-h-10 rounded-lg border px-3 text-sm font-medium transition ${
              category === c.id
                ? "border-neon-cyan/40 bg-neon-cyan/15 text-white"
                : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div
        className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1"
        role="tablist"
        aria-label="Desk view"
      >
        {(
          [
            ["map", "Map"],
            ["history", "History"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={`focus-ring min-h-11 rounded-lg px-4 text-sm font-medium transition-colors ${
              mode === id
                ? "bg-white/15 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "map" ? (
        <EuSpotMap
          view={view}
          selected={selected}
          category={category}
          onSelect={setSelected}
        />
      ) : (
        <EuSpotHistory view={view} selected={selected} onSelect={setSelected} />
      )}

      {mode === "map" && selectedPulse ? (
        <EuZonePulsePanel
          pulse={selectedPulse}
          category={category}
          onCategory={setCategory}
          vsFiBaseload={view.fiBaseload}
        />
      ) : null}

      {mode === "map" && !selectedPulse && selectedRow ? (
        <section className="border-t border-white/10 pt-6">
          <h2 className="font-display text-lg font-semibold text-white">
            {selectedRow.label}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Price stats only — run{" "}
            <code className="font-mono text-xs text-neon-cyan">
              npm run live:fetch-eu-pulse
            </code>{" "}
            for the full zone desk.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(
              [
                ["Baseload", selectedRow.baseload],
                ["Peak", selectedRow.peak],
                ["Trough", selectedRow.trough],
                ["vs FI", selectedRow.spreadVsFi],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                  {label}
                </dt>
                <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
                  {label === "vs FI" && value >= 0 ? "+" : ""}
                  {formatEur(value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <footer className="border-t border-white/10 pt-6 text-sm leading-relaxed text-slate-400">
        <p>As of {formatHelsinki(view.asOf)}.</p>
        <p className="mt-2">
          {view.source}. {view.license}
        </p>
      </footer>
    </article>
  );
}

export function EuSpotMissing() {
  return (
    <article className="space-y-6">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />
      <h1 className="font-display text-3xl font-bold text-white">EU Spot</h1>
      <p className="max-w-xl text-slate-300">
        No snapshot on disk. Run{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-neon-cyan">
          npm run live:fetch-eu
        </code>{" "}
        then reload.
      </p>
    </article>
  );
}
