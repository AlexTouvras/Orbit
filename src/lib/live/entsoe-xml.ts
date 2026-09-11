/**
 * Shared ENTSO-E Transparency Platform helpers (XML periods + token load).
 * Token: ENTSOE_SECURITY_TOKEN in .env.local — never ship to the browser.
 */
import "server-only";
import fs from "node:fs";
import path from "node:path";

export const ENTSOE_API = "https://web-api.tp.entsoe.eu/api";

export type EntsoePoint = {
  t: number;
  value: number;
};

export function padEntsoeUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  return `${y}${m}${day}${h}00`;
}

export function resolutionSeconds(res: string): number {
  const m = res.trim().match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/i);
  if (!m) return 3600;
  const hours = Number(m[1] ?? 0);
  const mins = Number(m[2] ?? 0);
  const sec = hours * 3600 + mins * 60;
  return sec > 0 ? sec : 3600;
}

export function loadEntsoeToken(): string | undefined {
  const fromEnv = process.env.ENTSOE_SECURITY_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  try {
    const file = path.join(process.cwd(), ".env.local");
    if (!fs.existsSync(file)) return undefined;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      if (trimmed.slice(0, eq).trim() !== "ENTSOE_SECURITY_TOKEN") continue;
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      return val || undefined;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

function assertNotAck(xml: string) {
  if (/Acknowledgement_MarketDocument/i.test(xml)) {
    const reason =
      xml.match(/<text>([^<]*)<\/text>/i)?.[1]?.trim() ?? "acknowledgement";
    throw new Error(reason);
  }
}

/** Parse Period/Point blocks; `valueTag` is e.g. "quantity" or "price.amount". */
export function parsePeriodPoints(
  xml: string,
  valueTag: string,
): EntsoePoint[] {
  assertNotAck(xml);
  const tag = valueTag.replace(".", "\\.");
  const periods = [...xml.matchAll(/<Period\b[\s\S]*?<\/Period>/gi)].map(
    (m) => m[0],
  );
  const raw: EntsoePoint[] = [];

  for (const period of periods) {
    const startIso = period.match(
      /<(?:[^:>]+:)?start>([^<]+)<\/(?:[^:>]+:)?start>/i,
    )?.[1];
    const resText =
      period.match(
        /<(?:[^:>]+:)?resolution>([^<]+)<\/(?:[^:>]+:)?resolution>/i,
      )?.[1] ?? "PT60M";
    if (!startIso) continue;
    const startMs = Date.parse(startIso);
    if (!Number.isFinite(startMs)) continue;
    const stepSec = resolutionSeconds(resText);

    for (const point of period.matchAll(
      /<(?:[^:>]+:)?Point\b[\s\S]*?<\/(?:[^:>]+:)?Point>/gi,
    )) {
      const block = point[0];
      const pos = Number(
        block.match(
          /<(?:[^:>]+:)?position>([^<]+)<\/(?:[^:>]+:)?position>/i,
        )?.[1],
      );
      const amount = Number(
        block.match(
          new RegExp(
            `<(?:[^:>]+:)?${tag}>([^<]+)<\\/(?:[^:>]+:)?${tag}>`,
            "i",
          ),
        )?.[1],
      );
      if (!Number.isFinite(pos) || !Number.isFinite(amount)) continue;
      raw.push({
        t: Math.floor(startMs / 1000) + (pos - 1) * stepSec,
        value: amount,
      });
    }
  }

  raw.sort((a, b) => a.t - b.t);
  return raw;
}

/** Mean of points sharing the same UTC hour. */
export function toHourlyMean(points: EntsoePoint[]): EntsoePoint[] {
  const buckets = new Map<number, number[]>();
  for (const p of points) {
    const hour = Math.floor(p.t / 3600) * 3600;
    const list = buckets.get(hour) ?? [];
    list.push(p.value);
    buckets.set(hour, list);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, vals]) => ({
      t,
      value: vals.reduce((a, b) => a + b, 0) / vals.length,
    }));
}

export type EntsoeQuery = Record<string, string>;

export async function entsoeFetch(
  params: EntsoeQuery,
  token: string,
): Promise<{ ok: true; text: string; buf: Buffer } | { ok: false; reason: string }> {
  const url = new URL(ENTSOE_API);
  url.searchParams.set("securityToken", token);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/xml, text/xml, application/zip, */*" },
      });
      const buf = Buffer.from(await res.arrayBuffer());
      const text = buf.toString("utf8");
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 3000 * attempt));
        continue;
      }
      if (!res.ok) {
        const reason =
          text.match(/<text>([^<]*)<\/text>/i)?.[1]?.trim() ??
          `HTTP ${res.status}`;
        return { ok: false, reason };
      }
      if (/Acknowledgement_MarketDocument/i.test(text)) {
        const reason =
          text.match(/<text>([^<]*)<\/text>/i)?.[1]?.trim() ??
          "acknowledgement";
        return { ok: false, reason };
      }
      return { ok: true, text, buf };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt === 3) return { ok: false, reason: msg };
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  return { ok: false, reason: "network" };
}

/** Count local-file headers in a ZIP without extracting. */
export function countZipEntries(buf: Buffer): number {
  let n = 0;
  for (let i = 0; i < buf.length - 3; i++) {
    if (
      buf[i] === 0x50 &&
      buf[i + 1] === 0x4b &&
      buf[i + 2] === 0x03 &&
      buf[i + 3] === 0x04
    ) {
      n += 1;
    }
  }
  return n;
}

import { inflateRawSync } from "node:zlib";

/** Extract first XML payload from a small ZIP (stored or deflated). */
export function unzipFirstXml(buf: Buffer): string | null {
  let i = 0;
  while (i < buf.length - 30) {
    if (
      buf[i] !== 0x50 ||
      buf[i + 1] !== 0x4b ||
      buf[i + 2] !== 0x03 ||
      buf[i + 3] !== 0x04
    ) {
      i += 1;
      continue;
    }
    const method = buf.readUInt16LE(i + 8);
    const compSize = buf.readUInt32LE(i + 18);
    const nameLen = buf.readUInt16LE(i + 26);
    const extraLen = buf.readUInt16LE(i + 28);
    const nameStart = i + 30;
    const dataStart = nameStart + nameLen + extraLen;
    const data = buf.subarray(dataStart, dataStart + compSize);
    i = dataStart + compSize;
    try {
      const raw =
        method === 0
          ? data
          : method === 8
            ? inflateRawSync(data)
            : null;
      if (!raw) continue;
      const text = raw.toString("utf8");
      if (text.includes("<")) return text;
    } catch {
      continue;
    }
  }
  return null;
}
