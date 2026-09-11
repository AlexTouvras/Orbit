import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { PowerSnapshot, PowerTapePoint } from "@/lib/live/power-types";

export type { PowerSnapshot, PowerSeries, PowerTapePoint } from "@/lib/live/power-types";

export type PowerView = {
  asOf: string;
  source: string;
  license: string;
  cadenceMinutes: number;
  latest: {
    wind: number;
    nuclear: number;
    hydro: number;
    load: number;
    importMw: number;
    windSharePct: number;
    priceActual: number | null;
    priceNowcast: number | null;
  };
  tape: PowerTapePoint[];
  exceptions: { t: number; wind: number; importMw: number; note: string }[];
  price?: PowerSnapshot["price"];
};

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "live", "power.json");

export function getPowerSnapshotPath(): string {
  return SNAPSHOT_PATH;
}

export function readPowerSnapshot(): PowerSnapshot | null {
  try {
    const raw = fs.readFileSync(SNAPSHOT_PATH, "utf8");
    const parsed = JSON.parse(raw) as PowerSnapshot;
    if (!parsed?.series?.t?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function toPowerView(snap: PowerSnapshot): PowerView {
  const { t, wind, nuclear, hydro, load, importMw } = snap.series;
  const n = t.length;
  const tape: PowerTapePoint[] = [];
  for (let i = 0; i < n; i++) {
    const w = wind[i] ?? 0;
    const nuc = nuclear[i] ?? 0;
    const h = hydro[i] ?? 0;
    const ld = load[i] ?? 0;
    const other = Math.max(0, ld - w - nuc - h);
    tape.push({
      t: t[i] ?? 0,
      wind: w,
      nuclear: nuc,
      hydro: h,
      other,
      load: ld,
      importMw: importMw[i] ?? 0,
      priceActual: snap.series.priceActual?.[i] ?? null,
      priceNowcast: snap.series.priceNowcast?.[i] ?? null,
    });
  }

  const last = tape[tape.length - 1];
  const latest = last
    ? {
        wind: last.wind,
        nuclear: last.nuclear,
        hydro: last.hydro,
        load: last.load,
        importMw: last.importMw,
        windSharePct: last.load > 0 ? (100 * last.wind) / last.load : 0,
        priceActual: last.priceActual,
        priceNowcast: last.priceNowcast,
      }
    : {
        wind: 0,
        nuclear: 0,
        hydro: 0,
        load: 0,
        importMw: 0,
        windSharePct: 0,
        priceActual: null,
        priceNowcast: null,
      };

  const exceptions: PowerView["exceptions"] = [];
  for (let i = 1; i < tape.length; i++) {
    const prev = tape[i - 1];
    const cur = tape[i];
    if (!prev || !cur) continue;
    const windDrop = prev.wind - cur.wind;
    const importRise = cur.importMw - prev.importMw;
    if (windDrop > 80 && importRise > 80) {
      exceptions.push({
        t: cur.t,
        wind: cur.wind,
        importMw: cur.importMw,
        note: `Wind −${Math.round(windDrop)} MW, imports +${Math.round(importRise)} MW`,
      });
    }
  }

  return {
    asOf: snap.asOf,
    source: snap.source,
    license: snap.license,
    cadenceMinutes: snap.cadenceMinutes,
    latest,
    tape,
    exceptions: exceptions.slice(-6).reverse(),
    price: snap.price,
  };
}
