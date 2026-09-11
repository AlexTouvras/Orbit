import type { EuZonePulse } from "@/lib/live/eu-category-meta";

/** Desk zone id (UI) — stable short codes. */
export type EuZoneId = string;

export type EuZoneMeta = {
  id: EuZoneId;
  label: string;
  /** Energy-Charts bidding-zone query param. */
  energyChartsBzn: string;
  /** Stem in entsoe-py GeoJSON / EU_ZONE_MAP.shapes. */
  geoStem: string;
  /** ENTSO-E EIC for A44 (Wave B). */
  eic: string;
  /** Energy-Charts license for this zone today. */
  publishable: boolean;
};

/**
 * Zones we paint with live baseload.
 * publishable = CC BY on Energy-Charts price API (as of 2026-09).
 */
export const EU_ZONES: EuZoneMeta[] = [
  // Nordics + Baltics
  { id: "FI", label: "Finland", energyChartsBzn: "FI", geoStem: "FI", eic: "10YFI-1--------U", publishable: false },
  { id: "SE1", label: "Sweden 1", energyChartsBzn: "SE1", geoStem: "SE_1", eic: "10Y1001A1001A44P", publishable: false },
  { id: "SE2", label: "Sweden 2", energyChartsBzn: "SE2", geoStem: "SE_2", eic: "10Y1001A1001A45N", publishable: false },
  { id: "SE3", label: "Sweden 3", energyChartsBzn: "SE3", geoStem: "SE_3", eic: "10Y1001A1001A46L", publishable: false },
  { id: "SE4", label: "Sweden 4", energyChartsBzn: "SE4", geoStem: "SE_4", eic: "10Y1001A1001A47J", publishable: true },
  { id: "NO1", label: "Norway 1", energyChartsBzn: "NO1", geoStem: "NO_1", eic: "10YNO-1--------2", publishable: false },
  { id: "NO2", label: "Norway 2", energyChartsBzn: "NO2", geoStem: "NO_2", eic: "10YNO-2--------T", publishable: true },
  { id: "NO3", label: "Norway 3", energyChartsBzn: "NO3", geoStem: "NO_3", eic: "10YNO-3--------J", publishable: false },
  { id: "NO4", label: "Norway 4", energyChartsBzn: "NO4", geoStem: "NO_4", eic: "10YNO-4--------9", publishable: false },
  { id: "NO5", label: "Norway 5", energyChartsBzn: "NO5", geoStem: "NO_5", eic: "10Y1001A1001A48H", publishable: false },
  { id: "DK1", label: "Denmark 1", energyChartsBzn: "DK1", geoStem: "DK_1", eic: "10YDK-1--------W", publishable: true },
  { id: "DK2", label: "Denmark 2", energyChartsBzn: "DK2", geoStem: "DK_2", eic: "10YDK-2--------M", publishable: true },
  { id: "EE", label: "Estonia", energyChartsBzn: "EE", geoStem: "EE", eic: "10Y1001A1001A39I", publishable: false },
  { id: "LV", label: "Latvia", energyChartsBzn: "LV", geoStem: "LV", eic: "10YLV-1001A00074", publishable: false },
  { id: "LT", label: "Lithuania", energyChartsBzn: "LT", geoStem: "LT", eic: "10YLT-1001A0008Q", publishable: false },
  // Central / West
  { id: "DE-LU", label: "Germany–LU", energyChartsBzn: "DE-LU", geoStem: "DE_LU", eic: "10Y1001A1001A82H", publishable: true },
  { id: "NL", label: "Netherlands", energyChartsBzn: "NL", geoStem: "NL", eic: "10YNL----------L", publishable: true },
  { id: "BE", label: "Belgium", energyChartsBzn: "BE", geoStem: "BE", eic: "10YBE----------2", publishable: true },
  { id: "FR", label: "France", energyChartsBzn: "FR", geoStem: "FR", eic: "10YFR-RTE------C", publishable: true },
  { id: "AT", label: "Austria", energyChartsBzn: "AT", geoStem: "AT", eic: "10YAT-APG------L", publishable: true },
  { id: "CH", label: "Switzerland", energyChartsBzn: "CH", geoStem: "CH", eic: "10YCH-SWISSGRIDZ", publishable: true },
  { id: "PL", label: "Poland", energyChartsBzn: "PL", geoStem: "PL", eic: "10YPL-AREA-----S", publishable: true },
  { id: "CZ", label: "Czechia", energyChartsBzn: "CZ", geoStem: "CZ", eic: "10YCZ-CEPS-----N", publishable: true },
  // South / East
  { id: "ES", label: "Spain", energyChartsBzn: "ES", geoStem: "ES", eic: "10YES-REE------0", publishable: false },
  { id: "PT", label: "Portugal", energyChartsBzn: "PT", geoStem: "PT", eic: "10YPT-REN------W", publishable: false },
  { id: "IT-North", label: "Italy North", energyChartsBzn: "IT-North", geoStem: "IT_NORD", eic: "10Y1001A1001A73I", publishable: true },
  { id: "IT-CNOR", label: "Italy Centre-North", energyChartsBzn: "IT-Centre-North", geoStem: "IT_CNOR", eic: "10Y1001A1001A70O", publishable: false },
  { id: "IT-CSUD", label: "Italy Centre-South", energyChartsBzn: "IT-Centre-South", geoStem: "IT_CSUD", eic: "10Y1001A1001A71M", publishable: false },
  { id: "IT-South", label: "Italy South", energyChartsBzn: "IT-South", geoStem: "IT_SUD", eic: "10Y1001A1001A788", publishable: false },
  { id: "IT-Calabria", label: "Italy Calabria", energyChartsBzn: "IT-Calabria", geoStem: "IT_CALA", eic: "10Y1001C--00096J", publishable: false },
  { id: "IT-Sicily", label: "Italy Sicily", energyChartsBzn: "IT-Sicily", geoStem: "IT_SICI", eic: "10Y1001A1001A75E", publishable: false },
  { id: "IT-Sardinia", label: "Italy Sardinia", energyChartsBzn: "IT-Sardinia", geoStem: "IT_SARD", eic: "10Y1001A1001A74G", publishable: false },
  { id: "HU", label: "Hungary", energyChartsBzn: "HU", geoStem: "HU", eic: "10YHU-MAVIR----U", publishable: true },
  { id: "SK", label: "Slovakia", energyChartsBzn: "SK", geoStem: "SK", eic: "10YSK-SEPS-----K", publishable: false },
  { id: "SI", label: "Slovenia", energyChartsBzn: "SI", geoStem: "SI", eic: "10YSI-ELES-----O", publishable: true },
  { id: "HR", label: "Croatia", energyChartsBzn: "HR", geoStem: "HR", eic: "10YHR-HEP------M", publishable: false },
  { id: "RO", label: "Romania", energyChartsBzn: "RO", geoStem: "RO", eic: "10YRO-TEL------P", publishable: false },
  { id: "BG", label: "Bulgaria", energyChartsBzn: "BG", geoStem: "BG", eic: "10YCA-BULGARIA-R", publishable: false },
  { id: "GR", label: "Greece", energyChartsBzn: "GR", geoStem: "GR", eic: "10YGR-HTSO-----Y", publishable: false },
  { id: "RS", label: "Serbia", energyChartsBzn: "RS", geoStem: "RS", eic: "10YCS-SERBIATSOV", publishable: false },
];

export function zoneById(id: string): EuZoneMeta | undefined {
  return EU_ZONES.find((z) => z.id === id);
}

export type EuZoneSeries = {
  id: EuZoneId;
  label: string;
  geoStem: string;
  publishable: boolean;
  /** Unix seconds (hourly). */
  t: number[];
  /** EUR/MWh day-ahead. */
  price: number[];
};

export type EuZoneDayStats = {
  id: EuZoneId;
  label: string;
  geoStem: string;
  baseload: number;
  peak: number;
  trough: number;
  /** Latest hour in the window. */
  latest: number;
  /** Baseload minus FI baseload. */
  spreadVsFi: number;
  /** Baseload vs same zone yesterday. */
  dayOverDay: number | null;
};

export type EuSpotSnapshot = {
  asOf: string;
  windowStart: string;
  windowEnd: string;
  source: string;
  license: string;
  /** true until ENTSOE_SECURITY_TOKEN backs the fetch. */
  localhostOnly: boolean;
  zones: EuZoneSeries[];
  today: EuZoneDayStats[];
  /** Per-zone multi-domain pulse (load/gen/…) when ENTSO-E extras were fetched. */
  pulses?: EuZonePulse[];
};

/** Client-safe view model passed into EuSpotDesk. */
export type EuSpotView = {
  asOf: string;
  source: string;
  license: string;
  localhostOnly: boolean;
  zones: EuSpotSnapshot["zones"];
  today: EuZoneDayStats[];
  pulses: EuZonePulse[];
  fiBaseload: number | null;
  hours: number[];
};
