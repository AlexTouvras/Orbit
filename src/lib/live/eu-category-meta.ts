/**
 * Browser-safe ENTSO-E category labels + pulse types (no Node APIs).
 */

export const EU_CATEGORIES = [
  {
    id: "market",
    label: "Market",
    short: "€",
    unit: "€/MWh",
    blurb: "Day-ahead spot (A44)",
  },
  {
    id: "load",
    label: "Load",
    short: "Load",
    unit: "MW",
    blurb: "Actual total load (A65)",
  },
  {
    id: "generation",
    label: "Generation",
    short: "Gen",
    unit: "MW",
    blurb: "Actual generation by type (A75)",
  },
  {
    id: "transmission",
    label: "Transmission",
    short: "Flow",
    unit: "MW",
    blurb: "Net import ≈ load − generation",
  },
  {
    id: "outages",
    label: "Outages",
    short: "Out",
    unit: "events",
    blurb: "Generation unavailability count (A80)",
  },
  {
    id: "balancing",
    label: "Balancing",
    short: "Bal",
    unit: "€/MWh",
    blurb: "Imbalance price when published (A85)",
  },
  {
    id: "operation",
    label: "Operation",
    short: "Ops",
    unit: "%",
    blurb: "Load forecast error |actual−DA|/DA",
  },
  {
    id: "omi",
    label: "OMI",
    short: "OMI",
    unit: "MW",
    blurb: "Installed generation capacity (A68)",
  },
] as const;

export type EuCategoryId = (typeof EU_CATEGORIES)[number]["id"];

export type EuZonePulseLatest = {
  price: number | null;
  loadMw: number | null;
  genMw: number | null;
  windMw: number | null;
  nuclearMw: number | null;
  hydroMw: number | null;
  netImportMw: number | null;
  outageCount: number | null;
  imbalanceEur: number | null;
  loadErrorPct: number | null;
  installedMw: number | null;
};

export type EuZonePulse = {
  id: string;
  label: string;
  geoStem: string;
  /** Shared hourly axis (unix). */
  t: number[];
  price: Array<number | null>;
  load: Array<number | null>;
  wind: Array<number | null>;
  solar: Array<number | null>;
  nuclear: Array<number | null>;
  hydro: Array<number | null>;
  otherGen: Array<number | null>;
  netImport: Array<number | null>;
  loadForecast: Array<number | null>;
  latest: EuZonePulseLatest;
};

export function categoryValue(
  pulse: EuZonePulse | undefined,
  category: EuCategoryId,
): number | null {
  if (!pulse) return null;
  const L = pulse.latest;
  switch (category) {
    case "market":
      return L.price;
    case "load":
      return L.loadMw;
    case "generation":
      return L.genMw;
    case "transmission":
      return L.netImportMw;
    case "outages":
      return L.outageCount;
    case "balancing":
      return L.imbalanceEur;
    case "operation":
      return L.loadErrorPct;
    case "omi":
      return L.installedMw;
    default:
      return null;
  }
}

export function formatCategoryValue(
  category: EuCategoryId,
  value: number | null,
): string {
  if (value === null || !Number.isFinite(value)) return "—";
  switch (category) {
    case "market":
    case "balancing":
      return `€${value.toFixed(1)}`;
    case "operation":
      return `${value.toFixed(1)}%`;
    case "outages":
      return String(Math.round(value));
    default:
      return `${Math.round(value).toLocaleString("en-US")} MW`;
  }
}
