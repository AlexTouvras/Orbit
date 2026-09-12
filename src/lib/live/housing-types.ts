/** Desk region ids — Stat.fi `ashi` monthly table codes. */
export type HousingRegionId = "091" | "049" | "092" | "pks" | "SSS";

export type HousingRegionMeta = {
  id: HousingRegionId;
  label: string;
  /** Short label for peek / dense UI. */
  short: string;
};

export const HOUSING_REGIONS: HousingRegionMeta[] = [
  { id: "091", label: "Helsinki", short: "HKI" },
  { id: "049", label: "Espoo–Kauniainen", short: "ESP" },
  { id: "092", label: "Vantaa", short: "VAN" },
  { id: "pks", label: "Greater Helsinki", short: "PKS" },
  { id: "SSS", label: "Whole country", short: "FI" },
];

export function housingRegionMeta(
  id: string,
): HousingRegionMeta | undefined {
  return HOUSING_REGIONS.find((r) => r.id === id);
}

export type HousingMonthlyPoint = {
  /** Stat.fi period code, e.g. 2026M07. */
  period: string;
  provisional: boolean;
  eurM2: number | null;
  index: number | null;
  momPct: number | null;
  yoyPct: number | null;
  transactions: number | null;
  daysToSale: number | null;
};

export type HousingRegionSeries = {
  id: HousingRegionId;
  label: string;
  short: string;
  monthly: HousingMonthlyPoint[];
};

export type HousingQuarterlyPoint = {
  period: string;
  provisional: boolean;
  eurM2: number | null;
  transactions: number | null;
};

export type HousingDistrictPoint = {
  id: string;
  label: string;
  period: string;
  eurM2: number | null;
  transactions: number | null;
};

/** Postal-code €/m² (ashi 13mu) — Asuntomaatti-style grain. */
export type HousingPostalPoint = {
  /** Five-digit postal code, e.g. 00100. */
  id: string;
  label: string;
  /** Municipality code: 091 / 049 / 092 / 235. */
  kunta: string;
  period: string;
  eurM2: number | null;
  transactions: number | null;
};

export type HousingLatest = {
  period: string;
  provisional: boolean;
  eurM2: number | null;
  momPct: number | null;
  yoyPct: number | null;
  transactions: number | null;
  daysToSale: number | null;
  /** vs Greater Helsinki €/m² (Helsinki − PKS). */
  vsGreater: number | null;
  /** vs whole country €/m² (Helsinki − FI). */
  vsCountry: number | null;
};

export type HousingSnapshot = {
  asOf: string;
  source: string;
  license: string;
  monthlyTable: string;
  quarterlyTable: string;
  buildingType: { id: string; label: string };
  regions: HousingRegionSeries[];
  /** Helsinki flats, longer history (quarterly). */
  helsinkiQuarterly: HousingQuarterlyPoint[];
  /** Latest available Helsinki 1–4 sub-areas (quarterly). */
  districts: HousingDistrictPoint[];
  /** Capital-region postal codes (yearly ashi 13mu). */
  postalTable?: string;
  postalPeriod?: string | null;
  postalAreas?: HousingPostalPoint[];
};

/** Client-safe view model for HousingDesk. */
export type HousingView = {
  asOf: string;
  source: string;
  license: string;
  buildingType: HousingSnapshot["buildingType"];
  regions: HousingRegionSeries[];
  helsinkiQuarterly: HousingQuarterlyPoint[];
  districts: HousingDistrictPoint[];
  postalPeriod: string | null;
  postalAreas: HousingPostalPoint[];
  latest: HousingLatest | null;
  helsinki: HousingRegionSeries | null;
};
