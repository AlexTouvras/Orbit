/** Tiny OLS via normal equations. No extra dependency. */

function solve(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const m = A.map((row, i) => [...row, b[i] ?? 0]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r]?.[col] ?? 0) > Math.abs(m[pivot]?.[col] ?? 0)) {
        pivot = r;
      }
    }
    const prow = m[pivot];
    const crow = m[col];
    if (!prow || !crow) return null;
    if (Math.abs(prow[col] ?? 0) < 1e-12) return null;
    m[col] = prow;
    m[pivot] = crow;
    const div = m[col]?.[col];
    if (div === undefined || Math.abs(div) < 1e-12) return null;
    for (let j = col; j <= n; j++) {
      const row = m[col];
      if (!row) return null;
      row[j] = (row[j] ?? 0) / div;
    }
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = m[r]?.[col] ?? 0;
      for (let j = col; j <= n; j++) {
        const row = m[r];
        const src = m[col];
        if (!row || !src) return null;
        row[j] = (row[j] ?? 0) - f * (src[j] ?? 0);
      }
    }
  }
  return m.map((row) => row[n] ?? 0);
}

export function olsFit(X: number[][], y: number[]): number[] | null {
  if (X.length < 8 || X.length !== y.length) return null;
  const k = X[0]?.length ?? 0;
  if (k === 0) return null;
  const xtx: number[][] = Array.from({ length: k }, () => Array(k).fill(0));
  const xty = Array(k).fill(0);
  for (let i = 0; i < X.length; i++) {
    const row = X[i];
    const yi = y[i];
    if (!row || yi === undefined) continue;
    for (let a = 0; a < k; a++) {
      xty[a] += (row[a] ?? 0) * yi;
      for (let b = 0; b < k; b++) {
        const r = xtx[a];
        if (r) r[b] += (row[a] ?? 0) * (row[b] ?? 0);
      }
    }
  }
  // Tiny ridge so a constant column (e.g. no wind in NO5) does not singularize XtX.
  for (let a = 0; a < k; a++) {
    const r = xtx[a];
    if (r) r[a] += 1e-6;
  }
  return solve(xtx, xty);
}

export function dot(w: number[], x: number[]): number {
  let s = 0;
  for (let i = 0; i < w.length; i++) s += (w[i] ?? 0) * (x[i] ?? 0);
  return s;
}

export type MixRow = {
  t: number;
  wind: number;
  load: number;
  importMw: number;
  price: number;
};

export type NowcastPoint = {
  t: number;
  actual: number;
  nowcast: number;
  persist: number;
  yday: number | null;
};

export type NowcastScore = {
  n: number;
  mae: number;
  persistMae: number;
  ydayMae: number | null;
  method: string;
};

function features(prev: MixRow): number[] {
  const load = Math.max(prev.load, 1);
  return [1, prev.price, prev.wind / load, prev.importMw / 1000, load / 1000];
}

function mae(pairs: { y: number; yhat: number }[]): number {
  if (pairs.length === 0) return 0;
  let s = 0;
  for (const p of pairs) s += Math.abs(p.y - p.yhat);
  return s / pairs.length;
}

/**
 * One-step: mix at t-1 → day-ahead €/MWh at t.
 * Expanding-window OLS; first `burnIn` points are train-only.
 * Defaults match 15-minute FI Power Pulse (96 = 24h). Pass 12 / 24 for hourly.
 */
export function walkForwardNowcast(
  rows: MixRow[],
  burnIn = 96,
  ydayStep = 96,
): { points: NowcastPoint[]; score: NowcastScore } {
  const points: NowcastPoint[] = [];
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const cur = rows[i];
    if (!prev || !cur) continue;
    if (i < burnIn) continue;
    const X: number[][] = [];
    const y: number[] = [];
    for (let j = 1; j < i; j++) {
      const a = rows[j - 1];
      const b = rows[j];
      if (!a || !b) continue;
      X.push(features(a));
      y.push(b.price);
    }
    const w = olsFit(X, y);
    if (!w) continue;
    const ydayRow = rows[i - ydayStep];
    points.push({
      t: cur.t,
      actual: cur.price,
      nowcast: dot(w, features(prev)),
      persist: prev.price,
      yday: ydayRow ? ydayRow.price : null,
    });
  }

  const scored = points.filter((p) => Number.isFinite(p.nowcast));
  const ydayPairs = scored
    .filter((p) => p.yday !== null)
    .map((p) => ({ y: p.actual, yhat: p.yday as number }));

  return {
    points: scored,
    score: {
      n: scored.length,
      mae: mae(scored.map((p) => ({ y: p.actual, yhat: p.nowcast }))),
      persistMae: mae(scored.map((p) => ({ y: p.actual, yhat: p.persist }))),
      ydayMae: ydayPairs.length ? mae(ydayPairs) : null,
      method:
        ydayStep === 24
          ? "OLS expanding window: last print + wind share, net import, load at t−1h → day-ahead at t"
          : "OLS expanding window: last print + wind share, net import, load at t−15m → FI price at t",
    },
  };
}

/** Fit on the full sample, then predict the next price from the last mix row. */
export function nextStepNowcast(rows: MixRow[]): number | null {
  if (rows.length < 12) return null;
  const X: number[][] = [];
  const y: number[] = [];
  for (let j = 1; j < rows.length; j++) {
    const a = rows[j - 1];
    const b = rows[j];
    if (!a || !b) continue;
    X.push(features(a));
    y.push(b.price);
  }
  const w = olsFit(X, y);
  const last = rows[rows.length - 1];
  if (!w || !last) return null;
  return dot(w, features(last));
}

export function alignPrice(
  t: number[],
  priceT: number[],
  price: Array<number | null>,
): Array<number | null> {
  const map = new Map<number, number>();
  for (let i = 0; i < priceT.length; i++) {
    const ts = priceT[i];
    const v = price[i];
    if (ts === undefined || v === null || !Number.isFinite(v)) continue;
    map.set(ts, v);
  }
  return t.map((ts) => {
    const exact = map.get(ts);
    if (exact !== undefined) return exact;
    const hour = Math.floor(ts / 3600) * 3600;
    return map.get(hour) ?? null;
  });
}
