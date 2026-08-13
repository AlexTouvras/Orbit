import { NextResponse, type NextRequest } from "next/server";
import {
  closeFieldCardPullRequest,
  getPullRequest,
  getRepoFileText,
  mergeFieldCardPullRequest,
  notifyFieldCardSlack,
} from "@/lib/field-card/github";
import {
  verifyFieldCardActionToken,
  type FieldCardTokenPayload,
} from "@/lib/field-card/tokens";
import { requireFieldCardConfig } from "@/lib/field-card/registry";
import { hasGithubStorage, writeRepoFile } from "@/lib/github-storage";
import { getSiteUrl } from "@/lib/site";

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
    a { color: #5eead4; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.25rem; }
    button, .btn {
      appearance: none; border: 0; border-radius: 8px; padding: 0.7rem 1rem;
      font: inherit; font-weight: 600; cursor: pointer; text-decoration: none;
      display: inline-flex; align-items: center; justify-content: center;
    }
    button.primary { background: #0d9488; color: #042f2e; }
    button.danger { background: #334155; color: #fde68a; }
    .btn.ghost { background: transparent; color: #94a3b8; border: 1px solid #334155; }
    form { margin: 0; }
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
  payload: FieldCardTokenPayload,
  prTitle: string,
  prUrl: string,
  token: string,
): NextResponse {
  const card = requireFieldCardConfig(payload.repo);
  const approve = payload.action === "approve";
  const verb = approve ? "Approve & merge" : "Skip (close PR)";
  const btnClass = approve ? "primary" : "danger";
  const title = approve
    ? `Confirm ${card.label} merge`
    : `Confirm ${card.label} skip`;
  const body = `
    <p class="title">${escapeHtml(prTitle)}</p>
    <p>Repo <code>${escapeHtml(payload.repo)}</code> � PR <a href="${escapeHtml(prUrl)}">#${payload.pr}</a></p>
    <p>${
      approve
        ? `This will squash-merge the weekly field card PR into <code>main</code>, then sync <code>${escapeHtml(card.orbitPath)}</code> on Orbit (Pages + alextouvras.com).`
        : "This will close the PR without merging. Next Friday can open a fresh refresh."
    }</p>
    <div class="actions">
      <form method="post" action="/api/field-card/action">
        <input type="hidden" name="token" value="${escapeHtml(token)}" />
        <input type="hidden" name="confirm" value="1" />
        <button type="submit" class="${btnClass}">${escapeHtml(verb)}</button>
      </form>
      <a class="btn ghost" href="${escapeHtml(prUrl)}">Back to PR</a>
    </div>
    <p style="margin-top:1.25rem;font-size:0.85rem;color:#64748b">Confirming prevents Slack link previews from merging by accident.</p>
  `;
  return htmlPage(title, body, true);
}

async function runAction(payload: FieldCardTokenPayload) {
  if (payload.action === "preview") {
    return htmlPage(
      "Wrong link",
      `<p>This token is not an approve/skip action.</p>`,
      false,
    );
  }

  const card = requireFieldCardConfig(payload.repo);

  if (payload.action === "skip") {
    const result = await closeFieldCardPullRequest(payload.repo, payload.pr);
    void notifyFieldCardSlack(
      `Skipped ${card.label} refresh: ${result.title}`,
      `*Skipped:* <${result.url}|${result.title}>\nNext Friday's discovery can open a new PR.`,
    ).catch(() => undefined);
    return htmlPage(
      result.alreadyClosed ? "Already closed" : `${card.label} skipped`,
      `<p><strong>${escapeHtml(result.title)}</strong> will not merge.</p>
       <p><a href="${escapeHtml(result.url)}">Pull request</a></p>`,
      true,
    );
  }

  const result = await mergeFieldCardPullRequest(payload.repo, payload.pr);
  const pages = card.pagesUrl;
  const site = `${getSiteUrl()}${card.sitePath}`;

  let siteSync = "skipped";
  try {
    const html = await getRepoFileText(payload.repo, "index.html", "main");
    if (hasGithubStorage()) {
      await writeRepoFile(
        card.orbitPath,
        html,
        `chore: sync ${card.id} field card after approve (#${payload.pr})`,
      );
      siteSync = "committed";
    } else {
      siteSync = "no_github_storage";
    }
  } catch (err) {
    console.error("[field-card/action] site sync failed", err);
    siteSync = "failed";
  }

  void notifyFieldCardSlack(
    `Approved ${card.label} refresh: ${result.title}`,
    [
      `*Approved & merged:* <${result.url}|${result.title}>`,
      `Pages: <${pages}|github.io> · Site: <${site}|${card.sitePath}>${
        siteSync === "committed"
          ? " (Orbit redeploy queued)"
          : siteSync === "failed"
            ? " (site sync failed — copy index.html manually)"
            : ""
      }`,
    ].join("\n"),
  ).catch(() => undefined);

  return htmlPage(
    result.alreadyMerged ? "Already merged" : `${card.label} approved`,
    `<p><strong>${escapeHtml(result.title)}</strong> is on <code>main</code>.</p>
     <p>GitHub Pages: <a href="${escapeHtml(pages)}">${escapeHtml(pages)}</a></p>
     <p>Site copy: <a href="${escapeHtml(site)}">${escapeHtml(site)}</a>${
       siteSync === "committed"
         ? " — Orbit commit queued; Vercel redeploys shortly."
         : siteSync === "failed"
           ? ` — <strong>sync failed</strong>; update <code>${escapeHtml(card.orbitPath)}</code> manually.`
           : "."
     }</p>`,
    true,
  );
}

/** GET: confirmation only ? never merges (avoids Slack unfurl). */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const verified = verifyFieldCardActionToken(token);
  if ("error" in verified) {
    return htmlPage(
      "Link invalid",
      `<p>This approve/skip link is ${escapeHtml(verified.error.replace(/_/g, " "))}.</p>`,
      false,
    );
  }

  if (verified.action === "preview") {
    return htmlPage("Wrong link", `<p>Use Approve or Skip from Slack.</p>`, false);
  }

  try {
    const pr = await getPullRequest(verified.repo, verified.pr);
    return confirmPage(verified, pr.title, pr.html_url, token);
  } catch (err) {
    const message = err instanceof Error ? err.message : "lookup_failed";
    return htmlPage("PR lookup failed", `<p>${escapeHtml(message)}</p>`, false);
  }
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
      const json = (await req.json()) as { token?: string; confirm?: string | boolean };
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

  const verified = verifyFieldCardActionToken(token);
  if ("error" in verified) {
    return htmlPage(
      "Link invalid",
      `<p>This approve/skip link is ${escapeHtml(verified.error.replace(/_/g, " "))}.</p>`,
      false,
    );
  }

  try {
    return await runAction(verified);
  } catch (err) {
    console.error("[field-card/action]", err);
    const message = err instanceof Error ? err.message : "action_failed";
    return htmlPage(
      "Action failed",
      `<p>${escapeHtml(message)}</p>
       <p>Check that Orbit's <code>GITHUB_TOKEN</code> (or <code>FIELD_CARD_GITHUB_TOKEN</code>) can write to the registered field-card repo.</p>`,
      false,
    );
  }
}
