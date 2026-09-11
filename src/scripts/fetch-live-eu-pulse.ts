/**
 * Enrich data/live/eu-spot.json with ENTSO-E Load / Generation / Outages /
 * Balancing / Operation / OMI pulse series for each zone.
 *
 *   npm run live:fetch-eu-pulse
 *   npm run live:fetch-eu-pulse -- --fill
 */
import fs from "node:fs";
import path from "node:path";
import { EU_ZONES, type EuSpotSnapshot } from "@/lib/live/eu-spot-types";
import {
  buildZonePulse,
  fetchZonePulseExtras,
  type EuZonePulse,
} from "@/lib/live/eu-categories";
import { loadEntsoeToken } from "@/lib/live/entsoe-a44";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const fillOnly = process.argv.includes("--fill");
  const token = loadEntsoeToken();
  if (!token) {
    throw new Error("ENTSOE_SECURITY_TOKEN required for pulse fetch");
  }

  const out = path.join(process.cwd(), "data", "live", "eu-spot.json");
  if (!fs.existsSync(out)) {
    throw new Error(`missing ${out} — run npm run live:fetch-eu first`);
  }

  const snap = JSON.parse(fs.readFileSync(out, "utf8")) as EuSpotSnapshot;
  const byPulse = new Map<string, EuZonePulse>(
    (snap.pulses ?? []).map((p) => [p.id, p]),
  );

  const end = new Date();
  const start = new Date(end.getTime() - 48 * 3600 * 1000);
  const zones = snap.zones;
  let ok = 0;
  let fail = 0;

  for (const series of zones) {
    const meta = EU_ZONES.find((z) => z.id === series.id);
    if (!meta) continue;
    if (fillOnly && byPulse.has(series.id)) continue;

    console.log(`[live:eu-pulse] ${series.id} (${meta.eic})`);
    try {
      const extras = await fetchZonePulseExtras(meta.eic, start, end, token);
      await sleep(600);
      if (!extras) {
        console.warn(`[live:eu-pulse] skip ${series.id}: no extras`);
        fail += 1;
        continue;
      }
      const pulse = buildZonePulse({
        id: series.id,
        label: series.label,
        geoStem: series.geoStem,
        priceSeries: { t: series.t, price: series.price },
        extras,
      });
      byPulse.set(series.id, pulse);
      ok += 1;
      const L = pulse.latest;
      console.log(
        `  load ${L.loadMw?.toFixed(0) ?? "—"} MW · gen ${L.genMw?.toFixed(0) ?? "—"} MW · outages ${L.outageCount ?? "—"}`,
      );
    } catch (err) {
      fail += 1;
      console.warn(
        `[live:eu-pulse] ${series.id} failed:`,
        err instanceof Error ? err.message : err,
      );
      await sleep(1000);
    }
  }

  const pulses = zones
    .map((z) => byPulse.get(z.id))
    .filter((p): p is EuZonePulse => Boolean(p));

  snap.pulses = pulses;
  snap.asOf = new Date().toISOString();
  snap.source =
    "ENTSO-E Transparency · Market A44 + Load/Gen/Outages/Balancing/OMI pulse";
  fs.writeFileSync(out, `${JSON.stringify(snap, null, 2)}\n`, "utf8");
  console.log(
    `[live:eu-pulse] wrote ${pulses.length} pulses (ok ${ok}, fail ${fail}) → ${out}`,
  );
}

void main().catch((err) => {
  console.error("[live:eu-pulse] failed:", err);
  process.exit(1);
});
