/**
 * Signal Convergence — scroll poses for the site background.
 * Streams of records, one selected chain, then a restrained vortex.
 * Pure math so the choreography can be checked without a canvas.
 */

export const STREAMS = 6;

/** Pages shorter than this stay in the data field instead of snapping into the vortex. */
const SHORT_PAGE_PX = 520;

export type SignalRecord = {
  stream: number;
  /** Position along the stream, 0–1. */
  u: number;
  speed: number;
  size: number;
  chain: boolean;
};

export type SignalStage = {
  /** 0 = even field, 1 = the chain is the focus. */
  emphasis: number;
  /** 0 = horizontal streams, 1 = vortex. */
  morph: number;
  /** 0 = peak vortex, 1 = calmer arrival field. */
  settle: number;
  zoom: number;
};

export type SignalPoint = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  chain: boolean;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function createSignalField(perStream: number): SignalRecord[] {
  const count = Math.max(8, perStream);
  const records: SignalRecord[] = [];
  for (let stream = 0; stream < STREAMS; stream++) {
    const chainIndex = Math.round((0.22 + stream * 0.1) * (count - 1));
    for (let i = 0; i < count; i++) {
      records.push({
        stream,
        u: (i + 0.5) / count,
        speed: 0.012 + (stream % 3) * 0.004 + (i % 5) * 0.001,
        size: 0.7 + ((i * 3 + stream) % 5) * 0.22,
        chain: i === chainIndex,
      });
    }
  }
  return records;
}

/** Map window scroll into 0–1. Short pages never leave the opening field. */
export function signalProgress(scrollY: number, scrollRange: number): number {
  if (scrollRange <= 0) return 0;
  if (scrollRange < SHORT_PAGE_PX) {
    return clamp01(scrollY / SHORT_PAGE_PX) * 0.12;
  }
  return clamp01(scrollY / scrollRange);
}

export function signalStage(progress: number): SignalStage {
  const p = clamp01(progress);
  const emphasis = smoothstep(0.06, 0.22, p);
  // Once the streams have bent in, they stay a vortex. Settle only calms it.
  const morph = smoothstep(0.18, 0.58, p);
  const settle = smoothstep(0.7, 0.95, p);
  const zoom = 1 + morph * 0.18 * (1 - settle * 0.8);
  return { emphasis, morph, settle, zoom };
}

export function signalPoint(
  record: SignalRecord,
  time: number,
  stage: SignalStage,
  width: number,
  height: number,
): SignalPoint {
  const lane =
    (0.16 + (record.stream / (STREAMS - 1)) * 0.68) * height;
  const travel = (record.u + time * record.speed) % 1;
  const streamX = travel * width;
  const streamY =
    lane +
    Math.sin(record.u * 6 + time * 0.25 + record.stream) *
      4 *
      (1 - stage.morph);

  const cx = width * 0.5;
  const cy = height * 0.46;
  const angle =
    record.u * Math.PI * 5.2 +
    (record.stream / STREAMS) * Math.PI * 2 +
    time * 0.12 * (1 - stage.settle * 0.8);
  const radiusNorm = 0.05 + (1 - record.u) * 0.2;
  const rad =
    radiusNorm *
    Math.min(width, height) *
    (1.35 + stage.settle * 0.4);
  const vortexX = cx + Math.cos(angle) * rad;
  const vortexY = cy + Math.sin(angle) * rad * 0.76;

  const morph = stage.morph;
  const x = streamX * (1 - morph) + vortexX * morph;
  const y = streamY * (1 - morph) + vortexY * morph;

  const depth = 0.55 + 0.45 * radiusNorm;
  const base = record.chain ? 0.95 : 0.38 + (record.stream % 3) * 0.06;
  const focus = record.chain ? 1 : 1 - stage.emphasis * 0.35;
  const calm = 1 - stage.settle * (record.chain ? 0.1 : 0.28);
  const alpha = base * focus * calm * (1 - morph + morph * depth);

  return {
    x,
    y,
    radius: record.size * (record.chain ? 2.1 : 1) * (1 + morph * 0.2),
    alpha,
    chain: record.chain,
  };
}
