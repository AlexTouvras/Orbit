import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isStudioAccessible } from "@/lib/auth";
import {
  cancelAppointment,
  saveAppointmentWindow,
} from "@/lib/appointments/store";
import {
  validateWindow,
  type AppointmentWindow,
} from "@/lib/appointments/slots";

export const runtime = "nodejs";

function clock(value: string): string {
  const match = /^(\d{2}):(\d{2})/.exec(value.trim());
  return match ? `${match[1]}:${match[2]}` : value.trim();
}

function sanitizeWindow(input: unknown): AppointmentWindow | null {
  if (typeof input !== "object" || input === null) return null;
  const raw = input as Record<string, unknown>;
  if (typeof raw.timezone !== "string") return null;
  if (typeof raw.start !== "string" || typeof raw.end !== "string") return null;
  if (typeof raw.slotMinutes !== "number" || typeof raw.horizonDays !== "number") return null;
  if (!Array.isArray(raw.days)) return null;
  const window: AppointmentWindow = {
    timezone: raw.timezone.trim(),
    start: clock(raw.start),
    end: clock(raw.end),
    slotMinutes: raw.slotMinutes,
    horizonDays: raw.horizonDays,
    days: raw.days.filter((day): day is number => typeof day === "number"),
  };
  return validateWindow(window) ? null : window;
}

export async function POST(req: NextRequest) {
  if (!(await isStudioAccessible())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const window = sanitizeWindow(
    typeof body === "object" && body !== null && "window" in body
      ? (body as { window: unknown }).window
      : body,
  );
  if (!window) {
    return NextResponse.json(
      { error: "Check the days, the hours, and the timezone." },
      { status: 422 },
    );
  }

  try {
    const result = await saveAppointmentWindow(window);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }
    revalidatePath("/contact");
    const message =
      result.warning ??
      (result.viaGithub
        ? "Saved to GitHub. The contact page reads it on the next visit."
        : "Saved on this machine.");
    return NextResponse.json({
      ok: true,
      deploying: result.viaGithub,
      warning: result.warning ?? null,
      message,
    });
  } catch (err) {
    console.error("[studio] appointment window:", err);
    const message = err instanceof Error ? err.message : "Could not save.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isStudioAccessible())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const id =
    typeof body === "object" && body !== null && "id" in body && typeof (body as { id: unknown }).id === "string"
      ? (body as { id: string }).id.trim()
      : "";
  if (!id) {
    return NextResponse.json({ error: "Missing booking." }, { status: 400 });
  }

  try {
    const result = await cancelAppointment(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    revalidatePath("/contact");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[studio] cancel appointment:", err);
    const message = err instanceof Error ? err.message : "Could not cancel.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
