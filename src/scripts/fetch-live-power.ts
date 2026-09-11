/**
 * Snapshot Finnish public power + a mix nowcast of FI day-ahead.
 *
 *   npm run live:fetch
 *
 * Mix: Energy-Charts public_power (FI).
 * Prices: Energy-Charts /price?bzn=FI — private/internal use only.
 * Do not ship that price series to the public site; swap to ENTSO-E A44 first.
 */
import fs from "node:fs";
import path from "node:path";
import type { PowerSnapshot } from "@/lib/live/power-types";
import {
  alignPrice,
  walkForwardNowcast,
  type MixRow,
} from "@/lib/live/nowcast";

type ProductionType = { name: string; data: Array<number | null> };

type PublicPower = {
  unix_seconds?: number[];
  production_types?: ProductionType[];
};

type PublicPrice = {
  unix_seconds?: number[];
  price?: Array<number | null>;
  license_info?: string;
  unit?: string;
};

function sumNamed(
  types: ProductionType[],
  match: (name: string) => boolean,
): number[] {
  const hits = types.filter((p) => match(p.name.toLowerCase()));
  if (hits.length === 0) return [];
  const n = hits[0]?.data.length ?? 0;
  const out = new Array(n).fill(0);
  for (const hit of hits) {
    for (let i = 0; i < n; i++) {
      out[i] += Number(hit.data[i] ?? 0);
    }
  }
  return out;
}

function isoFromUnix(sec: number): string {
  return new Date(sec * 1000).toISOString();
}

function pad(series: number[], n: number): number[] {
  return series.length === n ? series : new Array(n).fill(0);
}

async function getJson<T>(url: URL): Promise<T> {
  console.log(`[live:power] GET ${url.toString()}`);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`${url.pathname} ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T;
}

async function main() {
  const end = new Date();
  const trainStart = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  const showStart = new Date(end.getTime() - 24 * 60 * 60 * 1000);

  const powerUrl = new URL("https://api.energy-charts.info/public_power");
  powerUrl.searchParams.set("country", "fi");
  powerUrl.searchParams.set("start", trainStart.toISOString());
  powerUrl.searchParams.set("end", end.toISOString());

  const priceUrl = new URL("https://api.energy-charts.info/price");
  priceUrl.searchParams.set("bzn", "FI");
  priceUrl.searchParams.set("start", trainStart.toISOString());
  priceUrl.searchParams.set("end", end.toISOString());

  const [power, prices] = await Promise.all([
    getJson<PublicPower>(powerUrl),
    getJson<PublicPrice>(priceUrl),
  ]);

  const tAll = power.unix_seconds ?? [];
  const types = power.production_types ?? [];
  if (tAll.length < 48) {
    throw new Error(`unexpected series length ${tAll.length}`);
  }

  const wind = pad(sumNamed(types, (n) => n.includes("wind")), tAll.length);
  const nuclear = pad(
    sumNamed(types, (n) => n.includes("nuclear")),
    tAll.length,
  );
  const hydro = pad(sumNamed(types, (n) => n.includes("hydro")), tAll.length);
  const load = pad(sumNamed(types, (n) => n === "load"), tAll.length);
  const importMw = pad(
    sumNamed(
      types,
      (n) => n.includes("cross border") || n.includes("cross-border"),
    ),
    tAll.length,
  );
  const priceAll = alignPrice(
    tAll,
    prices.unix_seconds ?? [],
    prices.price ?? [],
  );

  const rows: MixRow[] = [];
  for (let i = 0; i < tAll.length; i++) {
    const ts = tAll[i];
    const px = priceAll[i];
    if (ts === undefined || px === null) continue;
    rows.push({
      t: ts,
      wind: wind[i] ?? 0,
      load: load[i] ?? 0,
      importMw: importMw[i] ?? 0,
      price: px,
    });
  }

  const { points, score } = walkForwardNowcast(rows);
  const nowcastByT = new Map(points.map((p) => [p.t, p.nowcast]));

  const showFrom = showStart.getTime() / 1000;
  const idx = tAll
    .map((ts, i) => ({ ts, i }))
    .filter((x) => x.ts !== undefined && x.ts >= showFrom);
  const keep = idx.map((x) => x.i);
  if (keep.length < 8) {
    throw new Error("display window too short");
  }

  const slice = <T,>(arr: T[]): T[] => keep.map((i) => arr[i] as T);
  const t = slice(tAll);
  const first = t[0];
  const last = t[t.length - 1];
  if (first === undefined || last === undefined) {
    throw new Error("missing timestamps");
  }

  const lastDayPoints = points.filter((p) => p.t >= showFrom);
  const mae = (xs: { y: number; yhat: number }[]) =>
    xs.length
      ? xs.reduce((s, p) => s + Math.abs(p.y - p.yhat), 0) / xs.length
      : 0;

  const snapshot: PowerSnapshot = {
    asOf: new Date().toISOString(),
    windowStart: isoFromUnix(first),
    windowEnd: isoFromUnix(last),
    source: "Energy-Charts public_power, country=fi (Fraunhofer ISE)",
    license:
      "Production mix via Energy-Charts. Underlying figures from ENTSO-E / TSOs.",
    cadenceMinutes: 15,
    series: {
      t,
      wind: slice(wind),
      nuclear: slice(nuclear),
      hydro: slice(hydro),
      load: slice(load),
      importMw: slice(importMw),
      priceActual: slice(priceAll),
      priceNowcast: t.map((ts) => nowcastByT.get(ts) ?? null),
    },
    price: {
      n: lastDayPoints.length,
      mae: mae(lastDayPoints.map((p) => ({ y: p.actual, yhat: p.nowcast }))),
      persistMae: mae(
        lastDayPoints.map((p) => ({ y: p.actual, yhat: p.persist })),
      ),
      ydayMae: (() => {
        const ys = lastDayPoints.filter((p) => p.yday !== null);
        return ys.length
          ? mae(ys.map((p) => ({ y: p.actual, yhat: p.yday as number })))
          : score.ydayMae;
      })(),
      method: score.method,
      source: "Energy-Charts /price bzn=FI",
      license:
        "FI day-ahead via Energy-Charts is private/internal use only. Localhost review — do not deploy this series.",
      unit: prices.unit ?? "EUR / MWh",
    },
  };

  const out = path.join(process.cwd(), "data", "live", "power.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `[live:power] wrote ${t.length} display points, train ${rows.length}, last-day MAE €${snapshot.price?.mae.toFixed(1)} vs persist €${snapshot.price?.persistMae.toFixed(1)} → ${out}`,
  );
}

void main().catch((err) => {
  console.error("[live:power] failed:", err);
  process.exit(1);
});
