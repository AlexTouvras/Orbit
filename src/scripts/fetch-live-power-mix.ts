/**
 * Snapshot last-24h electricity generation mix by European country.
 *
 *   npm run live:fetch-mix
 *
 * Source: Energy-Charts public_power (Fraunhofer ISE) — generation types only.
 * Attribution required. Orbit desk grammar — not a Visual Capitalist reprint.
 */
import fs from "node:fs";
import path from "node:path";
import type {
  CountryMixRow,
  CountryMixShares,
  MixBucketId,
  PowerMixSnapshot,
} from "@/lib/live/power-mix-types";

type ProductionType = { name: string; data: Array<number | null> };
type PublicPower = {
  unix_seconds?: number[];
  production_types?: ProductionType[];
};

const COUNTRIES: { id: string; label: string; iso2: string }[] = [
  { id: "at", label: "Austria", iso2: "AT" },
  { id: "be", label: "Belgium", iso2: "BE" },
  { id: "bg", label: "Bulgaria", iso2: "BG" },
  { id: "ch", label: "Switzerland", iso2: "CH" },
  { id: "cz", label: "Czechia", iso2: "CZ" },
  { id: "de", label: "Germany", iso2: "DE" },
  { id: "dk", label: "Denmark", iso2: "DK" },
  { id: "ee", label: "Estonia", iso2: "EE" },
  { id: "es", label: "Spain", iso2: "ES" },
  { id: "fi", label: "Finland", iso2: "FI" },
  { id: "fr", label: "France", iso2: "FR" },
  { id: "gr", label: "Greece", iso2: "GR" },
  { id: "hr", label: "Croatia", iso2: "HR" },
  { id: "hu", label: "Hungary", iso2: "HU" },
  { id: "it", label: "Italy", iso2: "IT" },
  { id: "lt", label: "Lithuania", iso2: "LT" },
  { id: "lv", label: "Latvia", iso2: "LV" },
  { id: "nl", label: "Netherlands", iso2: "NL" },
  { id: "no", label: "Norway", iso2: "NO" },
  { id: "pl", label: "Poland", iso2: "PL" },
  { id: "pt", label: "Portugal", iso2: "PT" },
  { id: "ro", label: "Romania", iso2: "RO" },
  { id: "se", label: "Sweden", iso2: "SE" },
  { id: "si", label: "Slovenia", iso2: "SI" },
  { id: "sk", label: "Slovakia", iso2: "SK" },
];

const SKIP = [
  "load",
  "residual load",
  "renewable share of load",
  "renewable share of generation",
  "cross border electricity trading",
  "hydro pumped storage consumption",
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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

function classify(name: string): MixBucketId | null {
  const n = name.toLowerCase();
  if (SKIP.some((s) => n === s || n.includes("share of"))) return null;
  if (n.includes("cross border")) return null;
  if (n.includes("consumption")) return null;
  if (
    n.includes("fossil") ||
    n.includes("coal") ||
    n.includes("lignite") ||
    n.includes(" gas") ||
    n.endsWith("gas") ||
    n.includes("oil")
  ) {
    return "fossil";
  }
  if (n.includes("nuclear")) return "nuclear";
  if (n.includes("wind")) return "wind";
  if (n.includes("hydro")) return "hydro";
  if (n.includes("solar") || n.includes("photovoltaic")) return "solar";
  if (n.includes("biomass") || n.includes("bio")) return "biomass";
  return "other";
}

function sumSeries(data: Array<number | null>): number {
  let s = 0;
  for (const v of data) {
    if (v !== null && Number.isFinite(v) && v > 0) s += v;
  }
  return s;
}

async function fetchCountry(
  id: string,
  start: Date,
  end: Date,
): Promise<PublicPower | null> {
  const url = new URL("https://api.energy-charts.info/public_power");
  url.searchParams.set("country", id);
  url.searchParams.set("start", start.toISOString());
  url.searchParams.set("end", end.toISOString());
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.status === 404 || res.status === 400) {
        console.warn(`[live:mix] skip ${id}: ${res.status}`);
        return null;
      }
      if (res.status === 429) {
        await sleep(2000 * attempt);
        continue;
      }
      if (!res.ok) {
        console.warn(`[live:mix] skip ${id}: HTTP ${res.status}`);
        return null;
      }
      return (await res.json()) as PublicPower;
    } catch (err) {
      console.warn(
        `[live:mix] ${id} attempt ${attempt}:`,
        err instanceof Error ? err.message : err,
      );
      await sleep(1000 * attempt);
    }
  }
  return null;
}

function rowFromPower(
  meta: (typeof COUNTRIES)[number],
  power: PublicPower,
): CountryMixRow | null {
  const types = power.production_types ?? [];
  const mwh = emptyShares();
  let total = 0;
  for (const t of types) {
    const bucket = classify(t.name);
    if (!bucket) continue;
    const s = sumSeries(t.data ?? []);
    mwh[bucket] += s;
    total += s;
  }
  if (total <= 0) return null;
  const shares = emptyShares();
  for (const id of Object.keys(shares) as MixBucketId[]) {
    shares[id] = (mwh[id] / total) * 100;
  }
  return {
    id: meta.id,
    label: meta.label,
    iso2: meta.iso2,
    totalMwh: total,
    shares,
  };
}

async function main() {
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  console.log(
    `[live:mix] window ${start.toISOString()} → ${end.toISOString()}`,
  );

  const countries: CountryMixRow[] = [];
  for (const meta of COUNTRIES) {
    process.stdout.write(`[live:mix] ${meta.id}… `);
    const power = await fetchCountry(meta.id, start, end);
    if (!power) {
      console.log("skip");
      continue;
    }
    const row = rowFromPower(meta, power);
    if (!row) {
      console.log("empty");
      continue;
    }
    console.log(
      `fossil ${row.shares.fossil.toFixed(0)}% · Σ ${Math.round(row.totalMwh)}`,
    );
    countries.push(row);
    await sleep(200);
  }

  if (countries.length < 5) {
    throw new Error(
      `Refusing empty desk: only ${countries.length} countries with mix data`,
    );
  }

  countries.sort((a, b) => a.shares.fossil - b.shares.fossil);

  const snap: PowerMixSnapshot = {
    asOf: new Date().toISOString(),
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    source:
      "Energy-Charts public_power (Fraunhofer ISE) · ENTSO-E / TSO underlying",
    license:
      "Energy-Charts — attribution required; generation figures from ENTSO-E / TSOs",
    countries,
  };

  const out = path.join(process.cwd(), "data", "live", "power-mix.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(snap, null, 2)}\n`, "utf8");
  console.log(
    `[live:mix] wrote ${out} · ${countries.length} countries · cleanest ${countries[0]?.label} (${countries[0]?.shares.fossil.toFixed(0)}% fossil)`,
  );
}

main().catch((err) => {
  console.error("[live:mix] failed:", err);
  process.exit(1);
});
