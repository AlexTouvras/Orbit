/**
 * Build EU-wide bidding-zone SVG paths from entsoe-py GeoJSON.
 *
 *   npm run live:build-eu-map
 *
 * Source: https://github.com/EnergieID/entsoe-py (MIT)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const rawDir = path.join(root, "data", "live", "geo-raw");
const outPath = path.join(root, "src", "content", "live", "eu-zone-paths.ts");

const RAW_BASE =
  "https://raw.githubusercontent.com/EnergieID/entsoe-py/master/entsoe/geo/geojson";

/** Clip to continental Europe (+ Baltics / Nordics) so Canaries etc. do not shrink the frame. */
const CLIP = { minLon: -11, maxLon: 32, minLat: 34.5, maxLat: 71.5 };

const W = 920;
const H = 780;
const PAD = 18;

/** @typedef {[number, number]} Pt */

async function listRemoteFiles() {
  const res = await fetch(
    "https://api.github.com/repos/EnergieID/entsoe-py/contents/entsoe/geo/geojson",
    { headers: { Accept: "application/vnd.github+json" } },
  );
  if (!res.ok) throw new Error(`github list ${res.status}`);
  const list = /** @type {{ name: string }[]} */ (await res.json());
  return list
    .map((f) => f.name)
    .filter((n) => n.endsWith(".geojson") && !n.includes("_2020"));
}

async function ensureRaw(names) {
  fs.mkdirSync(rawDir, { recursive: true });
  for (const name of names) {
    const dest = path.join(rawDir, name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) continue;
    const url = `${RAW_BASE}/${name}`;
    console.log("download", name);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    await new Promise((r) => setTimeout(r, 200));
  }
}

/** @param {Pt[]} ring @param {number} tol */
function simplify(ring, tol) {
  if (ring.length < 4) return ring;
  const sq = tol * tol;
  /** @param {Pt} a @param {Pt} b @param {Pt} p */
  function dist2(a, b, p) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    if (dx === 0 && dy === 0) {
      const ex = p[0] - a[0];
      const ey = p[1] - a[1];
      return ex * ex + ey * ey;
    }
    let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    const nx = a[0] + t * dx - p[0];
    const ny = a[1] + t * dy - p[1];
    return nx * nx + ny * ny;
  }
  /** @param {Pt[]} pts @param {number} first @param {number} last @param {boolean[]} keep */
  function dp(pts, first, last, keep) {
    let maxD = 0;
    let idx = -1;
    for (let i = first + 1; i < last; i++) {
      const d = dist2(pts[first], pts[last], pts[i]);
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > sq && idx >= 0) {
      keep[idx] = true;
      dp(pts, first, idx, keep);
      dp(pts, idx, last, keep);
    }
  }
  const keep = new Array(ring.length).fill(false);
  keep[0] = true;
  keep[ring.length - 1] = true;
  dp(ring, 0, ring.length - 1, keep);
  return ring.filter((_, i) => keep[i]);
}

/** @param {unknown} geom */
function exteriorRings(geom) {
  /** @type {Pt[][]} */
  const rings = [];
  if (!geom || typeof geom !== "object") return rings;
  const g = /** @type {{ type: string; coordinates: unknown }} */ (geom);
  if (g.type === "Polygon") {
    const coords = /** @type {number[][][]} */ (g.coordinates);
    if (coords[0]) rings.push(coords[0].map((c) => [c[0], c[1]]));
  } else if (g.type === "MultiPolygon") {
    const coords = /** @type {number[][][][]} */ (g.coordinates);
    for (const poly of coords) {
      if (poly[0]) rings.push(poly[0].map((c) => [c[0], c[1]]));
    }
  }
  return rings;
}

/** @param {Pt[]} ring */
function ringArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(a / 2);
}

/** @param {Pt[]} ring */
function centroidInClip(ring) {
  let sx = 0;
  let sy = 0;
  for (const [lon, lat] of ring) {
    sx += lon;
    sy += lat;
  }
  const lon = sx / ring.length;
  const lat = sy / ring.length;
  return (
    lon >= CLIP.minLon &&
    lon <= CLIP.maxLon &&
    lat >= CLIP.minLat &&
    lat <= CLIP.maxLat
  );
}

/** @param {string} file @param {number} maxPieces @param {number} tol */
function loadRings(file, maxPieces, tol) {
  const raw = JSON.parse(fs.readFileSync(path.join(rawDir, file), "utf8"));
  /** @type {Pt[][]} */
  const all = [];
  if (raw.type === "FeatureCollection") {
    for (const f of raw.features ?? []) all.push(...exteriorRings(f.geometry));
  } else if (raw.type === "Feature") {
    all.push(...exteriorRings(raw.geometry));
  } else {
    all.push(...exteriorRings(raw));
  }
  return all
    .filter(centroidInClip)
    .map((r) => simplify(r, tol))
    .filter((r) => r.length >= 4)
    .sort((a, b) => ringArea(b) - ringArea(a))
    .slice(0, maxPieces);
}

/**
 * @param {Record<string, Pt[][]>} zoneRings
 * @param {(lon: number, lat: number) => [number, number]} project
 */
function toShape(zoneRings, project, id) {
  const rings = zoneRings[id];
  if (!rings?.length) return null;
  const parts = rings.map((ring) => {
    const d = ring
      .map((p, i) => {
        const [x, y] = project(p[0], p[1]);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
    return `${d} Z`;
  });
  const main = rings[0];
  let sx = 0;
  let sy = 0;
  for (const [lon, lat] of main) {
    const [x, y] = project(lon, lat);
    sx += x;
    sy += y;
  }
  return {
    d: parts.join(" "),
    labelX: Math.round((sx / main.length) * 10) / 10,
    labelY: Math.round((sy / main.length) * 10) / 10,
  };
}

async function run() {
  const remoteNames = await listRemoteFiles();
  await ensureRaw(remoteNames);

  /** @type {Record<string, Pt[][]>} */
  const allZones = {};
  for (const name of remoteNames) {
    const id = name.replace(/\.geojson$/, "");
    const rings = loadRings(name, 6, 0.05);
    if (rings.length) allZones[id] = rings;
    console.log(id, "rings", rings.length);
  }

  let minLon = CLIP.minLon;
  let maxLon = CLIP.maxLon;
  let minLat = CLIP.minLat;
  let maxLat = CLIP.maxLat;

  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  const lonSpan = maxLon - minLon;
  const latSpan = maxLat - minLat;
  const scale = Math.min(innerW / lonSpan, innerH / latSpan);
  const usedW = lonSpan * scale;
  const usedH = latSpan * scale;
  const ox = PAD + (innerW - usedW) / 2;
  const oy = PAD + (innerH - usedH) / 2;

  /** @param {number} lon @param {number} lat */
  function project(lon, lat) {
    return [ox + (lon - minLon) * scale, oy + (maxLat - lat) * scale];
  }

  /** @type {Record<string, { d: string; labelX: number; labelY: number }>} */
  const shapes = {};
  for (const [stem, rings] of Object.entries(allZones)) {
    const shape = toShape({ [stem]: rings }, project, stem);
    if (shape) shapes[stem] = shape;
  }

  const body = `/* AUTO-GENERATED by scripts/live/build-eu-zone-paths.mjs — do not edit by hand.
 * Zone polygons from EnergieID/entsoe-py (MIT).
 */

export const EU_ZONE_MAP = {
  viewBox: "0 0 ${W} ${H}",
  attribution:
    "European bidding zones from entsoe-py GeoJSON (MIT). Filled zones have live day-ahead on this desk.",
  /** All zone paths keyed by geo stem (FI, SE_3, DE_LU, IT_NORD, …). */
  shapes: ${JSON.stringify(shapes)} as Record<
    string,
    { d: string; labelX: number; labelY: number }
  >,
};
`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, body, "utf8");
  console.log("wrote", outPath, "shapes", Object.keys(shapes).length);
}

void run().catch((err) => {
  console.error(err);
  process.exit(1);
});
