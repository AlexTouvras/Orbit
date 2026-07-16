import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import {
  getEditableProfile,
  writeProfileOverrides,
  type EditableProfile,
  type EditableSocial,
} from "@/lib/profile-store";

export const runtime = "nodejs";

const STRING_FIELDS = [
  "name",
  "handle",
  "githubUsername",
  "role",
  "location",
  "tagline",
  "pillars",
  "availability",
  "yearsExperience",
  "summary",
  "email",
  "resumeUrl",
] as const;

function sanitize(input: unknown): EditableProfile | null {
  if (typeof input !== "object" || input === null) return null;
  const obj = input as Record<string, unknown>;

  const result = {} as EditableProfile;
  for (const field of STRING_FIELDS) {
    const value = obj[field];
    if (typeof value !== "string") return null;
    result[field] = value.trim();
  }

  if (!result.name) return null;

  if (!Array.isArray(obj.socials)) return null;
  const socials: EditableSocial[] = [];
  for (const raw of obj.socials) {
    if (typeof raw !== "object" || raw === null) continue;
    const s = raw as Record<string, unknown>;
    const label = typeof s.label === "string" ? s.label.trim() : "";
    const href = typeof s.href === "string" ? s.href.trim() : "";
    if (!label || !href) continue;
    socials.push({ label, href });
  }
  result.socials = socials;

  if (!Array.isArray(obj.githubRepoAllowlist)) return null;
  result.githubRepoAllowlist = obj.githubRepoAllowlist
    .filter((n): n is string => typeof n === "string")
    .map((n) => n.trim())
    .filter(Boolean);

  return result;
}

/** GET current editable profile (for the Studio form). Auth-gated. */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getEditableProfile());
}

/** Save profile edits. Auth-gated; revalidates affected pages. */
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const clean = sanitize(body);
  if (!clean) {
    return NextResponse.json(
      { error: "Invalid profile data (name is required)." },
      { status: 422 },
    );
  }

  let result: { viaGithub: boolean };
  try {
    result = await writeProfileOverrides(clean);
  } catch (err) {
    console.error("[studio] failed to write profile:", err);
    const message =
      err instanceof Error ? err.message : "Could not save.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  revalidatePath("/", "layout");

  return NextResponse.json({
    ok: true,
    deploying: result.viaGithub,
    message: result.viaGithub
      ? "Saved to GitHub — the live site updates in ~2 minutes."
      : "Saved.",
  });
}
