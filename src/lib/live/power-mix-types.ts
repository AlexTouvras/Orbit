/** Europe electricity mix — last-24h share by country (Energy-Charts public_power). */

export type MixBucketId =
  | "fossil"
  | "nuclear"
  | "wind"
  | "hydro"
  | "solar"
  | "biomass"
  | "other";

export type MixBucketMeta = {
  id: MixBucketId;
  label: string;
  /** Tailwind-friendly hex for bars (Orbit palette, not VC clone). */
  color: string;
};

export const MIX_BUCKETS: MixBucketMeta[] = [
  { id: "fossil", label: "Fossil", color: "#d4a017" },
  { id: "nuclear", label: "Nuclear", color: "#5b6abf" },
  { id: "wind", label: "Wind", color: "#e879a8" },
  { id: "hydro", label: "Hydro", color: "#2dd4bf" },
  { id: "solar", label: "Solar", color: "#f5d76e" },
  { id: "biomass", label: "Biomass", color: "#7cb342" },
  { id: "other", label: "Other", color: "#7c6f9c" },
];

export type CountryMixShares = Record<MixBucketId, number>;

export type CountryMixRow = {
  /** Energy-Charts country code, e.g. de */
  id: string;
  label: string;
  /** ISO 3166-1 alpha-2 for flag emoji */
  iso2: string;
  /** Sum of positive MW samples over the window (generation only; share basis). */
  totalMwh: number;
  /** Shares 0–100, sum ≈ 100 when totalMwh > 0. */
  shares: CountryMixShares;
};

export type PowerMixSnapshot = {
  asOf: string;
  windowStart: string;
  windowEnd: string;
  source: string;
  license: string;
  /** Sorted clean → fossil (ascending fossil share). */
  countries: CountryMixRow[];
};

export type PowerMixView = PowerMixSnapshot & {
  /** Europe-wide weighted shares across included countries. */
  europe: CountryMixShares;
  europeTotalMwh: number;
};
