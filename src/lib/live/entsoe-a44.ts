/**
 * ENTSO-E Transparency Platform — Energy Prices [12.1.D] (documentType A44).
 */
import {
  entsoeFetch,
  loadEntsoeToken,
  padEntsoeUtc,
  parsePeriodPoints,
  toHourlyMean,
} from "@/lib/live/entsoe-xml";

export type EntsoePricePoint = {
  t: number;
  price: number;
};

export { loadEntsoeToken };

export function parseA44Prices(xml: string): EntsoePricePoint[] {
  return toHourlyMean(parsePeriodPoints(xml, "price.amount")).map((p) => ({
    t: p.t,
    price: p.value,
  }));
}

export async function fetchA44DayAhead(
  eic: string,
  start: Date,
  end: Date,
  token: string,
): Promise<EntsoePricePoint[] | null> {
  const result = await entsoeFetch(
    {
      documentType: "A44",
      in_Domain: eic,
      out_Domain: eic,
      "contract_MarketAgreement.type": "A01",
      periodStart: padEntsoeUtc(start),
      periodEnd: padEntsoeUtc(end),
    },
    token,
  );
  if (!result.ok) {
    console.warn(`[entsoe:a44] ${eic}: ${result.reason}`);
    return null;
  }
  try {
    return parseA44Prices(result.text);
  } catch (err) {
    console.warn(
      `[entsoe:a44] ${eic}:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
