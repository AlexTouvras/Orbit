import "server-only";
import fs from "node:fs";
import path from "node:path";
import type {
  CountryMixShares,
  MixBucketId,
  PowerMixSnapshot,
  PowerMixView,
} from "@/lib/live/power-mix-types";
import { MIX_BUCKETS } from "@/lib/live/power-mix-types";

export type {
  CountryMixRow,
  CountryMixShares,
  MixBucketId,
  MixBucketMeta,
  PowerMixSnapshot,
  PowerMixView,
} from "@/lib/live/power-mix-types";
export { MIX_BUCKETS } from "@/lib/live/power-mix-types";

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "live", "power-mix.json");

export function getPowerMixSnapshotPath(): string {
  return SNAPSHOT_PATH;
}

export function readPowerMixSnapshot(): PowerMixSnapshot | null {
  try {
    const raw = fs.readFileSync(SNAPSHOT_PATH, "utf8");
    const parsed = JSON.parse(raw) as PowerMixSnapshot;
    if (!parsed?.countries?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function emptyShares(): CountryMixShares {
  return {
    fossil: 0,
    nuclear: 0,
    wind: 0,
    hydro: 0,
    solar: 0,
    biomass: 0,
    other: 0,
  };
}

export function toPowerMixView(snap: PowerMixSnapshot): PowerMixView {
  const totals = emptyShares();
  let europeTotalMwh = 0;
  for (const row of snap.countries) {
    europeTotalMwh += row.totalMwh;
    for (const b of MIX_BUCKETS) {
      totals[b.id] += (row.shares[b.id] / 100) * row.totalMwh;
    }
  }
  const europe = emptyShares();
  if (europeTotalMwh > 0) {
    for (const b of MIX_BUCKETS) {
      europe[b.id] = (totals[b.id] / europeTotalMwh) * 100;
    }
  }
  return { ...snap, europe, europeTotalMwh };
}

export function mixBucketMeta(id: MixBucketId) {
  return MIX_BUCKETS.find((b) => b.id === id);
}
