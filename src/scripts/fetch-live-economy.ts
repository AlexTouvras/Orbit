/**
 * Snapshot Euro-area economy pulse into data/live/economy.json.
 *
 *   npm run live:fetch-economy
 *
 * Sources: Eurostat Statistics API + ECB Data Portal (CSV). Free with attribution.
 */
import fs from "node:fs";
import path from "node:path";
import {
  ECONOMY_DEFAULT_GEO,
  ECONOMY_GEOS,
  type EconomyGeoBundle,
  type EconomyGeoId,
  type EconomyLatestCell,
  type EconomyMetricId,
  type EconomyPoint,
  type EconomySeries,
  type EconomySnapshot,
} from "@/lib/live/economy-types";

const EUROSTAT =
  "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";

type JsonStat = {
  id: string[];
  size: number[];
  value: Record<string, number | null> | Array<number | null>;
  dimension: Record<
    string,
    {
      category: {
        index: Record<string, number>;
        label: Record<string, string>;
      };
    }
  >;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url: string, label: string): Promise<JsonStat> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "orbit-live/1.0" },
      });
      if (res.status === 429) {
        await sleep(1500 * attempt);
        continue;
      }
      if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
      return (await res.json()) as JsonStat;
    } catch (err) {
      if (attempt === 3) throw err;
      console.warn(
        `[live:economy] ${label} attempt ${attempt}:`,
        err instanceof Error ? err.message : err,
      );
      await sleep(1000 * attempt);
    }
  }
  throw new Error(`${label}: exhausted retries`);
}

async function fetchText(url: string, label: string): Promise<string> {
  const res = await fetch(url, {
    headers: { Accept: "text/csv,*/*", "User-Agent": "orbit-live/1.0" },
  });
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
  return res.text();
}

function codesInOrder(js: JsonStat, dim: string): string[] {
  const index = js.dimension[dim]?.category.index ?? {};
  return Object.entries(index)
    .sort((a, b) => a[1] - b[1])
    .map(([code]) => code);
}

function valueAt(js: JsonStat, coords: Record<string, string>): number | null {
  const dims = js.id;
  let flat = 0;
  for (let i = 0; i < dims.length; i++) {
    const dim = dims[i]!;
    const code = coords[dim];
    if (code === undefined) throw new Error(`Missing dim ${dim}`);
    const idx = js.dimension[dim]?.category.index[code];
    if (idx === undefined) return null;
    flat = flat * (js.size[i] ?? 1) + idx;
  }
  const raw = Array.isArray(js.value) ? js.value[flat] : js.value[String(flat)];
  return raw === undefined || raw === null || !Number.isFinite(raw)
    ? null
    : raw;
}

/** Our geo id → Eurostat geo code for a metric. */
function eurostatGeo(metric: EconomyMetricId, geo: EconomyGeoId): string {
  if (geo === "EA21") {
    // HICP evolving aggregate is "EA"; labour/sentiment use EA21.
    if (metric === "inflation") return "EA";
    return "EA21";
  }
  return geo;
}

function geoQuery(codes: string[]): string {
  return [...new Set(codes)]
    .map((g) => `geo=${encodeURIComponent(g)}`)
    .join("&");
}

function seriesFromStat(
  js: JsonStat,
  metric: EconomyMetricId,
  geo: EconomyGeoId,
  fixed: Record<string, string>,
): EconomySeries {
  const estat = eurostatGeo(metric, geo);
  const times = codesInOrder(js, "time");
  const points: EconomyPoint[] = times.map((period) => {
    if (js.dimension.geo?.category.index[estat] === undefined) {
      return { period, value: null };
    }
    return {
      period,
      value: valueAt(js, { ...fixed, geo: estat, time: period }),
    };
  });
  return { metric, geo, points };
}

function latestCell(series: EconomySeries): EconomyLatestCell {
  let last: { period: string; value: number } | null = null;
  let prev: number | null = null;
  for (let i = series.points.length - 1; i >= 0; i--) {
    const p = series.points[i]!;
    if (p.value === null) continue;
    if (!last) {
      last = { period: p.period, value: p.value };
      continue;
    }
    prev = p.value;
    break;
  }
  if (!last) {
    return {
      metric: series.metric,
      period: series.points.at(-1)?.period ?? "—",
      value: null,
      delta: null,
    };
  }
  return {
    metric: series.metric,
    period: last.period,
    value: last.value,
    delta: prev === null ? null : last.value - prev,
  };
}

/**
 * Pull one Eurostat cube, resolve dimension filters against the response,
 * and fan out one series per requested geo.
 */
async function fetchMetricSeries(
  metric: EconomyMetricId,
  geos: EconomyGeoId[],
  dataset: string,
  preferred: Record<string, string>,
  lastTimePeriod: number,
): Promise<EconomySeries[]> {
  const estatGeos = geos.map((g) => eurostatGeo(metric, g));
  const preferredQs = Object.entries(preferred)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  const url = `${EUROSTAT}/${dataset}?lang=EN&lastTimePeriod=${lastTimePeriod}&${preferredQs}&${geoQuery(estatGeos)}`;
  console.log(`[live:economy] ${metric} ← ${dataset}`);
  const js = await fetchJson(url, metric);

  const fixed: Record<string, string> = {};
  for (const dim of js.id) {
    if (dim === "geo" || dim === "time") continue;
    const want = preferred[dim];
    if (want && js.dimension[dim]?.category.index[want] !== undefined) {
      fixed[dim] = want;
      continue;
    }
    // freq is usually M/Q — take the sole code.
    const codes = codesInOrder(js, dim);
    if (codes.length === 1 && codes[0]) {
      fixed[dim] = codes[0];
      continue;
    }
    // Prefer SA / SCA / TOTAL-like codes when present.
    const prefer = codes.find((c) =>
      ["SA", "SCA", "TOTAL", "T", "BAL"].includes(c),
    );
    if (prefer) {
      fixed[dim] = prefer;
      continue;
    }
    if (codes[0]) fixed[dim] = codes[0];
  }

  // Also apply preferred keys that match dim names we sent.
  for (const [k, v] of Object.entries(preferred)) {
    if (js.dimension[k]?.category.index[v] !== undefined) fixed[k] = v;
  }

  return geos.map((g) => seriesFromStat(js, metric, g, fixed));
}

async function fetchPolicyRate(): Promise<EconomySeries> {
  const url =
    "https://data-api.ecb.europa.eu/service/data/FM/B.U2.EUR.4F.KR.DFR.LEV?lastNObservations=48&format=csvdata";
  console.log("[live:economy] policyRate ← ECB DFR");
  const csv = await fetchText(url, "ECB DFR");
  const lines = csv.trim().split(/\r?\n/);
  const header = parseCsvLine(lines[0] ?? "");
  const ti = header.indexOf("TIME_PERIOD");
  const vi = header.indexOf("OBS_VALUE");
  if (ti < 0 || vi < 0) {
    throw new Error("ECB CSV missing TIME_PERIOD/OBS_VALUE");
  }
  const points: EconomyPoint[] = [];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    const period = cols[ti] ?? "";
    const raw = cols[vi];
    const value =
      raw === undefined || raw === "" ? null : Number.parseFloat(raw);
    points.push({
      period,
      value: value !== null && Number.isFinite(value) ? value : null,
    });
  }
  return { metric: "policyRate", geo: "EA21", points };
}

/** Minimal CSV split that respects double-quoted fields. */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function buildBundle(
  geo: EconomyGeoId,
  byMetric: Map<EconomyMetricId, EconomySeries>,
  policy: EconomySeries,
): EconomyGeoBundle {
  const meta = ECONOMY_GEOS.find((g) => g.id === geo)!;
  const order: EconomyMetricId[] = [
    "inflation",
    "unemployment",
    "confidence",
    "gdp",
    "policyRate",
  ];
  const series: EconomySeries[] = order.map((m) => {
    if (m === "policyRate") return { ...policy, geo };
    return byMetric.get(m) ?? { metric: m, geo, points: [] };
  });
  return {
    id: geo,
    label: meta.label,
    short: meta.short,
    kind: meta.kind,
    latest: series.map(latestCell),
    series,
  };
}

async function main() {
  const geos = ECONOMY_GEOS.map((g) => g.id);

  const [inflation, unemployment, confidence, gdp, policyRate] =
    await Promise.all([
      fetchMetricSeries("inflation", geos, "prc_hicp_manr", { coicop: "CP00" }, 48),
      fetchMetricSeries("unemployment", geos, "une_rt_m", { s_adj: "SA", age: "TOTAL", unit: "PC_ACT", sex: "T" }, 48),
      fetchMetricSeries("confidence", geos, "ei_bssi_m_r2", { indic: "BS-CSMCI-BAL", s_adj: "SA" }, 48),
      fetchMetricSeries("gdp", geos, "namq_10_gdp", { na_item: "B1GQ", unit: "CLV_PCH_PRE", s_adj: "SCA" }, 24),
      fetchPolicyRate(),
    ]);

  const bundles: EconomyGeoBundle[] = [];
  for (const geo of geos) {
    const byMetric = new Map<EconomyMetricId, EconomySeries>();
    for (const s of inflation) if (s.geo === geo) byMetric.set("inflation", s);
    for (const s of unemployment)
      if (s.geo === geo) byMetric.set("unemployment", s);
    for (const s of confidence)
      if (s.geo === geo) byMetric.set("confidence", s);
    for (const s of gdp) if (s.geo === geo) byMetric.set("gdp", s);
    bundles.push(buildBundle(geo, byMetric, policyRate));
  }

  const ea = bundles.find((b) => b.id === "EA21");
  const hicp = ea?.latest.find((c) => c.metric === "inflation");
  if (!hicp || hicp.value === null) {
    throw new Error("Refusing empty desk: no Euro-area HICP print");
  }

  const snap: EconomySnapshot = {
    asOf: new Date().toISOString(),
    source:
      "Eurostat (HICP, unemployment, consumer confidence, GDP) + ECB Data Portal (deposit facility)",
    license:
      "Eurostat / ECB — free reuse with attribution (CC BY 4.0 where stated)",
    defaultGeo: ECONOMY_DEFAULT_GEO,
    policyRate,
    geos: bundles,
  };

  const out = path.join(process.cwd(), "data", "live", "economy.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(snap, null, 2)}\n`, "utf8");
  console.log(
    `[live:economy] wrote ${out} · EA HICP ${hicp.period} ${hicp.value}% · geos ${bundles.length}`,
  );
}

main().catch((err) => {
  console.error("[live:economy] failed:", err);
  process.exit(1);
});
