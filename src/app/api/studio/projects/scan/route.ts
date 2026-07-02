import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { scanLocalProjects } from "@/lib/projects-local";

export const runtime = "nodejs";

/** Scan local sibling projects (auth-gated). */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ scanned: scanLocalProjects() });
  } catch (err) {
    console.error("[studio] project scan failed:", err);
    return NextResponse.json({ error: "Scan failed." }, { status: 500 });
  }
}
