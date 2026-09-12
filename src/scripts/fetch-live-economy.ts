/**
 * Snapshot Euro-area economy pulse into data/live/economy.json.
 *
 *   npm run live:fetch-economy
 *
 * Sources: Eurostat Statistics API + ECB Data Portal (CSV). Free with attribution.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Parser from "rss-parser";
import {
  ECONOMY_DEFAULT_GEO,
  ECONOMY_GEOS,
  type EconomyGeoBundle,
  type EconomyGeoId,
  type EconomyHeadline,
  type EconomyLatestCell,
  type EconomyMetricId,
  type EconomyPoint,
  type EconomySeries,
  type EconomySnapshot,
} from "@/lib/live/economy-types";

const rssParser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; OrbitLive/1.0; +https://github.com/AlexTouvras/Orbit)",
    Accept:
      "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
});

const HEADLINE_FEEDS: { source: string; url: string; limit: number }[] = [
  {
    source: "ECB Press",
    url: "https://www.ecb.europa.eu/rss/press.html",
    limit: 8,
  },
  {
    source: "ECB Statistics",
    url: "https://www.ecb.europa.eu/rss/statpress.html",
    limit: 6,
  },
];

/** Max official ECB headlines kept for the euro-area spotlight. */
const MAX_OFFICIAL_HEADLINES = 10;
/** Max Google News wires per country / EU spotlight. */
const MAX_WIRE_HEADLINES = 5;

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

function normalizeUrl(raw: string): string {
  return raw.replace(/([^:])\/{2,}/g, "$1/");
}

function headlineId(url: string): string {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 12);
}

function cleanWireTitle(title: string, source: string): string {
  let t = title.replace(/\s+/g, " ").trim();
  // Google News often appends " - BBC" / " - Financial Times"
  const suffixes = [
    ` - ${source}`,
    ` – ${source}`,
    ` — ${source}`,
    ` | ${source}`,
  ];
  for (const s of suffixes) {
    if (t.endsWith(s)) t = t.slice(0, -s.length).trim();
  }
  // If source was generic, still peel a trailing " - Publisher" chunk.
  t = t.replace(/\s+[-–—|]\s+[^-–—|]{2,40}$/u, "").trim();
  return t;
}

function wireSource(item: { source?: unknown; title?: string }): string {
  const raw = item.source;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (
    raw &&
    typeof raw === "object" &&
    "title" in raw &&
    typeof (raw as { title: unknown }).title === "string"
  ) {
    const title = (raw as { title: string }).title.trim();
    if (title) return title;
  }
  // Fall back to the publisher suffix Google puts on the title.
  const m = item.title?.match(/\s[-–—|]\s+([^-–—|]{2,40})\s*$/u);
  if (m?.[1]) return m[1].trim();
  return "Google News";
}

async function fetchOfficialHeadlines(): Promise<EconomyHeadline[]> {
  console.log("[live:economy] headlines ← ECB press + statistics RSS");
  const settled = await Promise.allSettled(
    HEADLINE_FEEDS.map(async (feed) => {
      const parsed = await rssParser.parseURL(feed.url);
      return (parsed.items ?? []).slice(0, feed.limit).flatMap((item) => {
        const title = item.title?.trim();
        const rawUrl = item.link?.trim();
        if (!title || !rawUrl) return [];
        const url = normalizeUrl(rawUrl);
        const publishedAt = item.isoDate
          ? new Date(item.isoDate).toISOString()
          : item.pubDate
            ? new Date(item.pubDate).toISOString()
            : null;
        return [
          {
            id: headlineId(url),
            title: title.replace(/\s+/g, " "),
            url,
            source: feed.source,
            publishedAt:
              publishedAt && !Number.isNaN(Date.parse(publishedAt))
                ? publishedAt
                : null,
            geo: "EA21" as const,
            channel: "official" as const,
          } satisfies EconomyHeadline,
        ];
      });
    }),
  );

  const seen = new Set<string>();
  const headlines: EconomyHeadline[] = [];
  for (let i = 0; i < settled.length; i++) {
    const result = settled[i]!;
    const feed = HEADLINE_FEEDS[i]!;
    if (result.status === "rejected") {
      console.warn(
        `[live:economy] headlines ${feed.source} failed:`,
        result.reason instanceof Error ? result.reason.message : result.reason,
      );
      continue;
    }
    for (const h of result.value) {
      if (seen.has(h.url)) continue;
      seen.add(h.url);
      headlines.push(h);
    }
  }

  headlines.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
  return headlines.slice(0, MAX_OFFICIAL_HEADLINES);
}

/** Drop Big Tech / corporate investment stories that only name-check the country. */
const WIRE_NOISE =
  /\b(google|microsoft|amazon|meta|apple|openai|nvidia|samsung|tesla)\b.{0,40}\b(invest|investment|funding|fund|billion|€\d|\$\d|data[- ]?cent(?:er|re)|ai infrastructure)\b|\b(invest|investment|funding|fund|billion|€\d|\$\d|data[- ]?cent(?:er|re)|ai infrastructure)\b.{0,40}\b(google|microsoft|amazon|meta|apple|openai|nvidia|samsung|tesla)\b/i;

/** Prefer titles that look like macro / official economy coverage. */
const WIRE_MACRO =
  /\b(inflation|hicp|cpi|unemployment|jobless|employment|gdp|recession|deficit|debt|fiscal|budget|growth|pmi|retail sales|industrial production|wage|wages|interest rate|rate hike|rate cut|deposit rate|central bank|ecb|bank of finland|bundesbank|banque de france|banca d['’]italia|banco de españa|consumer confidence|statistics|macro(?:economic)?)\b/i;

function isUsefulWireTitle(title: string, geoLabel: string): boolean {
  const t = title.toLowerCase();
  if (WIRE_NOISE.test(t)) return false;
  // Must mention the country/area somehow (label or demonym-ish token from label).
  const label = geoLabel.toLowerCase();
  const labelHit =
    t.includes(label) ||
    (label === "european union" &&
      (t.includes("eu ") || t.includes("eurozone") || t.includes("euro area"))) ||
    (label === "netherlands" && t.includes("dutch")) ||
    (label === "germany" && t.includes("german")) ||
    (label === "france" && t.includes("french")) ||
    (label === "spain" && t.includes("spanish")) ||
    (label === "italy" && (t.includes("italian") || t.includes("italy"))) ||
    (label === "sweden" && t.includes("swedish")) ||
    (label === "poland" && t.includes("polish")) ||
    (label === "greece" && t.includes("greek")) ||
    (label === "ireland" && t.includes("irish")) ||
    (label === "austria" && t.includes("austrian")) ||
    (label === "belgium" && t.includes("belgian")) ||
    (label === "portugal" && t.includes("portuguese")) ||
    (label === "finland" && t.includes("finnish")) ||
    (label === "denmark" && t.includes("danish")) ||
    (label === "norway" && t.includes("norwegian")) ||
    (label === "estonia" && t.includes("estonian")) ||
    (label === "latvia" && t.includes("latvian")) ||
    (label === "lithuania" && t.includes("lithuanian"));
  if (!labelHit) return false;
  return WIRE_MACRO.test(t);
}

/**
 * Country / EU economy wires via Google News RSS.
 * Soft — one failed geo never fails the snapshot.
 */
async function fetchWireHeadlinesForGeo(
  geo: EconomyGeoId,
  label: string,
): Promise<EconomyHeadline[]> {
  // Bias the query toward macro prints; exclude common Big Tech investment noise.
  const query =
    geo === "EU27_2020"
      ? `("European Union" OR eurozone OR "euro area") (inflation OR HICP OR unemployment OR GDP OR recession OR deficit OR "interest rate" OR ECB OR "consumer confidence") -Google -Microsoft -Amazon -OpenAI -NVIDIA`
      : `"${label}" (inflation OR HICP OR unemployment OR GDP OR recession OR deficit OR "interest rate" OR "central bank" OR "consumer confidence" OR fiscal OR budget) -Google -Microsoft -Amazon -OpenAI -NVIDIA`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-GB&gl=GB&ceid=GB:en`;
  try {
    const parsed = await rssParser.parseURL(url);
    const out: EconomyHeadline[] = [];
    const seen = new Set<string>();
    for (const item of parsed.items ?? []) {
      if (out.length >= MAX_WIRE_HEADLINES) break;
      const rawTitle = item.title?.trim();
      const rawUrl = item.link?.trim();
      if (!rawTitle || !rawUrl) continue;
      const source = wireSource(item);
      const title = cleanWireTitle(rawTitle, source);
      if (!isUsefulWireTitle(title, label)) continue;
      const link = normalizeUrl(rawUrl);
      if (seen.has(link)) continue;
      seen.add(link);
      const publishedAt = item.isoDate
        ? new Date(item.isoDate).toISOString()
        : item.pubDate
          ? new Date(item.pubDate).toISOString()
          : null;
      out.push({
        id: headlineId(`${geo}:${link}`),
        title,
        url: link,
        source,
        publishedAt:
          publishedAt && !Number.isNaN(Date.parse(publishedAt))
            ? publishedAt
            : null,
        geo,
        channel: "wire",
      });
    }
    return out;
  } catch (err) {
    console.warn(
      `[live:economy] wires ${geo} failed:`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

async function fetchAllWireHeadlines(): Promise<EconomyHeadline[]> {
  const targets = ECONOMY_GEOS.filter((g) => g.id !== "EA21");
  console.log(
    `[live:economy] headlines ← Google News wires for ${targets.length} geos`,
  );
  const headlines: EconomyHeadline[] = [];
  // Gentle concurrency — Google News is fine with parallel but stay polite.
  const batchSize = 4;
  for (let i = 0; i < targets.length; i += batchSize) {
    const batch = targets.slice(i, i + batchSize);
    const parts = await Promise.all(
      batch.map((g) => fetchWireHeadlinesForGeo(g.id, g.label)),
    );
    for (const part of parts) headlines.push(...part);
    if (i + batchSize < targets.length) await sleep(250);
  }
  console.log(`[live:economy] wires collected ${headlines.length}`);
  return headlines;
}

function mergeInflationSeries(
  historical: EconomySeries[],
  recent: EconomySeries[],
): EconomySeries[] {
  const geos = new Set<EconomyGeoId>([
    ...historical.map((s) => s.geo),
    ...recent.map((s) => s.geo),
  ]);
  const out: EconomySeries[] = [];
  for (const geo of geos) {
    const hist = historical.find((s) => s.geo === geo);
    const fresh = recent.find((s) => s.geo === geo);
    const byPeriod = new Map<string, number | null>();
    for (const p of hist?.points ?? []) byPeriod.set(p.period, p.value);
    // Early indicator wins on overlap and extends past the final HICP print.
    // Skip nulls so we do not invent empty months ahead of a geo's last print.
    for (const p of fresh?.points ?? []) {
      if (p.value === null) continue;
      byPeriod.set(p.period, p.value);
    }
    const points = [...byPeriod.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, value]) => ({ period, value }));
    out.push({ metric: "inflation", geo, points });
  }
  return out;
}

async function main() {
  const geos = ECONOMY_GEOS.map((g) => g.id);

  const [
    inflationHist,
    inflationEarly,
    unemployment,
    confidence,
    gdp,
    policyRate,
    official,
    wires,
  ] = await Promise.all([
    fetchMetricSeries("inflation", geos, "prc_hicp_manr", { coicop: "CP00" }, 48),
    // Early HICP (teicp000) stays current months ahead of the final cube.
    fetchMetricSeries(
      "inflation",
      geos,
      "teicp000",
      { coicop18: "TOTAL", unit: "PCH_M12" },
      24,
    ),
    fetchMetricSeries("unemployment", geos, "une_rt_m", { s_adj: "SA", age: "TOTAL", unit: "PC_ACT", sex: "T" }, 48),
    fetchMetricSeries("confidence", geos, "ei_bssi_m_r2", { indic: "BS-CSMCI-BAL", s_adj: "SA" }, 48),
    fetchMetricSeries("gdp", geos, "namq_10_gdp", { na_item: "B1GQ", unit: "CLV_PCH_PRE", s_adj: "SCA" }, 24),
    fetchPolicyRate(),
    fetchOfficialHeadlines(),
    fetchAllWireHeadlines(),
  ]);

  const inflation = mergeInflationSeries(inflationHist, inflationEarly);
  const headlines = [...official, ...wires];

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
      "Eurostat (HICP final + early indicator, unemployment, consumer confidence, GDP) + ECB Data Portal (deposit facility) + ECB RSS (press / statistics) + Google News RSS (country wires)",
    license:
      "Eurostat / ECB — free reuse with attribution (CC BY 4.0 where stated). Country wires via Google News (publisher copyrights apply; links out).",
    defaultGeo: ECONOMY_DEFAULT_GEO,
    policyRate,
    geos: bundles,
    headlines,
  };

  const out = path.join(process.cwd(), "data", "live", "economy.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(snap, null, 2)}\n`, "utf8");
  const wireGeos = new Set(wires.map((h) => h.geo)).size;
  console.log(
    `[live:economy] wrote ${out} · EA HICP ${hicp.period} ${hicp.value}% · geos ${bundles.length} · official ${official.length} · wires ${wires.length} across ${wireGeos} geos`,
  );
}

main().catch((err) => {
  console.error("[live:economy] failed:", err);
  process.exit(1);
});
