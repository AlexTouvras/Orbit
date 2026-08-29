import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./session";

export { SESSION_COOKIE };

/** 90 days — long enough that Studio does not feel like a daily login chore. */
export const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  // Fall back to CRON_SECRET so a single secret can power both if desired.
  return (
    process.env.STUDIO_SESSION_SECRET ??
    process.env.CRON_SECRET ??
    "insecure-dev-secret-change-me"
  );
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Create a signed session token valid for SESSION_TTL_MS. */
export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

/** Validate a token's signature and expiry (constant-time signature compare). */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(payload);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return false;
  }
  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}

/** Whether the current request carries a valid Studio session. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Local-only open gate. When STUDIO_DEV_OPEN=1 in development, Studio pages
 * treat the request as authenticated so week-log review does not need OAuth.
 */
export function isStudioDevOpen(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.STUDIO_DEV_OPEN?.trim() === "1"
  );
}

export async function isStudioAccessible(): Promise<boolean> {
  if (isStudioDevOpen()) return true;
  return isAuthenticated();
}

/** Constant-time comparison of the submitted password against STUDIO_PASSWORD. */
export function checkPassword(submitted: string): boolean {
  const expected = process.env.STUDIO_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(submitted);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function githubOAuthConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_CLIENT_ID?.trim() &&
      process.env.GITHUB_CLIENT_SECRET?.trim(),
  );
}

/** Comma/space-separated GitHub logins allowed into Studio. */
export function studioGithubAllowlist(): string[] {
  const raw = process.env.STUDIO_GITHUB_ALLOWLIST?.trim() || "AlexTouvras";
  return raw
    .split(/[\s,]+/)
    .map((login) => login.trim().toLowerCase())
    .filter(Boolean);
}

export function isGithubLoginAllowed(login: string): boolean {
  const normalized = login.trim().toLowerCase();
  if (!normalized) return false;
  return studioGithubAllowlist().includes(normalized);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};
