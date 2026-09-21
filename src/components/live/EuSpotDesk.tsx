"use client";

import { useState } from "react";
import type { EuSpotView, EuZoneDayStats, EuZoneId } from "@/lib/live/eu-spot-types";
import {
  EU_CATEGORIES,
  type EuCategoryId,
} from "@/lib/live/eu-category-meta";
import { BackLink } from "@/components/ui/BackLink";
import { DeskStoryHeader } from "@/components/story/DeskStoryHeader";
import { DeskCast } from "@/components/story/DeskCast";
import { DeskPicture } from "@/components/story/DeskPicture";
import { DeskClose } from "@/components/story/DeskClose";
import { StoryStat } from "@/components/story/StoryStat";
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

function formatEur(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return `€${n.toFixed(1)}`;
}

function rankedToday(today: EuZoneDayStats[]) {
  const priced = today.filter((z) => Number.isFinite(z.baseload));
  const sorted = [...priced].sort((a, b) => b.baseload - a.baseload);
  return {
    expensive: sorted[0],
    cheap: sorted[sorted.length - 1],
    fi: today.find((z) => z.id === "FI"),
  };
}

export function EuSpotDesk({ view }: { view: EuSpotView }) {
  const [mode, setMode] = useState<"map" | "history">("map");
  const [selected, setSelected] = useState<EuZoneId | null>(null);
  const [category, setCategory] = useState<EuCategoryId>("market");
  const selectedPulse = selected
    ? view.pulses.find((p) => p.id === selected)
    : undefined;
  const { expensive, cheap, fi } = rankedToday(view.today);

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

      <DeskCast className="lg:grid-cols-4">
        <StoryStat
          label="Expensive"
          value={formatEur(expensive?.baseload)}
          hint={expensive ? `${expensive.label} · /MWh` : "—"}
        />
        <StoryStat
          label="Cheap"
          value={formatEur(cheap?.baseload)}
          hint={cheap ? `${cheap.label} · /MWh` : "—"}
        />
        <StoryStat
          label="Finland"
          value={formatEur(fi?.baseload ?? view.fiBaseload)}
          hint={fi ? `${fi.label} · /MWh` : "/MWh"}
        />
        <StoryStat
          label="Zones"
          value={String(view.today.length)}
          countTo={view.today.length}
        />
      </DeskCast>

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

      <DeskPicture label={mode === "map" ? "Bidding-zone map" : "Price history"}>
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
      </DeskPicture>

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

      <DeskClose>
        <p>As of {formatHelsinki(view.asOf)}.</p>
        <p className="mt-2">
          {view.source}. {view.license}
        </p>
        <p className="mt-2 text-slate-500">
          Day-ahead baseload, not a live tick. Press a zone for the pulse desk.
        </p>
      </DeskClose>
    </article>
  );
}
