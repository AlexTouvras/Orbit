import { getEditableProfile } from "@/lib/profile-store";
import { getSiteUrl } from "@/lib/site";
import { getAllWrites } from "@/lib/writes";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const base = getSiteUrl();
  const profile = getEditableProfile();
  const writes = getAllWrites();
  const latest = writes[0]?.date
    ? new Date(writes[0].date).toUTCString()
    : new Date().toUTCString();

  const items = writes
    .map((write) => {
      const link = `${base}/writes/${write.slug}`;
      const pubDate = new Date(write.date).toUTCString();
      return `    <item>
      <title>${escapeXml(write.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(write.summary)}</description>
      <category>${escapeXml(write.category)}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${profile.name} — Blog`)}</title>
    <link>${escapeXml(`${base}/writes`)}</link>
    <description>${escapeXml(profile.tagline)}</description>
    <language>en</language>
    <lastBuildDate>${latest}</lastBuildDate>
    <atom:link href="${escapeXml(`${base}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
