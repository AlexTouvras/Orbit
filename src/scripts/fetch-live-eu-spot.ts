/**
 * Snapshot EU day-ahead prices into data/live/eu-spot.json.
 *
 *   npm run live:fetch-eu
 *   npm run live:fill-eu   # merge missing zones only
 *
 * Prefers ENTSO-E A44 when ENTSOE_SECURITY_TOKEN is set; else Energy-Charts.
 */
import fs from "node:fs";
import path from "node:path";
import {
  EU_ZONES,
  type EuSpotSnapshot,
  type EuZoneDayStats,
  type EuZoneSeries,
} from "@/lib/live/eu-spot-types";
import {
  fetchA44DayAhead,
  loadEntsoeToken,
  type EntsoePricePoint,
} from "@/lib/live/entsoe-a44";

type PublicPrice = {
  unix_seconds?: number[];
  price?: Array<number | null>;
  license_info?: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isoFromUnix(sec: number): string {
  return new Date(sec * 1000).toISOString();
}

function helsinkiYmd(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-CA", {
    timeZone: "Europe/Helsinki",
  });
}

function dayStats(
  series: EuZoneSeries,
  fiBaseload: number | null,
): EuZoneDayStats {
  const today = helsinkiYmd(Date.now());
  const yesterday = helsinkiYmd(Date.now() - 24 * 3600 * 1000);
  const todayPts: number[] = [];
  const ydayPts: number[] = [];
  for (let i = 0; i < series.t.length; i++) {
    const ts = series.t[i];
    const px = series.price[i];
    if (ts === undefined || px === undefined) continue;
    const day = helsinkiYmd(ts);
    if (day === today) todayPts.push(px);
    if (day === yesterday) ydayPts.push(px);
  }
  const window = todayPts.length ? todayPts : series.price.slice(-24);
  const baseload =
    window.reduce((a, b) => a + b, 0) / Math.max(window.length, 1);
  const peak = Math.max(...window);
  const trough = Math.min(...window);
  const latest = window[window.length - 1] ?? series.price.at(-1) ?? 0;
  const yBaseload = ydayPts.length
    ? ydayPts.reduce((a, b) => a + b, 0) / ydayPts.length
    : null;
  return {
    id: series.id,
    label: series.label,
    geoStem: series.geoStem,
    baseload,
    peak,
    trough,
    latest,
    spreadVsFi: fiBaseload === null ? 0 : baseload - fiBaseload,
    dayOverDay: yBaseload === null ? null : baseload - yBaseload,
  };
}

async function fetchEnergyCharts(
  bzn: string,
  start: Date,
  end: Date,
): Promise<PublicPrice | null> {
  const url = new URL("https://api.energy-charts.info/price");
  url.searchParams.set("bzn", bzn);
  url.searchParams.set("start", start.toISOString());
  url.searchParams.set("end", end.toISOString());
  console.log(`[live:eu-spot] Energy-Charts ${bzn}`);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.status === 429) {
        await sleep(2500 * attempt);
        continue;
      }
      if (!res.ok) {
        console.warn(`[live:eu-spot] skip ${bzn}: ${res.status}`);
        return null;
      }
      return (await res.json()) as PublicPrice;
    } catch (err) {
      console.warn(
        `[live:eu-spot] ${bzn} attempt ${attempt} failed:`,
        err instanceof Error ? err.message : err,
      );
      await sleep(1500 * attempt);
    }
  }
  console.warn(`[live:eu-spot] skip ${bzn}: network`);
  return null;
}

function seriesFromEnergyCharts(
  z: (typeof EU_ZONES)[number],
  body: PublicPrice,
): EuZoneSeries | null {
  const t = body.unix_seconds ?? [];
  const raw = body.price ?? [];
  const price: number[] = [];
  const tt: number[] = [];
  for (let i = 0; i < t.length; i++) {
    const ts = t[i];
    const v = raw[i];
    if (ts === undefined || v === null || !Number.isFinite(v)) continue;
    tt.push(ts);
    price.push(v);
  }
  if (tt.length < 24) {
    console.warn(`[live:eu-spot] skip ${z.id}: short series ${tt.length}`);
    return null;
  }
  return {
    id: z.id,
    label: z.label,
    geoStem: z.geoStem,
    publishable: z.publishable,
    t: tt,
    price,
  };
}

function seriesFromEntsoe(
  z: (typeof EU_ZONES)[number],
  points: EntsoePricePoint[],
): EuZoneSeries | null {
  if (points.length < 24) {
    console.warn(`[live:eu-spot] skip ${z.id}: short series ${points.length}`);
    return null;
  }
  return {
    id: z.id,
    label: z.label,
    geoStem: z.geoStem,
    publishable: true,
    t: points.map((p) => p.t),
    price: points.map((p) => p.price),
  };
}

async function main() {
  const fillOnly = process.argv.includes("--fill");
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  const out = path.join(process.cwd(), "data", "live", "eu-spot.json");
  const token = loadEntsoeToken();
  const useEntsoe = Boolean(token);

  if (useEntsoe) {
    console.log("[live:eu-spot] source=ENTSO-E A44");
  } else {
    console.log(
      "[live:eu-spot] source=Energy-Charts (set ENTSOE_SECURITY_TOKEN for A44)",
    );
  }

  const byId = new Map<string, EuZoneSeries>();
  if (fillOnly && fs.existsSync(out)) {
    const prev = JSON.parse(fs.readFileSync(out, "utf8")) as EuSpotSnapshot;
    for (const z of prev.zones ?? []) byId.set(z.id, z);
    console.log(`[live:eu-spot] --fill keeping ${byId.size} existing zones`);
  }

  const skipped: string[] = [];
  const toFetch = EU_ZONES.filter((z) => !(fillOnly && byId.has(z.id)));

  for (const z of toFetch) {
    let series: EuZoneSeries | null = null;
    if (useEntsoe && token) {
      console.log(`[live:eu-spot] GET ${z.id} (${z.eic})`);
      const points = await fetchA44DayAhead(z.eic, start, end, token);
      await sleep(500);
      if (points) series = seriesFromEntsoe(z, points);
    } else {
      const body = await fetchEnergyCharts(z.energyChartsBzn, start, end);
      await sleep(1400);
      if (body) series = seriesFromEnergyCharts(z, body);
    }
    if (!series) {
      skipped.push(z.id);
      continue;
    }
    byId.set(series.id, series);
  }

  const zones = EU_ZONES.map((z) => byId.get(z.id)).filter(
    (z): z is EuZoneSeries => Boolean(z),
  );

  if (zones.length < 4) {
    throw new Error(`too few zones fetched (${zones.length})`);
  }

  const fiSeries = zones.find((z) => z.id === "FI");
  const fiBaseload = fiSeries
    ? dayStats(fiSeries, null).baseload
    : null;
  const todayFixed = zones
    .map((z) => dayStats(z, fiBaseload))
    .sort((a, b) => b.baseload - a.baseload);

  const allT = zones.flatMap((z) => z.t);
  const anyPrivate = zones.some((z) => !z.publishable);

  const snapshot: EuSpotSnapshot = {
    asOf: new Date().toISOString(),
    windowStart: isoFromUnix(Math.min(...allT)),
    windowEnd: isoFromUnix(Math.max(...allT)),
    source: useEntsoe
      ? "ENTSO-E Transparency Platform · Energy Prices A44 (day-ahead)"
      : "Energy-Charts /price (Fraunhofer ISE) — set ENTSOE_SECURITY_TOKEN for A44",
    license: useEntsoe
      ? "ENTSO-E Transparency Platform data. Attribution: ENTSO-E. See platform terms of use."
      : anyPrivate
        ? "Mixed Energy-Charts licences: some zones CC BY 4.0 (SMARD), others private/internal only. Localhost review — do not deploy until ENTSO-E backs every painted zone."
        : "CC BY 4.0 where marked on Energy-Charts.",
    localhostOnly: useEntsoe ? false : anyPrivate,
    zones,
    today: todayFixed,
  };

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `[live:eu-spot] wrote ${zones.length}/${EU_ZONES.length} zones (this run skipped ${skipped.length}: ${skipped.join(", ") || "—"}) → ${out}`,
  );
  console.log(
    `[live:eu-spot] localhostOnly=${snapshot.localhostOnly} source=${useEntsoe ? "ENTSO-E" : "Energy-Charts"}`,
  );
  for (const row of todayFixed.slice(0, 8)) {
    console.log(
      `  ${row.id.padEnd(12)} baseload €${row.baseload.toFixed(1)}  ΔFI €${row.spreadVsFi.toFixed(1)}`,
    );
  }
}

void main().catch((err) => {
  console.error("[live:eu-spot] failed:", err);
  process.exit(1);
});
