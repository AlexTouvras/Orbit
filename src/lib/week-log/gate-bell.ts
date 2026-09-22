/** Normal curve for the Arc gate. Average is z = 0 (HUD 50). World class is +3σ (HUD 100). */

export const GATE_Z_MIN = -3;
export const GATE_Z_MAX = 3.2;
/** World class sits at this many standard deviations. Matches fitness-coach `_HUD_WORLD_SIGMAS`. */
export const GATE_WORLD_SIGMAS = 3;

export const GATE_LETTERS = [
  { rank: "E", min: 0, max: 34 },
  { rank: "D", min: 35, max: 49 },
  { rank: "C", min: 50, max: 62 },
  { rank: "B", min: 63, max: 74 },
  { rank: "A", min: 75, max: 86 },
  { rank: "S", min: 87, max: 100 },
] as const;

export type GateLetter = (typeof GATE_LETTERS)[number]["rank"];

const ACKLAM_A = [
  -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
  -3.066479806614716e1, 2.506628277459239,
];
const ACKLAM_B = [
  -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
  -1.328068155288572e1,
];
const ACKLAM_C = [
  -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
  4.374664141464968, 2.938163982698783,
];
const ACKLAM_D = [
  7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416,
];

/** Inverse standard-normal CDF. p is clamped away from 0 and 1. */
export function inverseNormalCdf(p: number): number {
  const plow = 0.02425;
  const phigh = 1 - plow;
  const x = Math.min(1 - 1e-12, Math.max(1e-12, p));
  if (x < plow) {
    const q = Math.sqrt(-2 * Math.log(x));
    return (
      (((((ACKLAM_C[0] * q + ACKLAM_C[1]) * q + ACKLAM_C[2]) * q + ACKLAM_C[3]) * q +
        ACKLAM_C[4]) *
        q +
        ACKLAM_C[5]) /
      ((((ACKLAM_D[0] * q + ACKLAM_D[1]) * q + ACKLAM_D[2]) * q + ACKLAM_D[3]) * q + 1)
    );
  }
  if (x > phigh) {
    const q = Math.sqrt(-2 * Math.log(1 - x));
    return (
      -(
        (((((ACKLAM_C[0] * q + ACKLAM_C[1]) * q + ACKLAM_C[2]) * q + ACKLAM_C[3]) * q +
          ACKLAM_C[4]) *
          q +
          ACKLAM_C[5]) /
        ((((ACKLAM_D[0] * q + ACKLAM_D[1]) * q + ACKLAM_D[2]) * q + ACKLAM_D[3]) * q + 1)
      )
    );
  }
  const q = x - 0.5;
  const r = q * q;
  return (
    (((((ACKLAM_A[0] * r + ACKLAM_A[1]) * r + ACKLAM_A[2]) * r + ACKLAM_A[3]) * r +
      ACKLAM_A[4]) *
      r +
      ACKLAM_A[5]) *
    q /
    (((((ACKLAM_B[0] * r + ACKLAM_B[1]) * r + ACKLAM_B[2]) * r + ACKLAM_B[3]) * r +
      ACKLAM_B[4]) *
      r +
      1)
  );
}

export function normalPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

/** HUD score (0–100) back to standard deviations from average. */
export function scoreToZ(score: number): number {
  if (score >= 100) return GATE_WORLD_SIGMAS;
  if (score <= 0) return inverseNormalCdf(0.005);
  return inverseNormalCdf(score / 100);
}

export function rankForScore(score: number): GateLetter {
  if (score < 35) return "E";
  if (score < 50) return "D";
  if (score < 63) return "C";
  if (score < 75) return "B";
  if (score < 87) return "A";
  return "S";
}

export function letterBands(): Array<{
  rank: GateLetter;
  z0: number;
  z1: number;
  labelZ: number;
}> {
  return GATE_LETTERS.map((letter) => {
    const z0 = letter.min <= 0 ? GATE_Z_MIN : scoreToZ(letter.min);
    const z1 = letter.max >= 100 ? GATE_Z_MAX : scoreToZ(letter.max + 1);
    const mid = (Math.max(z0, GATE_Z_MIN) + Math.min(z1, GATE_Z_MAX)) / 2;
    let labelZ = mid;
    if (letter.rank === "E") labelZ = Math.max(mid, z1 - 0.55);
    if (letter.rank === "S") labelZ = Math.min(mid, z0 + 0.7);
    return { rank: letter.rank, z0, z1, labelZ };
  });
}
