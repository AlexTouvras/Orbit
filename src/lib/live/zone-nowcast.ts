/**
 * Mix nowcast for a bidding-zone pulse (hourly ENTSO-E series).
 * Browser-safe — no Node APIs.
 */
import type { EuZonePulse } from "@/lib/live/eu-category-meta";
import {
  nextStepNowcast,
  walkForwardNowcast,
  type MixRow,
  type NowcastPoint,
  type NowcastScore,
} from "@/lib/live/nowcast";

export function mixRowsFromPulse(pulse: EuZonePulse): MixRow[] {
  const rows: MixRow[] = [];
  for (let i = 0; i < pulse.t.length; i++) {
    const t = pulse.t[i];
    const price = pulse.price[i];
    const load = pulse.load[i];
    if (t === undefined || price === null || load === null) continue;
    if (!Number.isFinite(price) || !Number.isFinite(load)) continue;
    rows.push({
      t,
      price,
      load,
      wind: pulse.wind[i] ?? 0,
      importMw: pulse.netImport[i] ?? 0,
    });
  }
  return rows;
}

export type ZoneNowcast = {
  points: NowcastPoint[];
  score: NowcastScore;
  /** Next hour from the last mix row (no published print yet). */
  nextHour: number | null;
  lastActual: number | null;
  lastNowcast: number | null;
};

export function nowcastForPulse(pulse: EuZonePulse): ZoneNowcast | null {
  const rows = mixRowsFromPulse(pulse);
  if (rows.length < 16) return null;
  const { points, score } = walkForwardNowcast(rows, 12, 24);
  const last = points[points.length - 1];
  return {
    points,
    score,
    nextHour: nextStepNowcast(rows),
    lastActual: last?.actual ?? null,
    lastNowcast: last?.nowcast ?? null,
  };
}

export function windImportExceptions(pulse: EuZonePulse, limit = 6) {
  const out: { t: number; note: string }[] = [];
  for (let i = 1; i < pulse.t.length && out.length < limit; i++) {
    const t = pulse.t[i];
    const w0 = pulse.wind[i - 1];
    const w1 = pulse.wind[i];
    const m0 = pulse.netImport[i - 1];
    const m1 = pulse.netImport[i];
    if (t === undefined || w0 === null || w1 === null || m0 === null || m1 === null) {
      continue;
    }
    const dWind = w1 - w0;
    const dImp = m1 - m0;
    if (dWind < -80 && dImp > 80) {
      out.push({
        t,
        note: `Wind −${Math.round(-dWind)} MW while net import +${Math.round(dImp)} MW`,
      });
    }
  }
  return out;
}
