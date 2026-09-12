/**
 * Build capital-region postal-code SVG paths from Statistics Finland Paavo.
 *
 *   npm run live:build-housing-map
 *
 * Source: geo.stat.fi postialue:pno (ETRS-TM35FIN), CC BY 4.0.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outPath = path.join(root, "src/content/live/housing-postal-paths.ts");

const W = 720;
const H = 640;
const PAD = 12;
/** Douglas–Peucker tolerance in metres (ETRS-TM35FIN). */
const TOL = 80;

const MUNICIPALITIES = ["091", "049", "092", "235"];

/** @typedef {[number, number]} Pt */

/**
 * @param {Pt[]} ring
 * @param {number} tol
 */
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
  const out = ring.filter((_, i) => keep[i]);
  if (out.length >= 2) {
    const a = out[0];
    const b = out[out.length - 1];
    if (a[0] !== b[0] || a[1] !== b[1]) out.push([a[0], a[1]]);
  }
  return out;
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

async function fetchFeatures() {
  const cql = `kunta IN (${MUNICIPALITIES.map((k) => `'${k}'`).join(",")})`;
  const url =
    "https://geo.stat.fi/geoserver/postialue/wfs?" +
    new URLSearchParams({
      service: "WFS",
      version: "2.0.0",
      request: "GetFeature",
      typeNames: "postialue:pno",
      outputFormat: "application/json",
      srsName: "EPSG:3067",
      CQL_FILTER: cql,
    }).toString();
  console.log("fetch", url.slice(0, 96), "…");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WFS ${res.status}`);
  return /** @type {{ features: Array<{ properties: Record<string, unknown>; geometry: unknown }> }} */ (
    await res.json()
  );
}

async function run() {
  const fc = await fetchFeatures();
  /** @type {Array<{ id: string; label: string; kunta: string; rings: Pt[][] }>} */
  const areas = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const f of fc.features) {
    const id = String(f.properties.posti_alue ?? "");
    if (!/^\d{5}$/.test(id)) continue;
    const nimi = String(f.properties.nimi ?? id);
    const kunta = String(f.properties.kunta ?? "");
    const rings = exteriorRings(f.geometry)
      .map((r) => simplify(r, TOL))
      .filter((r) => r.length >= 4);
    if (!rings.length) continue;
    for (const ring of rings) {
      for (const [x, y] of ring) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    areas.push({ id, label: nimi, kunta, rings });
  }

  areas.sort((a, b) => a.id.localeCompare(b.id));

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  const scale = Math.min(innerW / spanX, innerH / spanY);
  const usedW = spanX * scale;
  const usedH = spanY * scale;
  const ox = PAD + (innerW - usedW) / 2;
  const oy = PAD + (innerH - usedH) / 2;

  /** @param {number} x @param {number} y */
  function project(x, y) {
    return [ox + (x - minX) * scale, oy + (maxY - y) * scale];
  }

  const shapes = areas.map((area) => {
    const parts = area.rings.map((ring) => {
      const d = ring
        .map((p, i) => {
          const [x, y] = project(p[0], p[1]);
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join("");
      return `${d}Z`;
    });
    return {
      id: area.id,
      label: area.label,
      kunta: area.kunta,
      d: parts.join(""),
    };
  });

  const body = `/** AUTO-GENERATED by scripts/live/build-housing-postal-paths.mjs — do not edit.
 * Postal-code outlines for Helsinki Housing Pulse (capital region).
 * Source: Statistics Finland Paavo postialue:pno (ETRS-TM35FIN → SVG).
 * License: CC BY 4.0 — Statistics Finland.
 */

export type HousingPostalShape = {
  id: string;
  label: string;
  /** Municipality code: 091 Helsinki, 049 Espoo, 092 Vantaa, 235 Kauniainen. */
  kunta: string;
  d: string;
};

export const HOUSING_POSTAL_VIEWBOX = "0 0 ${W} ${H}";

export const HOUSING_POSTAL_ATTRIBUTION =
  "Postal-code borders © Statistics Finland (CC BY 4.0), Paavo pno simplified";

export const HOUSING_POSTAL_SHAPES: HousingPostalShape[] = ${JSON.stringify(shapes)};
`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, body, "utf8");
  console.log(
    "wrote",
    outPath,
    "shapes",
    shapes.length,
    "bytes",
    fs.statSync(outPath).size,
  );
}

void run().catch((err) => {
  console.error(err);
  process.exit(1);
});
