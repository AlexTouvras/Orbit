import { NextResponse, type NextRequest } from "next/server";
import { sendContactEmail } from "@/lib/contact-mail";

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
      { error: "Too many messages. Try again later or email directly." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — pretend success so bots don't adapt.
  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const company = clean(body.company, 120);
  const subject = clean(body.subject, 200);
  const message = clean(body.message, 8000);

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Name, email, subject, and message are required." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const result = await sendContactEmail({
    name,
    email,
    company: company || undefined,
    subject,
    message,
  });

  if (!result.ok) {
    if (result.reason === "not_configured") {
      return NextResponse.json(
        {
          error:
            "Contact form is not configured yet (set RESEND_API_KEY on the server).",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      {
        error:
          result.detail ??
          "Could not send your message. On Resend's free test mode, mail only goes to your Resend account email — set CONTACT_TO_EMAIL to that address.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
