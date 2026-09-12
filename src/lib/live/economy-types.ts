/** Europe Economy Pulse — Eurostat + ECB snapshot types. */

export type EconomyGeoId =
  | "EA21"
  | "EU27_2020"
  | "AT"
  | "BE"
  | "DE"
  | "EE"
  | "ES"
  | "FI"
  | "FR"
  | "GR"
  | "IE"
  | "IT"
  | "LT"
  | "LV"
  | "NL"
  | "PL"
  | "PT"
  | "SE";

export type EconomyGeoMeta = {
  id: EconomyGeoId;
  label: string;
  short: string;
  kind: "area" | "country";
};

export const ECONOMY_GEOS: EconomyGeoMeta[] = [
  { id: "EA21", label: "Euro area", short: "EA", kind: "area" },
  { id: "EU27_2020", label: "European Union", short: "EU", kind: "area" },
  { id: "AT", label: "Austria", short: "AT", kind: "country" },
  { id: "BE", label: "Belgium", short: "BE", kind: "country" },
  { id: "DE", label: "Germany", short: "DE", kind: "country" },
  { id: "EE", label: "Estonia", short: "EE", kind: "country" },
  { id: "ES", label: "Spain", short: "ES", kind: "country" },
  { id: "FI", label: "Finland", short: "FI", kind: "country" },
  { id: "FR", label: "France", short: "FR", kind: "country" },
  { id: "GR", label: "Greece", short: "GR", kind: "country" },
  { id: "IE", label: "Ireland", short: "IE", kind: "country" },
  { id: "IT", label: "Italy", short: "IT", kind: "country" },
  { id: "LT", label: "Lithuania", short: "LT", kind: "country" },
  { id: "LV", label: "Latvia", short: "LV", kind: "country" },
  { id: "NL", label: "Netherlands", short: "NL", kind: "country" },
  { id: "PL", label: "Poland", short: "PL", kind: "country" },
  { id: "PT", label: "Portugal", short: "PT", kind: "country" },
  { id: "SE", label: "Sweden", short: "SE", kind: "country" },
];

export const ECONOMY_DEFAULT_GEO: EconomyGeoId = "EA21";

export function economyGeoMeta(id: string): EconomyGeoMeta | undefined {
  return ECONOMY_GEOS.find((g) => g.id === id);
}

export type EconomyMetricId =
  | "inflation"
  | "unemployment"
  | "confidence"
  | "gdp"
  | "policyRate";

export type EconomyMetricMeta = {
  id: EconomyMetricId;
  label: string;
  unit: string;
  /** For colour cues: true = higher is “hotter”. Confidence is cooler when higher. */
  higherIsWarmer: boolean;
  cadence: "monthly" | "quarterly" | "daily";
};

export const ECONOMY_METRICS: EconomyMetricMeta[] = [
  {
    id: "inflation",
    label: "HICP inflation",
    unit: "% YoY",
    higherIsWarmer: true,
    cadence: "monthly",
  },
  {
    id: "unemployment",
    label: "Unemployment",
    unit: "%",
    higherIsWarmer: true,
    cadence: "monthly",
  },
  {
    id: "confidence",
    label: "Consumer confidence",
    unit: "bal.",
    higherIsWarmer: false,
    cadence: "monthly",
  },
  {
    id: "gdp",
    label: "GDP growth",
    unit: "% QoQ",
    higherIsWarmer: true,
    cadence: "quarterly",
  },
  {
    id: "policyRate",
    label: "ECB deposit rate",
    unit: "%",
    higherIsWarmer: true,
    cadence: "daily",
  },
];

export function economyMetricMeta(
  id: EconomyMetricId,
): EconomyMetricMeta | undefined {
  return ECONOMY_METRICS.find((m) => m.id === id);
}

export type EconomyPoint = {
  period: string;
  value: number | null;
};

export type EconomySeries = {
  metric: EconomyMetricId;
  geo: EconomyGeoId;
  points: EconomyPoint[];
};

export type EconomyLatestCell = {
  metric: EconomyMetricId;
  period: string;
  value: number | null;
  delta: number | null;
};

export type EconomyGeoBundle = {
  id: EconomyGeoId;
  label: string;
  short: string;
  kind: "area" | "country";
  latest: EconomyLatestCell[];
  series: EconomySeries[];
};

export type EconomyHeadline = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
};

export type EconomySnapshot = {
  asOf: string;
  source: string;
  license: string;
  defaultGeo: EconomyGeoId;
  policyRate: EconomySeries;
  geos: EconomyGeoBundle[];
  /** Official euro-area headlines (ECB press + stats). Soft — may be empty. */
  headlines: EconomyHeadline[];
};

export type EconomyView = EconomySnapshot & {
  euroArea: EconomyGeoBundle | null;
};
