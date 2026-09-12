/** Low → high €/m² fill for the housing capital-region map. */

export function housingFill(value: number, min: number, max: number): string {
  const span = max - min || 1;
  const t = Math.min(1, Math.max(0, (value - min) / span));
  // Cool cyan (low) → amber (high) — readable on void backgrounds.
  const h = 190 - t * 155;
  const s = 58 + t * 18;
  const l = 44 + (1 - Math.abs(t - 0.5)) * 6;
  return `hsl(${h} ${s}% ${l}%)`;
}
