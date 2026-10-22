import { NextResponse, type NextRequest } from "next/server";
import { bookAppointment, loadAppointments } from "@/lib/appointments/store";
import { formatWhen } from "@/lib/appointments/slots";
import { ownerInbox, sendPlainEmail } from "@/lib/contact-mail";

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
      { error: "Too many bookings. Try again later or email directly." },
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
    return NextResponse.json({ ok: true, mailSent: true });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const note = clean(body.note, 1000);
  const start = clean(body.start, 40);

  if (!name || !email || !start) {
    return NextResponse.json(
      { error: "Name, email, and a time are required." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const loaded = await loadAppointments();
  if (!loaded.ok) {
    return NextResponse.json(
      { error: "Booking is unavailable right now." },
      { status: 503 },
    );
  }

  let booked: Awaited<ReturnType<typeof bookAppointment>>;
  try {
    booked = await bookAppointment({
      start,
      name,
      email,
      note: note || undefined,
    });
  } catch (err) {
    console.error("[appointments] book failed:", err);
    const message = err instanceof Error ? err.message : "Could not save the booking.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!booked.ok) {
    return NextResponse.json({ error: booked.error }, { status: booked.status });
  }

  const when = formatWhen(start, loaded.store.window);
  const owner = ownerInbox();
  const noteBlock = note ? `\n\nNote:\n${note}` : "";
  let mailSent = false;
  if (owner) {
    const toOwner = await sendPlainEmail({
      to: owner,
      replyTo: email,
      subject: `Appointment ${when.date}, ${when.range.split("–")[0]}`,
      text: `${name} <${email}> booked ${when.date}, ${when.range} (${loaded.store.window.timezone}).${noteBlock}\n\nReply to this message to reach them.`,
    });
    const toVisitor = await sendPlainEmail({
      to: email,
      replyTo: owner,
      subject: `Booked: ${when.date}, ${when.range}`,
      text: `You're booked with Alex Touvras.\n\n${when.date}\n${when.range}\n${loaded.store.window.timezone}\n\nReply to this message if you need a different time.`,
    });
    mailSent = toOwner.ok && toVisitor.ok;
    if (!mailSent) {
      console.error("[appointments] mail failed", {
        owner: toOwner.ok ? "ok" : toOwner,
        visitor: toVisitor.ok ? "ok" : toVisitor,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    mailSent,
    when: `${when.date}, ${when.range}`,
  });
}
