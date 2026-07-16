import { NextResponse, type NextRequest } from "next/server";
import { publishWeeklyDraft, skipWeeklyDraft } from "@/lib/weekly-write/publish";
import { readWeeklyDraft } from "@/lib/weekly-write/store-remote";
import { siteBaseUrl, verifyWeeklyActionToken } from "@/lib/weekly-write/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function htmlPage(title: string, body: string, ok: boolean): NextResponse {
  const color = ok ? "#0d9488" : "#b45309";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; background: #0b1220; color: #e2e8f0; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 2rem; }
    main { max-width: 36rem; border: 1px solid #1e293b; border-radius: 12px; padding: 1.75rem; background: #111827; }
    h1 { margin: 0 0 0.75rem; font-size: 1.25rem; color: ${color}; }
    p { margin: 0.5rem 0; line-height: 1.5; color: #cbd5e1; }
    a { color: #5eead4; }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    ${body}
  </main>
</body>
</html>`;
  return new NextResponse(html, {
    status: ok ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const verified = verifyWeeklyActionToken(token);
  if ("error" in verified) {
    return htmlPage(
      "Link invalid",
      `<p>This approve/skip link is ${verified.error.replace(/_/g, " ")}.</p>
       <p>Generate a new draft from the weekly cron or <code>npm run weekly:draft</code>.</p>`,
      false,
    );
  }

  const draft = await readWeeklyDraft();
  if (!draft || draft.id !== verified.draftId) {
    return htmlPage(
      "Draft not found",
      `<p>No matching pending draft for this link. It may already have been handled.</p>`,
      false,
    );
  }

  if (draft.status !== "pending") {
    const site = siteBaseUrl();
    const link =
      draft.status === "published"
        ? `<p>Already published: <a href="${site}/writes/${draft.publishedSlug || draft.slug}">/writes/${draft.publishedSlug || draft.slug}</a></p>`
        : `<p>This draft was skipped earlier.</p>`;
    return htmlPage(`Already ${draft.status}`, link, true);
  }

  try {
    if (verified.action === "skip") {
      await skipWeeklyDraft(draft);
      return htmlPage(
        "Draft skipped",
        `<p><strong>${draft.title}</strong> will not be published.</p>
         <p>Next week's cron can create a fresh draft.</p>`,
        true,
      );
    }

    const { slug } = await publishWeeklyDraft(draft);
    const site = siteBaseUrl();
    return htmlPage(
      "Published",
      `<p><strong>${draft.title}</strong> is committing to Writes.</p>
       <p>After deploy: <a href="${site}/writes/${slug}">${site}/writes/${slug}</a></p>
       <p>Vercel may take a minute to rebuild.</p>`,
      true,
    );
  } catch (err) {
    console.error("[weekly-write/action]", err);
    const message = err instanceof Error ? err.message : "action_failed";
    return htmlPage(
      "Publish failed",
      `<p>${message}</p>
       <p>Check <code>GITHUB_TOKEN</code> and try the link again.</p>`,
      false,
    );
  }
}
