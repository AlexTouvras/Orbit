import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  appendEssayFeedback,
  getEssayFeedbackEntries,
} from "@/lib/essay-feedback";
import { getWriteBySlug } from "@/lib/writes";
import { notifyEssayFeedback } from "@/lib/weekly-write/slack";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim() ?? "";
  if (!slug) {
    return NextResponse.json({ error: "slug is required." }, { status: 400 });
  }

  if (!getWriteBySlug(slug)) {
    return NextResponse.json({ error: "Essay not found." }, { status: 404 });
  }

  const entries = await getEssayFeedbackEntries(slug);
  return NextResponse.json({ entries });
}

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

function isValidRating(value: string): value is "yes" | "somewhat" | "no" {
  return value === "yes" || value === "somewhat" || value === "no";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many feedback messages. Try again later." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — pretend success so bots do not adapt.
  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const slug = clean(body.slug, 160);
  const rating = clean(body.rating, 32);
  const note = clean(body.note, 280);

  if (!slug || !isValidRating(rating)) {
    return NextResponse.json(
      { error: "Essay and rating are required." },
      { status: 400 },
    );
  }

  const write = getWriteBySlug(slug);
  if (!write) {
    return NextResponse.json({ error: "Essay not found." }, { status: 404 });
  }

  const entry = {
    rating,
    note: note || undefined,
    at: new Date().toISOString(),
  };

  let result: { viaGithub: boolean; totalForEssay: number };
  try {
    result = await appendEssayFeedback(slug, write.title, entry);
  } catch (err) {
    console.error("[essay-feedback] failed to persist:", err);
    const message =
      err instanceof Error ? err.message : "Could not save feedback.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const slack = await notifyEssayFeedback({
    slug,
    title: write.title,
    rating,
    note: entry.note,
  });

  if (!slack.ok) {
    console.error("[essay-feedback] slack notify failed:", slack.reason);
  }

  revalidatePath(`/writes/${slug}`);

  return NextResponse.json({
    ok: true,
    deploying: result.viaGithub,
    slackNotified: slack.ok,
    totalForEssay: result.totalForEssay,
    entry,
    warning: slack.ok ? undefined : slack.reason,
  });
}
