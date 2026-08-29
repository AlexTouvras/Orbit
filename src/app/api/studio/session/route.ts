import { NextResponse } from "next/server";
import {
  createSessionToken,
  isAuthenticated,
  isStudioDevOpen,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

/** Sliding session refresh — call from Studio chrome while authenticated. */
export async function POST() {
  if (isStudioDevOpen()) {
    return NextResponse.json({ ok: true, mode: "dev-open" });
  }
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  return res;
}
