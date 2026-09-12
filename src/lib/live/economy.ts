import "server-only";
import fs from "node:fs";
import path from "node:path";
import {
  ECONOMY_DEFAULT_GEO,
  type EconomySnapshot,
  type EconomyView,
} from "@/lib/live/economy-types";

export type {
  EconomyGeoBundle,
  EconomyGeoId,
  EconomyLatestCell,
  EconomyMetricId,
  EconomyPoint,
  EconomySeries,
  EconomySnapshot,
  EconomyView,
} from "@/lib/live/economy-types";
export {
  ECONOMY_DEFAULT_GEO,
  ECONOMY_GEOS,
  ECONOMY_METRICS,
  economyGeoMeta,
  economyMetricMeta,
} from "@/lib/live/economy-types";

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "live", "economy.json");

export function getEconomySnapshotPath(): string {
  return SNAPSHOT_PATH;
}

export function readEconomySnapshot(): EconomySnapshot | null {
  try {
    const raw = fs.readFileSync(SNAPSHOT_PATH, "utf8");
    const parsed = JSON.parse(raw) as EconomySnapshot;
    if (!parsed?.geos?.length) return null;
    const ea = parsed.geos.find((g) => g.id === "EA21");
    const hicp = ea?.latest.find((c) => c.metric === "inflation");
    if (!hicp || hicp.value === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function toEconomyView(snap: EconomySnapshot): EconomyView {
  return {
    ...snap,
    euroArea: snap.geos.find((g) => g.id === snap.defaultGeo) ?? null,
  };
}

export function economyBundle(
  view: EconomyView,
  geoId: string = ECONOMY_DEFAULT_GEO,
) {
  return view.geos.find((g) => g.id === geoId) ?? view.euroArea;
}
