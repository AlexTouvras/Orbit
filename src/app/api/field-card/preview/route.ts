import { NextResponse, type NextRequest } from "next/server";
import { getPullRequest, getRepoFileText } from "@/lib/field-card/github";
import { verifyFieldCardActionToken } from "@/lib/field-card/tokens";

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

function injectPreviewBanner(html: string, pr: number, prUrl: string): string {
  const banner = `<aside id="orbit-field-card-preview-banner" role="status" style="position:sticky;top:0;z-index:9999;margin:0;padding:0.65rem 1rem;background:#0f766e;color:#ecfdf5;font:600 0.9rem/1.4 ui-sans-serif,system-ui,sans-serif;border-bottom:1px solid #115e59">
Proposed field card · PR <a href="${escapeHtml(prUrl)}" style="color:#ccfbf1">#${pr}</a> · not live yet — Approve in Slack to publish
</aside>`;

  if (/<body[^>]*>/i.test(html)) {
    return html.replace(/<body([^>]*)>/i, `<body$1>${banner}`);
  }
  return `${banner}${html}`;
}

function errorPage(title: string, message: string, status = 400): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${escapeHtml(title)}</title>
<style>
  body{font-family:ui-sans-serif,system-ui,sans-serif;background:#0b1220;color:#e2e8f0;margin:0;min-height:100vh;display:grid;place-items:center;padding:2rem}
  main{max-width:36rem;border:1px solid #1e293b;border-radius:12px;padding:1.75rem;background:#111827}
  h1{margin:0 0 0.75rem;font-size:1.25rem;color:#fbbf24}
  p{margin:0.5rem 0;line-height:1.5;color:#cbd5e1}
</style></head><body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p></main></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** GET: serve proposed index.html from the PR head (signed preview token). */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const verified = verifyFieldCardActionToken(token);
  if ("error" in verified) {
    return errorPage(
      "Preview link invalid",
      `This preview link is ${verified.error.replace(/_/g, " ")}.`,
    );
  }
  if (verified.action !== "preview") {
    return errorPage("Wrong link", "Use the Open card preview link from Slack.");
  }

  try {
    const pr = await getPullRequest(verified.repo, verified.pr);
    const sha = pr.head?.sha;
    if (!sha) {
      return errorPage("Preview unavailable", "PR head SHA missing.", 502);
    }
    const html = await getRepoFileText(verified.repo, "index.html", sha);
    const withBanner = injectPreviewBanner(html, verified.pr, pr.html_url);
    return new NextResponse(withBanner, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err) {
    console.error("[field-card/preview]", err);
    const message = err instanceof Error ? err.message : "preview_failed";
    return errorPage("Preview failed", message, 502);
  }
}
