import { NextResponse } from "next/server";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function weeklyWriteErrorHtml(
  title: string,
  message: string,
  hint: string,
  status = 404,
): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; background: #0b1220; color: #e2e8f0; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 2rem; }
    main { max-width: 36rem; border: 1px solid #1e293b; border-radius: 12px; padding: 1.75rem; background: #111827; }
    h1 { margin: 0 0 0.75rem; font-size: 1.25rem; color: #fbbf24; }
    p { margin: 0.5rem 0; line-height: 1.5; color: #cbd5e1; }
    .hint { color: #94a3b8; font-size: 0.95rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #1e293b; }
    code { font-size: 0.85em; background: #1e293b; padding: 0.1em 0.35em; border-radius: 4px; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <p class="hint">${escapeHtml(hint)}</p>
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
