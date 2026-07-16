import { NextResponse, type NextRequest } from "next/server";
import { publishWeeklyDraft, skipWeeklyDraft } from "@/lib/weekly-write/publish";
import { notifyPublished, notifySkipped } from "@/lib/weekly-write/slack";
import { readWeeklyDraft } from "@/lib/weekly-write/store-remote";
import {
  siteBaseUrl,
  verifyWeeklyActionToken,
  weeklyActionUrl,
  type WeeklyAction,
} from "@/lib/weekly-write/tokens";
import type { WeeklyDraft } from "@/lib/weekly-write/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlPage(
  title: string,
  body: string,
  ok: boolean,
  status = ok ? 200 : 400,
): NextResponse {
  const color = ok ? "#0d9488" : "#b45309";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; background: #0b1220; color: #e2e8f0; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 2rem; }
    main { max-width: 36rem; width: 100%; border: 1px solid #1e293b; border-radius: 12px; padding: 1.75rem; background: #111827; }
    h1 { margin: 0 0 0.75rem; font-size: 1.25rem; color: ${color}; }
    p { margin: 0.5rem 0; line-height: 1.5; color: #cbd5e1; }
    .title { color: #f8fafc; font-weight: 600; }
    .summary { color: #94a3b8; font-size: 0.95rem; }
    a { color: #5eead4; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.25rem; }
    button, .btn {
      appearance: none; border: 0; border-radius: 8px; padding: 0.7rem 1rem;
      font: inherit; font-weight: 600; cursor: pointer; text-decoration: none;
      display: inline-flex; align-items: center; justify-content: center;
    }
    button.primary { background: #0d9488; color: #042f2e; }
    button.primary:hover { background: #14b8a6; }
    button.danger { background: #334155; color: #fde68a; }
    button.danger:hover { background: #475569; }
    .btn.ghost { background: transparent; color: #94a3b8; border: 1px solid #334155; }
    form { margin: 0; }
    code { font-size: 0.85em; background: #1e293b; padding: 0.1em 0.35em; border-radius: 4px; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    ${body}
  </main>
</body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function confirmPage(
  draft: WeeklyDraft,
  action: "approve" | "skip",
  token: string,
): NextResponse {
  const isApprove = action === "approve";
  const title = isApprove ? "Publish this Write?" : "Skip this draft?";
  const verb = isApprove ? "Approve & publish" : "Skip draft";
  const btnClass = isApprove ? "primary" : "danger";
  const preview = weeklyActionUrl(draft.id, "preview");

  const body = `
    <p class="title">${escapeHtml(draft.title)}</p>
    <p class="summary">${escapeHtml(draft.summary)}</p>
    <p>${
      isApprove
        ? "This commits the MDX to the repo and marks the draft published. Vercel will redeploy; the article appears under Writes after that."
        : "This marks the draft skipped. Next week's cron can create a fresh one."
    }</p>
    <div class="actions">
      <form method="post" action="/api/weekly-write/action">
        <input type="hidden" name="token" value="${escapeHtml(token)}" />
        <input type="hidden" name="confirm" value="1" />
        <button type="submit" class="${btnClass}">${escapeHtml(verb)}</button>
      </form>
      <a class="btn ghost" href="${escapeHtml(preview)}">Back to preview</a>
    </div>
    <p style="margin-top:1.25rem;font-size:0.85rem;color:#64748b">Confirming prevents Slack link previews from publishing by accident.</p>
  `;

  return htmlPage(title, body, true);
}

async function runAction(
  action: WeeklyAction,
  draft: WeeklyDraft,
): Promise<NextResponse> {
  if (action === "preview") {
    return htmlPage(
      "Wrong link",
      `<p>This is not an approve/skip link. Open the browser preview instead.</p>`,
      false,
    );
  }

  if (action === "skip") {
    await skipWeeklyDraft(draft);
    void notifySkipped(draft).catch(() => undefined);
    return htmlPage(
      "Draft skipped",
      `<p><strong>${escapeHtml(draft.title)}</strong> will not be published.</p>
       <p>Next week's cron can create a fresh draft.</p>`,
      true,
    );
  }

  const { slug } = await publishWeeklyDraft(draft);
  const site = siteBaseUrl();
  void notifyPublished(draft, slug).catch(() => undefined);
  return htmlPage(
    "Published",
    `<p><strong>${escapeHtml(draft.title)}</strong> is committing to Writes.</p>
     <p>After deploy: <a href="${escapeHtml(site)}/writes/${escapeHtml(slug)}">${escapeHtml(site)}/writes/${escapeHtml(slug)}</a></p>
     <p>Vercel usually rebuilds within a minute or two.</p>`,
    true,
  );
}

async function loadPendingDraft(draftId: string): Promise<
  | { ok: true; draft: WeeklyDraft }
  | { ok: false; response: NextResponse }
> {
  const draft = await readWeeklyDraft();
  if (!draft || draft.id !== draftId) {
    return {
      ok: false,
      response: htmlPage(
        "Draft not found",
        `<p>No matching pending draft for this link. It may already have been handled.</p>`,
        false,
        404,
      ),
    };
  }

  if (draft.status !== "pending") {
    const site = siteBaseUrl();
    const link =
      draft.status === "published"
        ? `<p>Already published: <a href="${escapeHtml(site)}/writes/${escapeHtml(draft.publishedSlug || draft.slug)}">/writes/${escapeHtml(draft.publishedSlug || draft.slug)}</a></p>`
        : `<p>This draft was skipped earlier.</p>`;
    return {
      ok: false,
      response: htmlPage(`Already ${draft.status}`, link, true),
    };
  }

  return { ok: true, draft };
}

/** GET: confirmation only — never publishes (avoids Slack/email link prefetch). */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const verified = verifyWeeklyActionToken(token);
  if ("error" in verified) {
    return htmlPage(
      "Link invalid",
      `<p>This approve/skip link is ${escapeHtml(verified.error.replace(/_/g, " "))}.</p>
       <p>Generate a new draft from the weekly cron or <code>npm run weekly:notify-draft</code>.</p>`,
      false,
    );
  }

  if (verified.action === "preview") {
    return htmlPage(
      "Wrong link",
      `<p>Use the browser preview link for reading, or Approve/Skip for publishing.</p>`,
      false,
    );
  }

  const loaded = await loadPendingDraft(verified.draftId);
  if (!loaded.ok) return loaded.response;

  return confirmPage(loaded.draft, verified.action, token);
}

/** POST: confirmed approve or skip. */
export async function POST(req: NextRequest) {
  let token = "";
  let confirmed = false;

  const contentType = req.headers.get("content-type") || "";
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await req.formData();
    token = String(form.get("token") ?? "");
    confirmed = String(form.get("confirm") ?? "") === "1";
  } else {
    try {
      const json = (await req.json()) as {
        token?: string;
        confirm?: string | boolean;
      };
      token = String(json.token ?? "");
      confirmed = json.confirm === true || json.confirm === "1";
    } catch {
      token = "";
    }
  }

  if (!confirmed) {
    return htmlPage(
      "Confirmation required",
      `<p>Open the Approve or Skip link from Slack, then tap the confirm button.</p>`,
      false,
    );
  }

  const verified = verifyWeeklyActionToken(token);
  if ("error" in verified) {
    return htmlPage(
      "Link invalid",
      `<p>This approve/skip link is ${escapeHtml(verified.error.replace(/_/g, " "))}.</p>`,
      false,
    );
  }

  if (verified.action === "preview") {
    return htmlPage(
      "Wrong link",
      `<p>This token cannot publish.</p>`,
      false,
    );
  }

  const loaded = await loadPendingDraft(verified.draftId);
  if (!loaded.ok) return loaded.response;

  try {
    return await runAction(verified.action, loaded.draft);
  } catch (err) {
    console.error("[weekly-write/action]", err);
    const message = err instanceof Error ? err.message : "action_failed";
    return htmlPage(
      "Publish failed",
      `<p>${escapeHtml(message)}</p>
       <p>Check that <code>GITHUB_TOKEN</code> is set on Vercel (repo write access), then try again.</p>`,
      false,
    );
  }
}
