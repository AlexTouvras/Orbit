/**
 * Server-only ENTSO-E pulse fetch (Load/Gen/Outages/…).
 * Browser UI must import from `@/lib/live/eu-category-meta` instead.
 */
import "server-only";
import {
  countZipEntries,
  entsoeFetch,
  padEntsoeUtc,
  parsePeriodPoints,
  toHourlyMean,
  unzipFirstXml,
  type EntsoePoint,
} from "@/lib/live/entsoe-xml";
import type { EuZonePulse } from "@/lib/live/eu-category-meta";

export type {
  EuCategoryId,
  EuZonePulse,
  EuZonePulseLatest,
} from "@/lib/live/eu-category-meta";
export {
  EU_CATEGORIES,
  categoryValue,
  formatCategoryValue,
} from "@/lib/live/eu-category-meta";

const PSR = {
  windOn: "B19",
  windOff: "B18",
  solar: "B16",
  nuclear: "B14",
  hydroRor: "B11",
  hydroRes: "B12",
  hydroPump: "B10",
} as const;

function seriesFromPoints(points: EntsoePoint[]): {
  t: number[];
  v: number[];
} {
  const hourly = toHourlyMean(points);
  return { t: hourly.map((p) => p.t), v: hourly.map((p) => p.value) };
}

function lastFinite(vals: Array<number | null | undefined>): number | null {
  for (let i = vals.length - 1; i >= 0; i--) {
    const v = vals[i];
    if (v !== null && v !== undefined && Number.isFinite(v)) return v;
  }
  return null;
}

function alignToHours(
  hours: number[],
  series: { t: number[]; v: number[] },
): Array<number | null> {
  const map = new Map(series.t.map((t, i) => [t, series.v[i]!]));
  return hours.map((h) => {
    const exact = map.get(h);
    if (exact !== undefined) return exact;
    // nearest within 30 min
    let best: number | null = null;
    let bestDist = Infinity;
    for (const [t, v] of map) {
      const d = Math.abs(t - h);
      if (d < bestDist && d <= 1800) {
        bestDist = d;
        best = v;
      }
    }
    return best;
  });
}

function parseGenByPsr(xml: string): Map<string, EntsoePoint[]> {
  const byPsr = new Map<string, EntsoePoint[]>();
  const blocks = [...xml.matchAll(/<TimeSeries\b[\s\S]*?<\/TimeSeries>/gi)].map(
    (m) => m[0],
  );
  for (const block of blocks) {
    // Generation series use inBiddingZone; skip consumption (outBiddingZone only).
    if (
      /outBiddingZone_Domain/i.test(block) &&
      !/inBiddingZone_Domain/i.test(block)
    ) {
      continue;
    }
    const psr =
      block.match(/<(?:[^:>]+:)?psrType>([^<]+)<\/(?:[^:>]+:)?psrType>/i)?.[1]?.trim() ??
      "UNKNOWN";
    const pts = parsePeriodPoints(block, "quantity");
    if (!pts.length) continue;
    const prev = byPsr.get(psr) ?? [];
    byPsr.set(psr, prev.concat(pts));
  }
  return byPsr;
}

function sumPsr(
  byPsr: Map<string, EntsoePoint[]>,
  codes: string[],
): EntsoePoint[] {
  const buckets = new Map<number, number>();
  for (const code of codes) {
    for (const p of byPsr.get(code) ?? []) {
      buckets.set(p.t, (buckets.get(p.t) ?? 0) + p.value);
    }
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, value]) => ({ t, value }));
}

export async function fetchZonePulseExtras(
  eic: string,
  start: Date,
  end: Date,
  token: string,
): Promise<{
  load: EntsoePoint[];
  loadForecast: EntsoePoint[];
  wind: EntsoePoint[];
  solar: EntsoePoint[];
  nuclear: EntsoePoint[];
  hydro: EntsoePoint[];
  otherGen: EntsoePoint[];
  outageCount: number | null;
  imbalanceEur: number | null;
  installedMw: number | null;
} | null> {
  const period = {
    periodStart: padEntsoeUtc(start),
    periodEnd: padEntsoeUtc(end),
  };

  const [loadRes, forecastRes, genRes, outageRes, balRes, capRes] =
    await Promise.all([
      entsoeFetch(
        {
          documentType: "A65",
          processType: "A16",
          outBiddingZone_Domain: eic,
          ...period,
        },
        token,
      ),
      entsoeFetch(
        {
          documentType: "A65",
          processType: "A01",
          outBiddingZone_Domain: eic,
          ...period,
        },
        token,
      ),
      entsoeFetch(
        {
          documentType: "A75",
          processType: "A16",
          in_Domain: eic,
          ...period,
        },
        token,
      ),
      entsoeFetch(
        {
          documentType: "A80",
          biddingZone_Domain: eic,
          ...period,
        },
        token,
      ),
      entsoeFetch(
        {
          documentType: "A85",
          controlArea_Domain: eic,
          ...period,
        },
        token,
      ),
      entsoeFetch(
        {
          documentType: "A68",
          processType: "A33",
          in_Domain: eic,
          periodStart: padEntsoeUtc(new Date(Date.UTC(end.getUTCFullYear(), 0, 1))),
          periodEnd: padEntsoeUtc(new Date(Date.UTC(end.getUTCFullYear() + 1, 0, 1))),
        },
        token,
      ),
    ]);

  const load = loadRes.ok
    ? toHourlyMean(parsePeriodPoints(loadRes.text, "quantity"))
    : [];
  const loadForecast = forecastRes.ok
    ? toHourlyMean(parsePeriodPoints(forecastRes.text, "quantity"))
    : [];

  let wind: EntsoePoint[] = [];
  let solar: EntsoePoint[] = [];
  let nuclear: EntsoePoint[] = [];
  let hydro: EntsoePoint[] = [];
  let otherGen: EntsoePoint[] = [];
  if (genRes.ok) {
    const byPsr = parseGenByPsr(genRes.text);
    wind = toHourlyMean(sumPsr(byPsr, [PSR.windOn, PSR.windOff]));
    solar = toHourlyMean(sumPsr(byPsr, [PSR.solar]));
    nuclear = toHourlyMean(sumPsr(byPsr, [PSR.nuclear]));
    hydro = toHourlyMean(
      sumPsr(byPsr, [PSR.hydroRor, PSR.hydroRes, PSR.hydroPump]),
    );
    const known = new Set([
      PSR.windOn,
      PSR.windOff,
      PSR.solar,
      PSR.nuclear,
      PSR.hydroRor,
      PSR.hydroRes,
      PSR.hydroPump,
    ]);
    const otherCodes = [...byPsr.keys()].filter((k) => !known.has(k as never));
    otherGen = toHourlyMean(sumPsr(byPsr, otherCodes));
  }

  let outageCount: number | null = null;
  if (outageRes.ok) {
    if (outageRes.buf[0] === 0x50 && outageRes.buf[1] === 0x4b) {
      outageCount = countZipEntries(outageRes.buf);
    } else {
      const docs = [
        ...outageRes.text.matchAll(/Unavailability_MarketDocument/gi),
      ];
      outageCount = Math.max(docs.length, 0);
    }
  }

  let imbalanceEur: number | null = null;
  if (balRes.ok) {
    let xml = balRes.text;
    if (balRes.buf[0] === 0x50 && balRes.buf[1] === 0x4b) {
      xml = unzipFirstXml(balRes.buf) ?? "";
    }
    if (xml) {
      try {
        const pts = toHourlyMean(
          parsePeriodPoints(xml, "imbalance_Price.amount").length
            ? parsePeriodPoints(xml, "imbalance_Price.amount")
            : parsePeriodPoints(xml, "price.amount"),
        );
        imbalanceEur = lastFinite(pts.map((p) => p.value));
      } catch {
        imbalanceEur = null;
      }
    }
  }

  let installedMw: number | null = null;
  if (capRes.ok) {
    try {
      const pts = parsePeriodPoints(capRes.text, "quantity");
      // Sum latest point per psr TimeSeries roughly: take mean of last day totals.
      const byPsr = parseGenByPsr(capRes.text);
      let sum = 0;
      let any = false;
      for (const ptsOf of byPsr.values()) {
        const last = lastFinite(ptsOf.map((p) => p.value));
        if (last !== null) {
          sum += last;
          any = true;
        }
      }
      if (any) installedMw = sum;
      else installedMw = lastFinite(pts.map((p) => p.value));
    } catch {
      installedMw = null;
    }
  }

  if (
    !load.length &&
    !wind.length &&
    !nuclear.length &&
    outageCount === null &&
    installedMw === null
  ) {
    return null;
  }

  return {
    load,
    loadForecast,
    wind,
    solar,
    nuclear,
    hydro,
    otherGen,
    outageCount,
    imbalanceEur,
    installedMw,
  };
}

export function buildZonePulse(args: {
  id: string;
  label: string;
  geoStem: string;
  priceSeries: { t: number[]; price: number[] };
  extras: NonNullable<Awaited<ReturnType<typeof fetchZonePulseExtras>>>;
}): EuZonePulse {
  const hoursSet = new Set<number>();
  for (const t of args.priceSeries.t) hoursSet.add(Math.floor(t / 3600) * 3600);
  for (const p of args.extras.load) hoursSet.add(p.t);
  for (const p of args.extras.wind) hoursSet.add(p.t);
  const t = [...hoursSet].sort((a, b) => a - b).slice(-48);

  const priceMap = new Map(
    args.priceSeries.t.map((ts, i) => [
      Math.floor(ts / 3600) * 3600,
      args.priceSeries.price[i]!,
    ]),
  );
  const loadS = seriesFromPoints(args.extras.load);
  const fcS = seriesFromPoints(args.extras.loadForecast);
  const windS = seriesFromPoints(args.extras.wind);
  const solarS = seriesFromPoints(args.extras.solar);
  const nucS = seriesFromPoints(args.extras.nuclear);
  const hydroS = seriesFromPoints(args.extras.hydro);
  const otherS = seriesFromPoints(args.extras.otherGen);

  const load = alignToHours(t, loadS);
  const loadForecast = alignToHours(t, fcS);
  const wind = alignToHours(t, windS);
  const solar = alignToHours(t, solarS);
  const nuclear = alignToHours(t, nucS);
  const hydro = alignToHours(t, hydroS);
  const otherGen = alignToHours(t, otherS);
  const price = t.map((h) => priceMap.get(h) ?? null);

  const netImport = t.map((_, i) => {
    const l = load[i];
    if (l === null) return null;
    const gen =
      (wind[i] ?? 0) +
      (solar[i] ?? 0) +
      (nuclear[i] ?? 0) +
      (hydro[i] ?? 0) +
      (otherGen[i] ?? 0);
    const hasGen =
      wind[i] !== null ||
      solar[i] !== null ||
      nuclear[i] !== null ||
      hydro[i] !== null ||
      otherGen[i] !== null;
    if (!hasGen) return null;
    return l - gen;
  });

  const loadMw = lastFinite(load);
  const windMw = lastFinite(wind);
  const nuclearMw = lastFinite(nuclear);
  const hydroMw = lastFinite(hydro);
  const genParts = [wind, solar, nuclear, hydro, otherGen].map(lastFinite);
  const genMw = genParts.every((v) => v === null)
    ? null
    : genParts.reduce<number>((a, v) => a + (v ?? 0), 0);
  const netImportMw = lastFinite(netImport);
  const priceLatest = lastFinite(price);

  let loadErrorPct: number | null = null;
  const act = loadMw;
  const fc = lastFinite(loadForecast);
  if (act !== null && fc !== null && fc > 0) {
    loadErrorPct = (Math.abs(act - fc) / fc) * 100;
  }

  return {
    id: args.id,
    label: args.label,
    geoStem: args.geoStem,
    t,
    price,
    load,
    wind,
    solar,
    nuclear,
    hydro,
    otherGen,
    netImport,
    loadForecast,
    latest: {
      price: priceLatest,
      loadMw,
      genMw,
      windMw,
      nuclearMw,
      hydroMw,
      netImportMw,
      outageCount: args.extras.outageCount,
      imbalanceEur: args.extras.imbalanceEur,
      loadErrorPct,
      installedMw: args.extras.installedMw,
    },
  };
}
