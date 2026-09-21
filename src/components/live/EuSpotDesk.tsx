"use client";

import { useState } from "react";
import type { EuSpotView, EuZoneId } from "@/lib/live/eu-spot-types";
import {
  EU_CATEGORIES,
  type EuCategoryId,
} from "@/lib/live/eu-category-meta";
import { BackLink } from "@/components/ui/BackLink";
import { DeskStoryHeader } from "@/components/story/DeskStoryHeader";
import { EuSpotMap } from "@/components/live/EuSpotMap";
import { EuSpotHistory } from "@/components/live/EuSpotHistory";
import { EuZonePulsePanel } from "@/components/live/EuZonePulsePanel";

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
  const [selected, setSelected] = useState<EuZoneId | null>(null);
  const [category, setCategory] = useState<EuCategoryId>("market");
  const selectedPulse = selected
    ? view.pulses.find((p) => p.id === selected)
    : undefined;

  return (
    <article className="space-y-8">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />

      <DeskStoryHeader
        kicker={`ENTSO-E · ${view.today.length} zones`}
        question="Where is Europe expensive tonight?"
        lede="Hover a bidding zone for mix and price. Press it for the full desk — load, generation, net flow, and a mix nowcast — the same reading order for Finland as for every other zone."
      />

      {view.localhostOnly ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
          Localhost only — re-run{" "}
          <code className="font-mono text-xs">npm run live:fetch-eu</code> with{" "}
          <code className="font-mono text-xs">ENTSOE_SECURITY_TOKEN</code>{" "}
          before any public deploy.
        </p>
      ) : null}

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
          onSelect={(id) =>
            setSelected((prev) => (prev === id ? null : id))
          }
        />
      ) : (
        <EuSpotHistory
          view={view}
          selected={selected ?? view.today[0]?.id ?? "FI"}
          onSelect={(id) => setSelected(id)}
        />
      )}

      {mode === "map" && selectedPulse ? (
        <EuZonePulsePanel
          pulse={selectedPulse}
          category={category}
          onCategory={setCategory}
        />
      ) : null}

      {mode === "map" && !selected ? (
        <p className="text-sm text-slate-500">
          Press a filled zone to open its desk.
        </p>
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
