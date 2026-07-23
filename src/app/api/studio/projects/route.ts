import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import {
  getPublishedProjects,
  writePublishedProjects,
} from "@/lib/projects-local";
import { STATUS_ORDER, type PublishedProject } from "@/lib/project-status";

export const runtime = "nodejs";

function sanitize(input: unknown): PublishedProject[] | null {
  if (!Array.isArray(input)) return null;
  const out: PublishedProject[] = [];
  input.forEach((raw, i) => {
    if (typeof raw !== "object" || raw === null) return;
    const p = raw as Record<string, unknown>;
    const name = typeof p.name === "string" ? p.name.trim() : "";
    const sourcePath = typeof p.sourcePath === "string" ? p.sourcePath : "";
    if (!name) return;
    const status =
      typeof p.status === "string" &&
      STATUS_ORDER.includes(p.status as PublishedProject["status"])
        ? (p.status as PublishedProject["status"])
        : "wip";
    out.push({
      id: typeof p.id === "string" && p.id ? p.id : `project-${i}`,
      name,
      description: typeof p.description === "string" ? p.description.trim() : "",
      status,
      tags: Array.isArray(p.tags)
        ? p.tags.map((t) => String(t).trim()).filter(Boolean)
        : [],
      repoUrl: typeof p.repoUrl === "string" ? p.repoUrl.trim() : "",
      liveUrl: typeof p.liveUrl === "string" ? p.liveUrl.trim() : "",
      caseStudyUrl:
        typeof p.caseStudyUrl === "string" ? p.caseStudyUrl.trim() : "",
      featured: Boolean(p.featured),
      sourcePath,
      order: typeof p.order === "number" ? p.order : i,
    });
  });
  return out;
}

/** Current published projects (auth-gated). */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ projects: getPublishedProjects() });
}

/** Save the published project set (auth-gated). */
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

  const projects = sanitize(
    (body as { projects?: unknown })?.projects ?? body,
  );
  if (!projects) {
    return NextResponse.json({ error: "Invalid project data." }, { status: 422 });
  }

  let result: { viaGithub: boolean };
  try {
    result = await writePublishedProjects(projects);
  } catch (err) {
    console.error("[studio] failed to write projects:", err);
    const message = err instanceof Error ? err.message : "Could not save.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  revalidatePath("/portfolio");
  revalidatePath("/");

  return NextResponse.json({
    ok: true,
    count: projects.length,
    deploying: result.viaGithub,
    message: result.viaGithub
      ? "Saved to GitHub — the live site updates in ~2 minutes."
      : "Saved.",
  });
}
