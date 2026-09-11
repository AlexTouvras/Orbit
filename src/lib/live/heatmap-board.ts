/** Nordic live board snapshot (heatmap-web). CORS is * — also fetched server-side. */

export const HEATMAP_BOARD_JSON = "https://heatmap-web-five.vercel.app/board.json";

export type HeatmapStock = {
  ticker: string;
  name: string;
  sector: string;
  marketCapEURm: number;
  changePct: number | null;
};

export type HeatmapBoard = {
  asOf: string;
  stocks: HeatmapStock[];
};

export async function fetchHeatmapBoard(): Promise<HeatmapBoard | null> {
  try {
    const res = await fetch(HEATMAP_BOARD_JSON, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as HeatmapBoard;
    if (!Array.isArray(json.stocks) || json.stocks.length === 0) return null;
    return json;
  } catch {
    return null;
  }
}

export function changeColor(changePct: number | null): string {
  if (changePct == null || !Number.isFinite(changePct)) return "#3D4A55";
  const t = Math.max(-1, Math.min(1, changePct / 4));
  if (t >= 0) return lerpHex("#455A64", "#00C853", t);
  return lerpHex("#455A64", "#FF1744", -t);
}

function lerpHex(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  return `rgb(${Math.round(pa.r + (pb.r - pa.r) * t)} ${Math.round(pa.g + (pb.g - pa.g) * t)} ${Math.round(pa.b + (pb.b - pa.b) * t)})`;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export type HeatmapTile = {
  ticker: string;
  changePct: number | null;
  x: number;
  y: number;
  w: number;
  h: number;
};

type Node = { value: number; stock?: HeatmapStock; children?: Node[] };

function split(
  nodes: Node[],
  x: number,
  y: number,
  w: number,
  h: number,
  gap: number,
  out: HeatmapTile[],
) {
  if (nodes.length === 0 || w <= 0 || h <= 0) return;
  if (nodes.length === 1) {
    const n = nodes[0];
    if (n?.children) {
      split(n.children, x, y, w, h, gap, out);
      return;
    }
    if (n?.stock) {
      out.push({
        ticker: n.stock.ticker,
        changePct: n.stock.changePct,
        x,
        y,
        w,
        h,
      });
    }
    return;
  }
  const total = nodes.reduce((s, n) => s + n.value, 0);
  if (total <= 0) return;
  let acc = 0;
  let cut = 1;
  for (let i = 0; i < nodes.length; i++) {
    acc += nodes[i]?.value ?? 0;
    cut = i + 1;
    if (acc >= total / 2) break;
  }
  if (cut >= nodes.length) cut = nodes.length - 1;
  const left = nodes.slice(0, cut);
  const right = nodes.slice(cut);
  const leftVal = left.reduce((s, n) => s + n.value, 0);
  const frac = leftVal / total;
  if (w >= h) {
    const lw = Math.max(0, w * frac - gap / 2);
    const rw = Math.max(0, w * (1 - frac) - gap / 2);
    split(left, x, y, lw, h, gap, out);
    split(right, x + lw + gap, y, rw, h, gap, out);
  } else {
    const th = Math.max(0, h * frac - gap / 2);
    const bh = Math.max(0, h * (1 - frac) - gap / 2);
    split(left, x, y, w, th, gap, out);
    split(right, x, y + th + gap, w, bh, gap, out);
  }
}

/** Binary-partition treemap of names-sized-by-cap, coloured by day change. */
export function layoutHeatmapTiles(
  stocks: HeatmapStock[],
  width: number,
  height: number,
): HeatmapTile[] {
  const nodes: Node[] = stocks
    .filter((s) => s.marketCapEURm > 0)
    .sort((a, b) => b.marketCapEURm - a.marketCapEURm)
    .map((stock) => ({
      value: Math.max(stock.marketCapEURm, 1),
      stock,
    }));
  const out: HeatmapTile[] = [];
  split(nodes, 0, 0, width, height, 1.4, out);
  return out;
}
