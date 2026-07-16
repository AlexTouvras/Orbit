import type { WeeklyDraft } from "@/lib/weekly-write/types";
import { uploadWeeklyDraftMarkdown } from "@/lib/weekly-write/slack-file";
import { weeklyActionUrl } from "@/lib/weekly-write/tokens";

/** Strip frontmatter; return essay markdown body. */
export function essayBodyMarkdown(draft: WeeklyDraft): string {
  let body = draft.mdx || "";
  if (body.startsWith("---")) {
    const end = body.indexOf("---", 3);
    if (end >= 0) body = body.slice(end + 3).trim();
  }
  body = body.replace(/\r\n/g, "\n").trim();
  return body || draft.preview || draft.summary || "";
}

/** Split long text into Slack-safe chunks (section text limit ≈ 3000). */
export function splitForSlackSections(
  text: string,
  maxChars = 2800,
): string[] {
  if (text.length <= maxChars) return [text];

  const parts: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      parts.push(remaining);
      break;
    }
    let cut = remaining.lastIndexOf("\n\n", maxChars);
    if (cut < maxChars * 0.4) cut = remaining.lastIndexOf("\n", maxChars);
    if (cut < maxChars * 0.4) cut = maxChars;
    parts.push(remaining.slice(0, cut).trimEnd());
    remaining = remaining.slice(cut).trimStart();
  }
  return parts;
}

export async function sendWeeklyDraftSlack(
  draft: WeeklyDraft,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const url = process.env.SLACK_WEBHOOK_URL?.trim();
  if (!url) {
    return { ok: false, reason: "SLACK_WEBHOOK_URL not configured" };
  }

  const approve = weeklyActionUrl(draft.id, "approve");
  const skip = weeklyActionUrl(draft.id, "skip");
  const preview = weeklyActionUrl(draft.id, "preview");
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://orbit";

  const body = essayBodyMarkdown(draft);
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const inspiration =
    draft.intake.signals.find((s) =>
      body.includes(s.title.slice(0, 40)),
    )?.title ||
    draft.intake.signals[0]?.title ||
    "Signals + projects";

  // Prefer attaching the full essay as .md (needs bot token).
  const fileUpload = await uploadWeeklyDraftMarkdown(draft);
  const attachedMd = fileUpload.ok;

  const text = `Orbit weekly Write ready: ${draft.title}`;

  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Orbit — weekly Write draft",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${draft.title}*\n${draft.summary}\n\n_Source:_ ${draft.source} · _~${wordCount} words_ · _Week of_ ${draft.weekOf}\n_Inspired by:_ ${inspiration}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${preview}|Open browser preview (full essay)>*`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: attachedMd
          ? `Also attached as *\`${draft.slug}.md\`*.  ·  *<${approve}|Approve & publish>*  ·  *<${skip}|Skip>*`
          : `*<${approve}|Approve & publish>*  ·  *<${skip}|Skip>*`,
      },
    },
  ];

  // Short teaser only — full read is via browser preview (best on mobile).
  const teaser = body.slice(0, 500).trimEnd();
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Teaser*\n\`\`\`${teaser}${body.length > 500 ? "…" : ""}\`\`\``,
    },
  });

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: attachedMd
          ? `Browser preview = full essay. *Approve* opens a confirm page (won't publish on tap alone). After publish: \`${site}/writes/${draft.slug}\``
          : `Tap *Open browser preview* for the full essay. *Approve* opens a confirm page first. After publish: \`${site}/writes/${draft.slug}\``,
      },
    ],
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, blocks }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return {
      ok: false,
      reason: `Slack webhook failed (${res.status}): ${errText || res.statusText}`,
    };
  }

  return { ok: true };
}

async function postSlackText(
  text: string,
  blocks: Record<string, unknown>[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const url = process.env.SLACK_WEBHOOK_URL?.trim();
  if (!url) {
    return { ok: false, reason: "SLACK_WEBHOOK_URL not configured" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, blocks }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return {
      ok: false,
      reason: `Slack webhook failed (${res.status}): ${errText || res.statusText}`,
    };
  }

  return { ok: true };
}

/** Notify #career-ops after a successful Approve publish. */
export async function notifyPublished(
  draft: WeeklyDraft,
  slug: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || siteBaseUrlFallback();
  const href = `${site}/writes/${slug}`;
  return postSlackText(`Published weekly Write: ${draft.title}`, [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Published:* <${href}|${draft.title}>\nLive after the next Vercel deploy · \`/writes/${slug}\``,
      },
    },
  ]);
}

/** Notify #career-ops after Skip. */
export async function notifySkipped(
  draft: WeeklyDraft,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  return postSlackText(`Skipped weekly Write: ${draft.title}`, [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Skipped:* ${draft.title}\nNext Monday's cron can draft a new one.`,
      },
    },
  ]);
}

function siteBaseUrlFallback(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "https://orbit-rho-rouge.vercel.app";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  return `https://${raw.replace(/\/$/, "")}`;
}
