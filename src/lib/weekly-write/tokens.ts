import { createHmac, timingSafeEqual } from "node:crypto";

export type WeeklyAction = "approve" | "skip" | "preview";

function signingSecret(): string {
  return (
    process.env.WEEKLY_WRITE_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    "dev-weekly-write-secret"
  );
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

/** Create a signed action token (default TTL 7 days). */
export function signWeeklyActionToken(
  draftId: string,
  action: WeeklyAction,
  ttlSeconds = 7 * 24 * 60 * 60,
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = b64url(JSON.stringify({ draftId, action, exp }));
  const sig = createHmac("sha256", signingSecret())
    .update(payload)
    .digest();
  return `${payload}.${b64url(sig)}`;
}

export function verifyWeeklyActionToken(
  token: string,
): { draftId: string; action: WeeklyAction } | { error: string } {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return { error: "malformed_token" };

  const expected = createHmac("sha256", signingSecret())
    .update(payload)
    .digest();
  const actual = fromB64url(sig);
  if (
    expected.length !== actual.length ||
    !timingSafeEqual(expected, actual)
  ) {
    return { error: "invalid_signature" };
  }

  try {
    const data = JSON.parse(fromB64url(payload).toString("utf8")) as {
      draftId?: string;
      action?: string;
      exp?: number;
    };
    if (
      !data.draftId ||
      (data.action !== "approve" &&
        data.action !== "skip" &&
        data.action !== "preview")
    ) {
      return { error: "invalid_payload" };
    }
    if (typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) {
      return { error: "expired" };
    }
    return { draftId: data.draftId, action: data.action };
  } catch {
    return { error: "invalid_payload" };
  }
}

export function siteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000";
  if (raw.startsWith("http://") || raw.startsWith("https://"))
    return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}

export function weeklyActionUrl(draftId: string, action: WeeklyAction): string {
  const token = signWeeklyActionToken(draftId, action);
  const base = siteBaseUrl();
  if (action === "preview") {
    return `${base}/api/weekly-write/preview?token=${encodeURIComponent(token)}`;
  }
  return `${base}/api/weekly-write/action?token=${encodeURIComponent(token)}`;
}
