/**
 * Snapshot Helsinki-area old-dwelling prices into data/live/housing.json.
 *
 *   npm run live:fetch-housing
 *
 * Source: Statistics Finland StatFin `ashi` (CC BY 4.0).
 * Monthly pulse: 15iq.px. Longer Helsinki tape + districts: 13mv.px.
 */
import fs from "node:fs";
import path from "node:path";
import {
  HOUSING_REGIONS,
  type HousingDistrictPoint,
  type HousingMonthlyPoint,
  type HousingQuarterlyPoint,
  type HousingRegionId,
  type HousingRegionSeries,
  type HousingSnapshot,
} from "@/lib/live/housing-types";

const MONTHLY_URL =
  "https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/ashi/15iq.px";
const QUARTERLY_URL =
  "https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/ashi/13mv.px";

const REGION_CODE = "alue_43_20260625";
const BUILDING_CODE = "talotyyppi_5_20111209";
const MONTHLY_TIME = "timeperiod_m";
const QUARTERLY_TIME = "timeperiod_q";
const QUARTERLY_REGION = "alue_43_20220407";
const ROOMS_CODE = "huoneluku_1_20111212";

const CONTENT = {
  index: "ashivm_indeksi_2025",
  mom: "ashivm_indeksi_kkmuutos_2025",
  yoy: "ashivm_indeksi_vmuutos_2025",
  eurM2: "ashivm_keskineliohinta",
  tx: "ashivm_kauppamaara_vvero",
  days: "ashivm_myyntiaika",
} as const;

const Q_CONTENT = {
  eurM2: "keskihinta_aritm",
  tx: "lkm_julk20",
} as const;

type PxMetaVar = {
  code: string;
  values: string[];
  valueTexts: string[];
};

type PxMeta = {
  title?: string;
  variables: PxMetaVar[];
};

type JsonStat2 = {
  id: string[];
  size: number[];
  value: Array<number | null>;
  status?: Record<string, string>;
  dimension: Record<
    string,
    {
      category: {
        index: Record<string, number>;
        label: Record<string, string>;
      };
    }
  >;
  updated?: string;
  source?: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  label = url,
): Promise<T> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          Accept: "application/json",
          ...(init?.headers ?? {}),
        },
      });
      if (res.status === 429) {
        await sleep(2000 * attempt);
        continue;
      }
      if (!res.ok) {
        throw new Error(`${label}: HTTP ${res.status}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      if (attempt === 3) throw err;
      console.warn(
        `[live:housing] ${label} attempt ${attempt} failed:`,
        err instanceof Error ? err.message : err,
      );
      await sleep(1200 * attempt);
    }
  }
  throw new Error(`${label}: exhausted retries`);
}

async function postPx(url: string, body: unknown): Promise<JsonStat2> {
  return fetchJson<JsonStat2>(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    url,
  );
}

function isProvisional(period: string, label?: string): boolean {
  return period.includes("*") || Boolean(label?.includes("*"));
}

function cleanPeriod(period: string): string {
  return period.replace(/\*$/, "");
}

function indexOf(
  sizes: number[],
  coords: number[],
): number {
  let idx = 0;
  for (let i = 0; i < coords.length; i++) {
    idx = idx * (sizes[i] ?? 1) + (coords[i] ?? 0);
  }
  return idx;
}

function dimOrder(js: JsonStat2): string[] {
  return js.id;
}

function categoryCodes(js: JsonStat2, dim: string): string[] {
  const index = js.dimension[dim]?.category.index ?? {};
  return Object.entries(index)
    .sort((a, b) => a[1] - b[1])
    .map(([code]) => code);
}

function categoryLabel(js: JsonStat2, dim: string, code: string): string {
  return js.dimension[dim]?.category.label[code] ?? code;
}

function valueAt(
  js: JsonStat2,
  coordsByDim: Record<string, string>,
): number | null {
  const dims = dimOrder(js);
  const coords = dims.map((dim) => {
    const code = coordsByDim[dim];
    if (code === undefined) {
      throw new Error(`Missing dim ${dim}`);
    }
    const idx = js.dimension[dim]?.category.index[code];
    if (idx === undefined) {
      throw new Error(`Unknown code ${code} for ${dim}`);
    }
    return idx;
  });
  const flat = indexOf(js.size, coords);
  const v = js.value[flat];
  return v === undefined ? null : v;
}

async function fetchMonthly(): Promise<{
  regions: HousingRegionSeries[];
  updated?: string;
  source?: string;
}> {
  console.log("[live:housing] meta 15iq.px");
  const meta = await fetchJson<PxMeta>(MONTHLY_URL, undefined, "15iq meta");
  const timeVar = meta.variables.find((v) => v.code === MONTHLY_TIME);
  if (!timeVar?.values?.length) {
    throw new Error("15iq: no months");
  }

  const regionIds = HOUSING_REGIONS.map((r) => r.id);
  const contentCodes = Object.values(CONTENT);

  console.log(`[live:housing] monthly ${timeVar.values.length} months`);
  const js = await postPx(MONTHLY_URL, {
    query: [
      {
        code: MONTHLY_TIME,
        selection: { filter: "item", values: timeVar.values },
      },
      {
        code: REGION_CODE,
        selection: { filter: "item", values: regionIds },
      },
      {
        code: BUILDING_CODE,
        selection: { filter: "item", values: ["3"] },
      },
      {
        code: "contentscode",
        selection: { filter: "item", values: contentCodes },
      },
    ],
    response: { format: "json-stat2" },
  });

  const periods = categoryCodes(js, MONTHLY_TIME);
  const regions: HousingRegionSeries[] = [];

  for (const metaRegion of HOUSING_REGIONS) {
    const monthly: HousingMonthlyPoint[] = [];
    for (const periodCode of periods) {
      const label = categoryLabel(js, MONTHLY_TIME, periodCode);
      const period = cleanPeriod(periodCode);
      const coordsBase = {
        [MONTHLY_TIME]: periodCode,
        [REGION_CODE]: metaRegion.id,
        [BUILDING_CODE]: "3",
      };
      monthly.push({
        period,
        provisional: isProvisional(periodCode, label),
        eurM2: valueAt(js, { ...coordsBase, contentscode: CONTENT.eurM2 }),
        index: valueAt(js, { ...coordsBase, contentscode: CONTENT.index }),
        momPct: valueAt(js, { ...coordsBase, contentscode: CONTENT.mom }),
        yoyPct: valueAt(js, { ...coordsBase, contentscode: CONTENT.yoy }),
        transactions: valueAt(js, { ...coordsBase, contentscode: CONTENT.tx }),
        daysToSale: valueAt(js, { ...coordsBase, contentscode: CONTENT.days }),
      });
    }
    regions.push({
      id: metaRegion.id,
      label: metaRegion.label,
      short: metaRegion.short,
      monthly,
    });
  }

  return { regions, updated: js.updated, source: js.source };
}

async function fetchQuarterly(): Promise<{
  helsinkiQuarterly: HousingQuarterlyPoint[];
  districts: HousingDistrictPoint[];
}> {
  console.log("[live:housing] meta 13mv.px");
  const meta = await fetchJson<PxMeta>(QUARTERLY_URL, undefined, "13mv meta");
  const timeVar = meta.variables.find((v) => v.code === QUARTERLY_TIME);
  if (!timeVar?.values?.length) {
    throw new Error("13mv: no quarters");
  }

  // Keep the last ~40 quarters (~10y) for a readable long tape.
  const quarters = timeVar.values.slice(-40);
  const districtIds = ["091-1", "091-2", "091-3", "091-4"];
  const regionIds = ["091", ...districtIds];

  console.log(`[live:housing] quarterly ${quarters.length} quarters`);
  const js = await postPx(QUARTERLY_URL, {
    query: [
      {
        code: QUARTERLY_TIME,
        selection: { filter: "item", values: quarters },
      },
      {
        code: QUARTERLY_REGION,
        selection: { filter: "item", values: regionIds },
      },
      {
        code: BUILDING_CODE,
        selection: { filter: "item", values: ["3"] },
      },
      {
        code: ROOMS_CODE,
        selection: { filter: "item", values: ["00"] },
      },
      {
        code: "contentscode",
        selection: {
          filter: "item",
          values: [Q_CONTENT.eurM2, Q_CONTENT.tx],
        },
      },
    ],
    response: { format: "json-stat2" },
  });

  const periods = categoryCodes(js, QUARTERLY_TIME);
  const helsinkiQuarterly: HousingQuarterlyPoint[] = [];
  for (const periodCode of periods) {
    const label = categoryLabel(js, QUARTERLY_TIME, periodCode);
    const period = cleanPeriod(periodCode);
    const base = {
      [QUARTERLY_TIME]: periodCode,
      [QUARTERLY_REGION]: "091",
      [BUILDING_CODE]: "3",
      [ROOMS_CODE]: "00",
    };
    helsinkiQuarterly.push({
      period,
      provisional: isProvisional(periodCode, label),
      eurM2: valueAt(js, { ...base, contentscode: Q_CONTENT.eurM2 }),
      transactions: valueAt(js, { ...base, contentscode: Q_CONTENT.tx }),
    });
  }

  // Latest quarter with at least one district €/m².
  let districtPeriod: string | null = null;
  for (let i = periods.length - 1; i >= 0; i--) {
    const periodCode = periods[i];
    if (!periodCode) continue;
    const any = districtIds.some((id) => {
      const v = valueAt(js, {
        [QUARTERLY_TIME]: periodCode,
        [QUARTERLY_REGION]: id,
        [BUILDING_CODE]: "3",
        [ROOMS_CODE]: "00",
        contentscode: Q_CONTENT.eurM2,
      });
      return v !== null;
    });
    if (any) {
      districtPeriod = periodCode;
      break;
    }
  }

  const districts: HousingDistrictPoint[] = [];
  if (districtPeriod) {
    for (const id of districtIds) {
      districts.push({
        id,
        label: categoryLabel(js, QUARTERLY_REGION, id).replace(
          /^Helsinki\s+/i,
          "HKI ",
        ),
        period: cleanPeriod(districtPeriod),
        eurM2: valueAt(js, {
          [QUARTERLY_TIME]: districtPeriod,
          [QUARTERLY_REGION]: id,
          [BUILDING_CODE]: "3",
          [ROOMS_CODE]: "00",
          contentscode: Q_CONTENT.eurM2,
        }),
        transactions: valueAt(js, {
          [QUARTERLY_TIME]: districtPeriod,
          [QUARTERLY_REGION]: id,
          [BUILDING_CODE]: "3",
          [ROOMS_CODE]: "00",
          contentscode: Q_CONTENT.tx,
        }),
      });
    }
  }

  return { helsinkiQuarterly, districts };
}

function assertHelsinkiHasPrice(regions: HousingRegionSeries[]) {
  const hki = regions.find((r) => r.id === ("091" as HousingRegionId));
  const has = hki?.monthly.some((m) => m.eurM2 !== null);
  if (!has) {
    throw new Error("Refusing empty desk: no Helsinki €/m² in monthly series");
  }
}

async function main() {
  const monthly = await fetchMonthly();
  assertHelsinkiHasPrice(monthly.regions);
  const quarterly = await fetchQuarterly();

  const snap: HousingSnapshot = {
    asOf: new Date().toISOString(),
    source:
      monthly.source ??
      "Statistics Finland — prices of dwellings in housing companies (ashi)",
    license: "CC BY 4.0 — Statistics Finland",
    monthlyTable: "StatFin/ashi/15iq.px",
    quarterlyTable: "StatFin/ashi/13mv.px",
    buildingType: { id: "3", label: "Blocks of flats" },
    regions: monthly.regions,
    helsinkiQuarterly: quarterly.helsinkiQuarterly,
    districts: quarterly.districts,
  };

  const out = path.join(process.cwd(), "data", "live", "housing.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(snap, null, 2)}\n`, "utf8");

  const hki = snap.regions.find((r) => r.id === "091");
  const last = [...(hki?.monthly ?? [])]
    .reverse()
    .find((m) => m.eurM2 !== null);
  console.log(
    `[live:housing] wrote ${out} · Helsinki ${last?.period ?? "?"} €${last?.eurM2 ?? "?"} /m² · districts ${snap.districts.length}`,
  );
}

main().catch((err) => {
  console.error("[live:housing] failed:", err);
  process.exit(1);
});
