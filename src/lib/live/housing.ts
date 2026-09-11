import "server-only";
import fs from "node:fs";
import path from "node:path";
import type {
  HousingLatest,
  HousingSnapshot,
  HousingView,
} from "@/lib/live/housing-types";

export type {
  HousingDistrictPoint,
  HousingLatest,
  HousingMonthlyPoint,
  HousingQuarterlyPoint,
  HousingRegionId,
  HousingRegionSeries,
  HousingSnapshot,
  HousingView,
} from "@/lib/live/housing-types";
export { HOUSING_REGIONS, housingRegionMeta } from "@/lib/live/housing-types";

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "live", "housing.json");

export function getHousingSnapshotPath(): string {
  return SNAPSHOT_PATH;
}

export function readHousingSnapshot(): HousingSnapshot | null {
  try {
    const raw = fs.readFileSync(SNAPSHOT_PATH, "utf8");
    const parsed = JSON.parse(raw) as HousingSnapshot;
    if (!parsed?.regions?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function latestWithEurM2(
  monthly: HousingSnapshot["regions"][number]["monthly"],
) {
  for (let i = monthly.length - 1; i >= 0; i--) {
    const row = monthly[i];
    if (row && row.eurM2 !== null) return row;
  }
  return null;
}

export function toHousingView(snap: HousingSnapshot): HousingView {
  const helsinki = snap.regions.find((r) => r.id === "091") ?? null;
  const pks = snap.regions.find((r) => r.id === "pks") ?? null;
  const country = snap.regions.find((r) => r.id === "SSS") ?? null;
  const latestRow = helsinki ? latestWithEurM2(helsinki.monthly) : null;

  let latest: HousingLatest | null = null;
  if (latestRow) {
    const pksLatest = pks ? latestWithEurM2(pks.monthly) : null;
    const fiLatest = country ? latestWithEurM2(country.monthly) : null;
    const vsGreater =
      latestRow.eurM2 !== null && pksLatest?.eurM2 != null
        ? latestRow.eurM2 - pksLatest.eurM2
        : null;
    const vsCountry =
      latestRow.eurM2 !== null && fiLatest?.eurM2 != null
        ? latestRow.eurM2 - fiLatest.eurM2
        : null;
    latest = {
      period: latestRow.period,
      provisional: latestRow.provisional,
      eurM2: latestRow.eurM2,
      momPct: latestRow.momPct,
      yoyPct: latestRow.yoyPct,
      transactions: latestRow.transactions,
      daysToSale: latestRow.daysToSale,
      vsGreater,
      vsCountry,
    };
  }

  return {
    asOf: snap.asOf,
    source: snap.source,
    license: snap.license,
    buildingType: snap.buildingType,
    regions: snap.regions,
    helsinkiQuarterly: snap.helsinkiQuarterly,
    districts: snap.districts,
    latest,
    helsinki,
  };
}
