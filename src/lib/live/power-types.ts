export type PowerSeries = {
  t: number[];
  wind: number[];
  nuclear: number[];
  hydro: number[];
  load: number[];
  /** Positive = net import to Finland (Energy-Charts trading series). */
  importMw: number[];
  priceActual?: Array<number | null>;
  priceNowcast?: Array<number | null>;
};

export type PriceScore = {
  n: number;
  mae: number;
  persistMae: number;
  ydayMae: number | null;
  method: string;
  source: string;
  license: string;
  unit: string;
};

export type PowerSnapshot = {
  asOf: string;
  windowStart: string;
  windowEnd: string;
  source: string;
  license: string;
  cadenceMinutes: number;
  series: PowerSeries;
  price?: PriceScore;
};

export type PowerTapePoint = {
  t: number;
  wind: number;
  nuclear: number;
  hydro: number;
  other: number;
  load: number;
  importMw: number;
  priceActual: number | null;
  priceNowcast: number | null;
};

