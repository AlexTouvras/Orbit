import { NextResponse, type NextRequest } from "next/server";
import { essayBodyMarkdown } from "@/lib/weekly-write/slack";
import { weeklyWriteErrorHtml } from "@/lib/weekly-write/html-errors";
import { resolveWeeklyDraftForToken } from "@/lib/weekly-write/store-remote";
import {
  siteBaseUrl,
  verifyWeeklyActionToken,
  weeklyActionUrl,
} from "@/lib/weekly-write/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInline(raw: string): string {
  // Protect links, then escape, then restore + bold/code.
  const links: string[] = [];
  let t = raw.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, (_, label, href) => {
    const i = links.length;
    links.push(
      `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${escapeHtml(label)}</a>`,
    );
    return `\u0000L${i}\u0000`;
  });
  t = escapeHtml(t);
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\u0000L(\d+)\u0000/g, (_, i) => links[Number(i)]!);
  return t;
}

/** Very small markdown → HTML for draft preview (headings, bold, links, paragraphs). */
function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let para: string[] = [];
  let listBuf: string[] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    out.push(`<p>${formatInline(para.join(" "))}</p>`);
    para = [];
  };

  const flushList = () => {
    if (listBuf.length === 0) return;
    out.push(`<ul>${listBuf.join("")}</ul>`);
    listBuf = [];
  };

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      flushPara();
      flushList();
      out.push(`<h2>${escapeHtml(line.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (/^###\s+/.test(line)) {
      flushPara();
      flushList();
      out.push(`<h3>${escapeHtml(line.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      flushPara();
      const item = line.replace(/^([-*]|\d+\.)\s+/, "");
      listBuf.push(`<li>${formatInline(item)}</li>`);
      continue;
    }
    if (line.trim() === "") {
      flushPara();
      flushList();
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return out.join("\n");
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const verified = verifyWeeklyActionToken(token);
  if ("error" in verified || verified.action !== "preview") {
    const reason =
      "error" in verified ? verified.error.replace(/_/g, " ") : "not a preview link";
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;background:#0b1220;color:#e2e8f0"><h1>Preview unavailable</h1><p>${reason}</p></body></html>`,
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const loaded = await resolveWeeklyDraftForToken(verified.draftId);
  if (!loaded.ok) {
    const titles: Record<string, string> = {
      github_unconfigured: "Server cannot load draft",
      github_missing_file: "Draft not on GitHub",
      id_mismatch: "Stale Slack link",
    };
    const messages: Record<string, string> = {
      github_unconfigured:
        "Production is missing GITHUB_TOKEN, so Approve/Preview cannot read the pending draft.",
      github_missing_file:
        "No pending draft was found on the GitHub default branch for this link.",
      id_mismatch:
        loaded.current
          ? `GitHub has a different draft (${loaded.current.id}, status ${loaded.current.status}).`
          : "This link points at an older draft id.",
    };
    return weeklyWriteErrorHtml(
      titles[loaded.issue] ?? "Preview unavailable",
      messages[loaded.issue] ?? "Could not load draft.",
      loaded.hint,
      loaded.issue === "github_unconfigured" ? 503 : 404,
    );
  }

  const draft = loaded.draft;

  const approve = weeklyActionUrl(draft.id, "approve");
  const skip = weeklyActionUrl(draft.id, "skip");
  const bodyMd = essayBodyMarkdown(draft);
  const words = bodyMd.split(/\s+/).filter(Boolean).length;
  const htmlBody = mdToHtml(bodyMd);
  const site = siteBaseUrl();

  // Fixed bottom action bar (not sticky header links): sticky headers without
  // z-index get covered by scrolled article content on mobile, so Approve/Skip
  // look tappable but do not receive clicks. Bottom bar + high z-index avoids
  // Slack/browser chrome overlapping the controls too.
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${escapeHtml(draft.title)} — draft preview</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; font-family: Georgia, "Times New Roman", serif; background: #0b1220; color: #e2e8f0; line-height: 1.65; }
    .meta-bar { position: relative; z-index: 1; background: #111827; border-bottom: 1px solid #1e293b; padding: 0.75rem 1.25rem; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 0.85rem; color: #94a3b8; }
    article { max-width: 42rem; margin: 0 auto; padding: 2rem 1.25rem calc(6.5rem + env(safe-area-inset-bottom, 0px)); }
    h1 { font-size: 1.75rem; line-height: 1.25; margin: 0 0 0.5rem; }
    .summary { font-family: ui-sans-serif, system-ui, sans-serif; color: #94a3b8; margin-bottom: 2rem; }
    h2 { font-size: 1.25rem; margin-top: 2rem; }
    h3 { font-size: 1.05rem; margin-top: 1.5rem; }
    article a { color: #5eead4; }
    code { font-family: ui-monospace, monospace; font-size: 0.9em; background: #1e293b; padding: 0.1em 0.35em; border-radius: 4px; }
    ul { padding-left: 1.25rem; }
    li { margin: 0.35rem 0; }
    .action-bar {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 1000;
      display: flex; gap: 0.75rem; flex-wrap: wrap;
      padding: 0.85rem 1.25rem calc(0.85rem + env(safe-area-inset-bottom, 0px));
      background: #0b1220f2; border-top: 1px solid #1e293b;
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      font-family: ui-sans-serif, system-ui, sans-serif;
      pointer-events: auto;
    }
    .action-bar a {
      flex: 1 1 8rem; min-height: 48px; padding: 0.75rem 1rem;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 8px; font-weight: 600; text-decoration: none;
      touch-action: manipulation; -webkit-tap-highlight-color: transparent;
      cursor: pointer; user-select: none;
    }
    .action-bar a.approve { background: #0d9488; color: #042f2e; }
    .action-bar a.approve:active { background: #14b8a6; }
    .action-bar a.skip { background: #334155; color: #fde68a; }
    .action-bar a.skip:active { background: #475569; }
  </style>
</head>
<body>
  <div class="meta-bar">Orbit draft preview · ${escapeHtml(draft.source)} · ~${words} words · <a href="${escapeHtml(site)}" style="color:#5eead4">${escapeHtml(site)}</a></div>
  <article>
    <h1>${escapeHtml(draft.title)}</h1>
    <p class="summary">${escapeHtml(draft.summary)}</p>
    ${htmlBody}
  </article>
  <nav class="action-bar" aria-label="Draft actions">
    <a class="approve" href="${escapeHtml(approve)}">Approve &amp; publish</a>
    <a class="skip" href="${escapeHtml(skip)}">Skip</a>
  </nav>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
