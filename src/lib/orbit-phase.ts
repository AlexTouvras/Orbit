/** Must match `orbit-accent-fg` / `orbit-accent-cycle` duration in globals.css. */
export const ORBIT_ACCENT_MS = 16_000;

export const ORBIT_ACCENT_SELECTOR = ".orbit-accent, .orbit-accent-muted";

/** Negative delay so a newly mounted accent joins the wall-clock cycle. */
export function orbitAccentDelayMs(now = Date.now()): number {
  return -(now % ORBIT_ACCENT_MS);
}
