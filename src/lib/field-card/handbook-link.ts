/**
 * The analytics field card is copied from its source repo on Approve.
 * That HTML does not know this site's handbook. Re-insert the one chapter
 * link on the kill line unless the sheet already carries it.
 */

const PAGE = "/handbooks/data-that-drives-decisions/1";

export function ensureAnalyticsHandbookLink(html: string): string {
  if (html.includes(PAGE)) return html;
  const pattern = /<p class="kill">([\s\S]*?)<\/p>/;
  const match = pattern.exec(html);
  if (!match || match[1].includes("<a")) return html;
  const linked = `<p class="kill"><a href="${PAGE}">${match[1]}</a></p>`;
  return html.replace(pattern, linked);
}
