import "server-only";
import fs from "node:fs";
import path from "node:path";
import type {
  EuSpotSnapshot,
  EuSpotView,
} from "@/lib/live/eu-spot-types";
import { EU_ZONES } from "@/lib/live/eu-spot-types";
import type { EuZonePulse } from "@/lib/live/eu-category-meta";

export type {
  EuSpotSnapshot,
  EuSpotView,
  EuZoneDayStats,
  EuZoneId,
} from "@/lib/live/eu-spot-types";
export { EU_ZONES } from "@/lib/live/eu-spot-types";

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "live", "eu-spot.json");

export function getEuSpotSnapshotPath(): string {
  return SNAPSHOT_PATH;
}

export function readEuSpotSnapshot(): EuSpotSnapshot | null {
  try {
    const raw = fs.readFileSync(SNAPSHOT_PATH, "utf8");
    const parsed = JSON.parse(raw) as EuSpotSnapshot;
    if (!parsed?.zones?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function toEuSpotView(snap: EuSpotSnapshot): EuSpotView {
  const fi = snap.today.find((z) => z.id === "FI");
  const hours =
    snap.zones.find((z) => z.id === "FI")?.t ??
    snap.zones[0]?.t ??
    [];
  return {
    asOf: snap.asOf,
    source: snap.source,
    license: snap.license,
    localhostOnly: snap.localhostOnly,
    zones: snap.zones,
    today: snap.today,
    pulses: snap.pulses ?? [],
    fiBaseload: fi?.baseload ?? null,
    hours,
  };
}

export function zoneMeta(id: string) {
  return EU_ZONES.find((z) => z.id === id);
}

export function pulseFor(
  view: EuSpotView,
  id: string,
): EuZonePulse | undefined {
  return view.pulses.find((p) => p.id === id);
}