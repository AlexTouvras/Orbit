import { NextResponse, type NextRequest } from "next/server";
import {
  isAlreadySubscribed,
  sendConfirmEmail,
} from "@/lib/newsletter/resend";
import { subscribeConfigured, isNewsletterTestMode } from "@/lib/newsletter/config";
import { normalizeEmail } from "@/lib/newsletter/tokens";

export const runtime = "nodejs";

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 5;
const rateLimit = new Map<string, { count: number; reset: number }>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count += 1;
  return true;
}

function clean(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const email = normalizeEmail(clean(body.email, 200));
  if (!email) {
    return NextResponse.json({ error: "Enter your email." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  if (isNewsletterTestMode()) {
    return NextResponse.json(
      {
        error:
          "The digest is in a private test — public subscribe is closed. Check back later.",
      },
      { status: 503 },
    );
  }

  const ready = subscribeConfigured();
  if (!ready.ok) {
    return NextResponse.json(
      {
        error:
          "Newsletter is not configured yet (set RESEND_API_KEY, RESEND_NEWSLETTER_FROM, and RESEND_NEWSLETTER_AUDIENCE_ID).",
      },
      { status: 503 },
    );
  }

  const already = await isAlreadySubscribed(email);
  if (already) {
    return NextResponse.json({ ok: true });
  }

  const sent = await sendConfirmEmail(email);
  if (!sent.ok) {
    return NextResponse.json(
      { error: sent.reason || "Could not send the confirmation email." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
