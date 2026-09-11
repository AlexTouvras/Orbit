/** Shared bidding-zone fill for the EU Spot map and portfolio peek. */

export function fillFor(
  value: number,
  min: number,
  max: number,
  diverging: boolean,
): string {
  if (diverging) {
    const span = Math.max(Math.abs(min), Math.abs(max), 1);
    const t = Math.min(1, Math.max(-1, value / span));
    if (t >= 0) {
      return `hsl(350 ${50 + t * 25}% ${42 + t * 8}%)`;
    }
    return `hsl(190 ${55 + Math.abs(t) * 20}% ${42 + Math.abs(t) * 8}%)`;
  }
  const span = max - min || 1;
  const t = Math.min(1, Math.max(0, (value - min) / span));
  const h = 190 - t * 170;
  const s = 55 + t * 20;
  const l = 42 + (1 - Math.abs(t - 0.5)) * 8;
  return `hsl(${h} ${s}% ${l}%)`;
}
