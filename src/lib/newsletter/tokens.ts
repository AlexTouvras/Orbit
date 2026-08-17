import { createHmac, timingSafeEqual } from "node:crypto";

export type NewsletterEmailAction = "confirm" | "unsubscribe";
export type NewsletterDigestAction = "approve" | "skip" | "preview";

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

function signPayload(payloadObj: Record<string, unknown>): string {
  const payload = b64url(JSON.stringify(payloadObj));
  const sig = createHmac("sha256", signingSecret()).update(payload).digest();
  return `${payload}.${b64url(sig)}`;
}

function verifyEnvelope(
  token: string,
): { payload: Record<string, unknown> } | { error: string } {
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
    const data = JSON.parse(fromB64url(payload).toString("utf8")) as Record<
      string,
      unknown
    >;
    if (typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) {
      return { error: "expired" };
    }
    return { payload: data };
  } catch {
    return { error: "invalid_payload" };
  }
}

export function siteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  return `https://${raw.replace(/\/$/, "")}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function signNewsletterEmailToken(
  email: string,
  action: NewsletterEmailAction,
  ttlSeconds = action === "unsubscribe" ? 2 * 365 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
): string {
  return signPayload({
    kind: "newsletter-email",
    email: normalizeEmail(email),
    action,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}

export function verifyNewsletterEmailToken(
  token: string,
): { email: string; action: NewsletterEmailAction } | { error: string } {
  const verified = verifyEnvelope(token);
  if ("error" in verified) return verified;
  const { payload } = verified;
  if (payload.kind !== "newsletter-email") return { error: "invalid_payload" };
  if (
    typeof payload.email !== "string" ||
    (payload.action !== "confirm" && payload.action !== "unsubscribe")
  ) {
    return { error: "invalid_payload" };
  }
  return { email: normalizeEmail(payload.email), action: payload.action };
}

export function signNewsletterDigestToken(
  draftId: string,
  action: NewsletterDigestAction,
  ttlSeconds = 7 * 24 * 60 * 60,
): string {
  return signPayload({
    kind: "newsletter-digest",
    draftId,
    action,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}

export function verifyNewsletterDigestToken(
  token: string,
): { draftId: string; action: NewsletterDigestAction } | { error: string } {
  const verified = verifyEnvelope(token);
  if ("error" in verified) return verified;
  const { payload } = verified;
  if (payload.kind !== "newsletter-digest") return { error: "invalid_payload" };
  if (
    typeof payload.draftId !== "string" ||
    (payload.action !== "approve" &&
      payload.action !== "skip" &&
      payload.action !== "preview")
  ) {
    return { error: "invalid_payload" };
  }
  return { draftId: payload.draftId, action: payload.action };
}

export function newsletterConfirmUrl(email: string): string {
  const token = signNewsletterEmailToken(email, "confirm");
  return `${siteBaseUrl()}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
}

export function newsletterUnsubscribeUrl(email: string): string {
  const token = signNewsletterEmailToken(email, "unsubscribe");
  return `${siteBaseUrl()}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function newsletterDigestActionUrl(
  draftId: string,
  action: NewsletterDigestAction,
): string {
  const token = signNewsletterDigestToken(draftId, action);
  const base = siteBaseUrl();
  if (action === "preview") {
    return `${base}/api/newsletter/preview?token=${encodeURIComponent(token)}`;
  }
  return `${base}/api/newsletter/action?token=${encodeURIComponent(token)}`;
}
