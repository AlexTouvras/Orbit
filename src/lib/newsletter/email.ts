import { getSiteUrl } from "@/lib/site";
import { groupRavensByDomain } from "@/lib/newsletter/ravens";
import type { NewsletterDigest, NewsletterRavenItem } from "@/lib/newsletter/types";

const RAVEN_KIND_LABEL: Record<NewsletterRavenItem["kind"], string> = {
  knowledge: "Guidance",
  signal: "Watching",
  inbox: "Finding",
};

function ravenTitleHtml(item: NewsletterRavenItem): string {
  const title = escapeHtml(item.title);
  if (!item.href) return title;
  return `<a href="${escapeAttr(item.href)}" style="color:#0f172a;text-decoration:none">${title}</a>`;
}

function renderRavensHtml(items: NewsletterRavenItem[]): string {
  if (items.length === 0) return "";
  const groups = groupRavensByDomain(items)
    .map((group) => {
      const rows = group.items
        .map(
          (item) => `
        <tr>
          <td style="padding:0 0 14px">
            <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0d9488">${escapeHtml(RAVEN_KIND_LABEL[item.kind])}${item.priority ? ` · ${escapeHtml(item.priority)}` : ""}</p>
            <p style="margin:0 0 4px;font-size:15px;line-height:1.35;font-weight:600">${ravenTitleHtml(item)}</p>
            ${
              item.summary
                ? `<p style="margin:0;font-size:13px;line-height:1.5;color:#475569">${escapeHtml(item.summary)}</p>`
                : ""
            }
          </td>
        </tr>`,
        )
        .join("");
      return `
        <tr>
          <td style="padding:12px 0 4px">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#334155">${escapeHtml(group.label)}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          </td>
        </tr>`;
    })
    .join("");

  return `
          <tr>
            <td style="padding-top:8px">
              <p style="margin:0 0 12px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b">From the ravens</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${groups}</table>
            </td>
          </tr>`;
}

function renderRavensText(items: NewsletterRavenItem[]): string {
  if (items.length === 0) return "";
  const body = groupRavensByDomain(items)
    .map((group) => {
      const lines = group.items
        .map((item) => {
          const link = item.href ? `\n  ${item.href}` : "";
          return `- [${RAVEN_KIND_LABEL[item.kind]}] ${item.title}\n  ${item.summary}${link}`;
        })
        .join("\n\n");
      return `${group.label}\n${lines}`;
    })
    .join("\n\n");
  return `From the ravens

${body}

`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

/** Light, table-based HTML for inboxes. Includes Resend's unsubscribe placeholder unless overridden. */
export function renderDigestHtml(
  digest: NewsletterDigest,
  options?: { unsubscribeUrl?: string; testBanner?: boolean },
): string {
  const site = getSiteUrl();
  const unsub = options?.unsubscribeUrl ?? "{{{RESEND_UNSUBSCRIBE_URL}}}";
  const testBanner = options?.testBanner
    ? `<tr><td style="padding:0 0 16px;font-size:13px;color:#92400e;background:#fffbeb;border-radius:8px;padding:12px">Test send — only this inbox received it. Public subscribers are not mailed while RESEND_NEWSLETTER_TEST_TO is set.</td></tr>`
    : "";
  const writes =
    digest.writes.length > 0
      ? digest.writes
          .map(
            (w) => `
      <tr>
        <td style="padding:0 0 20px">
          <p style="margin:0 0 4px;font-size:17px;line-height:1.35;font-weight:600">
            <a href="${escapeAttr(w.href)}" style="color:#0f172a;text-decoration:none">${escapeHtml(w.title)}</a>
          </p>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#475569">${escapeHtml(w.summary)}</p>
          <p style="margin:0;font-size:13px">
            <a href="${escapeAttr(w.href)}" style="color:#0d9488;text-decoration:none">Read the Write →</a>
          </p>
        </td>
      </tr>`,
          )
          .join("")
      : `<tr><td style="padding:0 0 20px;font-size:14px;color:#64748b">No new Writes this week — signals only.</td></tr>`;

  const signals = digest.signals
    .map(
      (s) => `
      <tr>
        <td style="padding:0 0 16px">
          <p style="margin:0 0 2px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0d9488">${escapeHtml(s.category)} · ${escapeHtml(s.source)}</p>
          <p style="margin:0 0 4px;font-size:15px;line-height:1.35;font-weight:600">
            <a href="${escapeAttr(s.link)}" style="color:#0f172a;text-decoration:none">${escapeHtml(s.title)}</a>
          </p>
          ${
            s.snippet
              ? `<p style="margin:0;font-size:13px;line-height:1.5;color:#475569">${escapeHtml(s.snippet)}</p>`
              : ""
          }
        </td>
      </tr>`,
    )
    .join("");

  const ravensHtml = renderRavensHtml(digest.ravens ?? []);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(digest.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;color:#0f172a;font-family:Georgia, 'Times New Roman', serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;padding:32px 28px">
          ${testBanner}
          <tr>
            <td style="padding-bottom:20px;border-bottom:1px solid #e2e8f0">
              <p style="margin:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;letter-spacing:0.22em;color:#0d9488">ORBIT.</p>
              <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3">${escapeHtml(digest.subject)}</h1>
              <p style="margin:10px 0 0;font-size:15px;line-height:1.55;color:#475569">${escapeHtml(digest.lede)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px">
              <p style="margin:0 0 12px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b">This week's Writes</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${writes}</table>
            </td>
          </tr>
          <tr>
            <td style="padding-top:8px">
              <p style="margin:0 0 12px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b">Signals</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${signals}</table>
            </td>
          </tr>
          ${ravensHtml}
          <tr>
            <td style="padding-top:16px;border-top:1px solid #e2e8f0">
              <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#64748b">
                You're getting this because you subscribed at
                <a href="${escapeAttr(`${site}/newsletter`)}" style="color:#0d9488">${escapeHtml(site.replace(/^https?:\/\//, ""))}/newsletter</a>.
              </p>
              <p style="margin:0;font-size:12px;color:#64748b">
                <a href="${escapeAttr(site)}" style="color:#0d9488">Visit Orbit</a>
                · <a href="${escapeAttr(unsub)}" style="color:#0d9488">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderDigestText(
  digest: NewsletterDigest,
  options?: { unsubscribeUrl?: string; testBanner?: boolean },
): string {
  const site = getSiteUrl();
  const unsub = options?.unsubscribeUrl ?? "{{{RESEND_UNSUBSCRIBE_URL}}}";
  const banner = options?.testBanner
    ? "TEST SEND — only this inbox received it. Public subscribers are not mailed while RESEND_NEWSLETTER_TEST_TO is set.\n\n"
    : "";
  const writes =
    digest.writes.length > 0
      ? digest.writes
          .map((w) => `- ${w.title}\n  ${w.summary}\n  ${w.href}`)
          .join("\n\n")
      : "No new Writes this week — signals only.";
  const signals = digest.signals
    .map(
      (s) =>
        `- [${s.category}] ${s.title} (${s.source})\n  ${s.snippet ? `${s.snippet}\n  ` : ""}${s.link}`,
    )
    .join("\n\n");
  const ravens = renderRavensText(digest.ravens ?? []);

  return `${banner}${digest.subject}

${digest.lede}

This week's Writes
${writes}

Signals
${signals}

${ravens}—
You're getting this because you subscribed at ${site}/newsletter
Visit: ${site}
Unsubscribe: ${unsub}`;
}
