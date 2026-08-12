import { createHmac, timingSafeEqual } from "node:crypto";

export type FieldCardAction = "approve" | "skip" | "preview";

export interface FieldCardTokenPayload {
  kind: "field-card";
  repo: string;
  pr: number;
  action: FieldCardAction;
  exp: number;
}

function signingSecret(): string {
  return (
    process.env.FIELD_CARD_ACTION_SECRET?.trim() ||
    process.env.WEEKLY_WRITE_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    "dev-field-card-secret"
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

export function signFieldCardActionToken(
  pr: number,
  action: FieldCardAction,
  repo = "AlexTouvras/agentic-ai-field-card",
  ttlSeconds = 7 * 24 * 60 * 60,
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = b64url(
    JSON.stringify({ kind: "field-card", repo, pr, action, exp } satisfies FieldCardTokenPayload),
  );
  const sig = createHmac("sha256", signingSecret()).update(payload).digest();
  return `${payload}.${b64url(sig)}`;
}

export function verifyFieldCardActionToken(
  token: string,
): FieldCardTokenPayload | { error: string } {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return { error: "malformed_token" };

  const expected = createHmac("sha256", signingSecret()).update(payload).digest();
  const actual = fromB64url(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { error: "invalid_signature" };
  }

  try {
    const data = JSON.parse(fromB64url(payload).toString("utf8")) as Partial<FieldCardTokenPayload>;
    if (
      data.kind !== "field-card" ||
      typeof data.pr !== "number" ||
      !data.repo ||
      (data.action !== "approve" && data.action !== "skip" && data.action !== "preview")
    ) {
      return { error: "invalid_payload" };
    }
    if (typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) {
      return { error: "expired" };
    }
    return {
      kind: "field-card",
      repo: data.repo,
      pr: data.pr,
      action: data.action,
      exp: data.exp,
    };
  } catch {
    return { error: "invalid_payload" };
  }
}

function siteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "https://alextouvras.com";
  return raw.startsWith("http://") || raw.startsWith("https://")
    ? raw.replace(/\/$/, "")
    : `https://${raw.replace(/\/$/, "")}`;
}

export function fieldCardActionUrl(pr: number, action: FieldCardAction): string {
  const token = signFieldCardActionToken(pr, action);
  const base = siteBaseUrl();
  if (action === "preview") {
    return `${base}/api/field-card/preview?token=${encodeURIComponent(token)}`;
  }
  return `${base}/api/field-card/action?token=${encodeURIComponent(token)}`;
}

export function fieldCardPreviewUrl(pr: number): string {
  return fieldCardActionUrl(pr, "preview");
}
