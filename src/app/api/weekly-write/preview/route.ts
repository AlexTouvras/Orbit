import { NextResponse, type NextRequest } from "next/server";
import { essayBodyMarkdown } from "@/lib/weekly-write/slack";
import { readWeeklyDraft } from "@/lib/weekly-write/store-remote";
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

  const draft = await readWeeklyDraft();
  if (!draft || draft.id !== verified.draftId) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem;background:#0b1220;color:#e2e8f0"><h1>Draft not found</h1><p>No matching pending draft.</p></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const approve = weeklyActionUrl(draft.id, "approve");
  const skip = weeklyActionUrl(draft.id, "skip");
  const bodyMd = essayBodyMarkdown(draft);
  const words = bodyMd.split(/\s+/).filter(Boolean).length;
  const htmlBody = mdToHtml(bodyMd);
  const site = siteBaseUrl();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(draft.title)} — draft preview</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; font-family: Georgia, "Times New Roman", serif; background: #0b1220; color: #e2e8f0; line-height: 1.65; }
    header { position: sticky; top: 0; background: #111827ee; border-bottom: 1px solid #1e293b; padding: 0.75rem 1.25rem; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between; backdrop-filter: blur(8px); }
    header .meta { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 0.85rem; color: #94a3b8; }
    header .actions a { font-family: ui-sans-serif, system-ui, sans-serif; margin-left: 0.5rem; color: #5eead4; text-decoration: none; font-weight: 600; }
    header .actions a.skip { color: #fbbf24; }
    article { max-width: 42rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    h1 { font-size: 1.75rem; line-height: 1.25; margin: 0 0 0.5rem; }
    .summary { font-family: ui-sans-serif, system-ui, sans-serif; color: #94a3b8; margin-bottom: 2rem; }
    h2 { font-size: 1.25rem; margin-top: 2rem; }
    h3 { font-size: 1.05rem; margin-top: 1.5rem; }
    a { color: #5eead4; }
    code { font-family: ui-monospace, monospace; font-size: 0.9em; background: #1e293b; padding: 0.1em 0.35em; border-radius: 4px; }
    ul { padding-left: 1.25rem; }
    li { margin: 0.35rem 0; }
  </style>
</head>
<body>
  <header>
    <div class="meta">Orbit draft preview · ${escapeHtml(draft.source)} · ~${words} words · <a href="${escapeHtml(site)}">${escapeHtml(site)}</a></div>
    <div class="actions">
      <a href="${escapeHtml(approve)}">Approve &amp; publish</a>
      <a class="skip" href="${escapeHtml(skip)}">Skip</a>
    </div>
  </header>
  <article>
    <h1>${escapeHtml(draft.title)}</h1>
    <p class="summary">${escapeHtml(draft.summary)}</p>
    ${htmlBody}
  </article>
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
