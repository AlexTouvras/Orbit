/** Production fallback when signing Slack links without NEXT_PUBLIC_SITE_URL. */
export const WEEKLY_WRITE_PRODUCTION_ORIGIN = "https://alextouvras.com";

function normalizeOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/** True when the origin is only reachable on the dev machine (Slack/mobile cannot open it). */
export function isLocalWeeklyWriteOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/**
 * Public origin embedded in Slack Approve/Preview links.
 * Must be reachable from Slack/mobile — never default to localhost for notify.
 */
export function weeklyWriteLinkOrigin(): string {
  const fromPublic = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromPublic) return normalizeOrigin(fromPublic);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return normalizeOrigin(vercel);

  if (process.env.WEEKLY_WRITE_ALLOW_LOCAL_LINKS === "1") {
    return "http://localhost:3000";
  }

  // CI / Cloud Automation without NEXT_PUBLIC_SITE_URL — prefer prod over localhost.
  if (process.env.VERCEL || process.env.CI) {
    return WEEKLY_WRITE_PRODUCTION_ORIGIN;
  }

  return "http://localhost:3000";
}

export function assertWeeklyWriteSlackLinksReady():
  | { ok: true; origin: string }
  | { ok: false; reason: string } {
  const origin = weeklyWriteLinkOrigin();
  if (
    isLocalWeeklyWriteOrigin(origin) &&
    process.env.WEEKLY_WRITE_ALLOW_LOCAL_LINKS !== "1"
  ) {
    return {
      ok: false,
      reason:
        "Set NEXT_PUBLIC_SITE_URL (e.g. https://alextouvras.com) before Slack notify. Approve/Preview links pointed at localhost, which Slack and your phone cannot open.",
    };
  }
  return { ok: true, origin };
}
