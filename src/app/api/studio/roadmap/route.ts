import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isStudioAccessible } from "@/lib/auth";
import {
  getStudioRoadmap,
  writeStudioRoadmap,
  type RoadmapMilestone,
  type RoadmapStatus,
  type RoadmapTrack,
  type StudioRoadmap,
} from "@/lib/studio-roadmap";

export const runtime = "nodejs";

const TRACKS: RoadmapTrack[] = ["career", "website", "evidence"];
const STATUSES: RoadmapStatus[] = [
  "planned",
  "active",
  "evidence",
  "proven",
];

function sanitizeMilestone(raw: unknown): RoadmapMilestone | null {
  if (typeof raw !== "object" || raw === null) return null;
  const m = raw as Record<string, unknown>;
  const id = typeof m.id === "string" ? m.id.trim() : "";
  const title = typeof m.title === "string" ? m.title.trim() : "";
  const track = m.track;
  const status = m.status;
  if (!id || !title) return null;
  if (!TRACKS.includes(track as RoadmapTrack)) return null;
  if (!STATUSES.includes(status as RoadmapStatus)) return null;

  const milestone: RoadmapMilestone = {
    id,
    title,
    track: track as RoadmapTrack,
    status: status as RoadmapStatus,
  };

  if (typeof m.notes === "string" && m.notes.trim()) {
    milestone.notes = m.notes.trim();
  }

  if (Array.isArray(m.links)) {
    const links: { href: string; label: string }[] = [];
    for (const link of m.links) {
      if (typeof link !== "object" || link === null) continue;
      const l = link as Record<string, unknown>;
      const href = typeof l.href === "string" ? l.href.trim() : "";
      const label = typeof l.label === "string" ? l.label.trim() : "";
      if (href && label) links.push({ href, label });
    }
    if (links.length) milestone.links = links;
  }

  return milestone;
}

function sanitize(input: unknown): StudioRoadmap | null {
  if (typeof input !== "object" || input === null) return null;
  const obj = input as Record<string, unknown>;
  if (typeof obj.focusNow !== "string") return null;
  if (!Array.isArray(obj.milestones)) return null;

  const milestones: RoadmapMilestone[] = [];
  for (const raw of obj.milestones) {
    const m = sanitizeMilestone(raw);
    if (m) milestones.push(m);
  }

  return {
    focusNow: obj.focusNow.trim(),
    updatedAt:
      typeof obj.updatedAt === "string"
        ? obj.updatedAt
        : new Date().toISOString(),
    milestones,
  };
}

export async function GET() {
  if (!(await isStudioAccessible())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getStudioRoadmap());
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

  const clean = sanitize(body);
  if (!clean) {
    return NextResponse.json(
      { error: "Invalid roadmap data (focusNow and milestones required)." },
      { status: 422 },
    );
  }

  let result: { viaGithub: boolean; warning?: string };
  try {
    result = await writeStudioRoadmap(clean);
  } catch (err) {
    console.error("[studio] failed to write roadmap:", err);
    const message =
      err instanceof Error ? err.message : "Could not save.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  revalidatePath("/card");
  revalidatePath("/studio/roadmap");

  const message =
    result.warning ??
    (result.viaGithub
      ? "Saved to GitHub — the live site updates in ~2 minutes."
      : "Saved locally. Refresh /card to see NOW.");

  return NextResponse.json({
    ok: true,
    deploying: result.viaGithub,
    warning: result.warning ?? null,
    message,
  });
}
