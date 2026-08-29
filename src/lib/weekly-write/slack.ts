import type { WeeklyDraft } from "@/lib/weekly-write/types";
import { uploadWeeklyDraftMarkdown } from "@/lib/weekly-write/slack-file";
import { WEEKLY_WRITE_PRODUCTION_ORIGIN } from "@/lib/weekly-write/link-origin";
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

/** Prefer `#orbit` webhook; fall back to legacy CareerOps webhook. */
function weeklyWriteWebhookUrl(): string | undefined {
  return (
    process.env.SLACK_ORBIT_WEBHOOK_URL?.trim() ||
    process.env.SLACK_WEBHOOK_URL?.trim()
  );
}

export async function sendWeeklyDraftSlack(
  draft: WeeklyDraft,
  options?: {
    /** When false, warn that preview/Approve links may 404 until draft is on default branch. */
    githubSynced?: boolean;
    /** Origin embedded in Approve/Preview links (from assertWeeklyWriteSlackLinksReady). */
    linkOrigin?: string;
  },
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const url = weeklyWriteWebhookUrl();
  if (!url) {
    return {
      ok: false,
      reason:
        "SLACK_ORBIT_WEBHOOK_URL (or SLACK_WEBHOOK_URL) not configured",
    };
  }

  const approve = weeklyActionUrl(draft.id, "approve");
  const skip = weeklyActionUrl(draft.id, "skip");
  const preview = weeklyActionUrl(draft.id, "preview");
  const site =
    options?.linkOrigin?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, "") ||
    WEEKLY_WRITE_PRODUCTION_ORIGIN;

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

  /** Real Slack buttons (url) — much more tappable than mrkdwn links in a long message. */
  const actionButtons = (
    blockId: string,
    idSuffix: string,
  ): Record<string, unknown> => ({
    type: "actions",
    block_id: blockId,
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "Open preview", emoji: true },
        url: preview,
        action_id: `weekly_write_preview_${idSuffix}`,
      },
      {
        type: "button",
        text: { type: "plain_text", text: "Approve & publish", emoji: true },
        style: "primary",
        url: approve,
        action_id: `weekly_write_approve_${idSuffix}`,
      },
      {
        type: "button",
        text: { type: "plain_text", text: "Skip", emoji: true },
        url: skip,
        action_id: `weekly_write_skip_${idSuffix}`,
      },
    ],
  });

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
        text: `*${draft.title}*\n${draft.summary}\n\n_Source:_ ${draft.source} · _~${wordCount} words_ · _Week of_ ${draft.weekOf}\n_Inspired by:_ ${inspiration}${
          attachedMd ? `\n_Also attached as_ \`${draft.slug}.md\`` : ""
        }`,
      },
    },
    actionButtons("weekly_write_actions_top", "top"),
  ];

  if (options?.githubSynced === false) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":warning: *Preview/Approve links may fail* — pending draft was not synced to the GitHub default branch. Full essay is still below in this message.",
      },
    });
  }

  // Full essay in-channel (Slack section limit ≈ 3000). Do not rely on
  // browser preview alone — preview 404s when the pending draft is only on a
  // feature branch and not yet on the default branch GitHub storage reads.
  const parts = splitForSlackSections(body, 2800);
  parts.forEach((part, i) => {
    const label =
      parts.length === 1
        ? "*Full draft*"
        : `*Full draft (${i + 1}/${parts.length})*`;
    // Avoid breaking the fence if the essay contains triple backticks.
    const safe = part.replace(/```/g, "'''");
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        // Code fence keeps markdown readable and avoids mrkdwn eating links.
        text: `${label}\n\`\`\`${safe}\`\`\``,
      },
    });
  });

  // Repeat buttons after the essay so you don't scroll back to the top on mobile.
  blocks.push(actionButtons("weekly_write_actions_bottom", "bottom"));

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Full draft is in this message${attachedMd ? " and the attached .md" : ""}. *Approve* opens a confirm page (won't publish on tap alone). Preview has a fixed bottom Approve bar. After publish: \`${site}/writes/${draft.slug}\``,
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
  const url = weeklyWriteWebhookUrl();
  if (!url) {
    return {
      ok: false,
      reason:
        "SLACK_ORBIT_WEBHOOK_URL (or SLACK_WEBHOOK_URL) not configured",
    };
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

const FEEDBACK_RATING_LABEL: Record<string, string> = {
  yes: "Useful",
  somewhat: "Somewhat",
  no: "Not useful",
};

export async function notifyEssayFeedback(input: {
  slug: string;
  title: string;
  rating: "yes" | "somewhat" | "no";
  note?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const url = process.env.SLACK_ORBIT_WEBHOOK_URL?.trim();
  if (!url) {
    return { ok: false, reason: "SLACK_ORBIT_WEBHOOK_URL not configured" };
  }

  const site = siteBaseUrlFallback();
  const href = `${site}/writes/${input.slug}`;
  const note = input.note?.trim();
  const ratingLabel = FEEDBACK_RATING_LABEL[input.rating] ?? input.rating;

  const text = `Orbit feedback: ${input.title}`;
  const blocks: Record<string, unknown>[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*New essay feedback* on <${href}|${input.title}>\n*Rating:* ${ratingLabel}`,
      },
    },
    ...(note
      ? [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Message*\n>${note.replace(/\n+/g, "\n> ")}`,
            },
          },
        ]
      : []),
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Essay: \`${input.slug}\``,
        },
      ],
    },
  ];

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

/** Notify #orbit after a successful Approve publish. */
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

/** Notify #orbit after Skip. */
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
    "https://alextouvras.com";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/$/, "");
  }
  return `https://${raw.replace(/\/$/, "")}`;
}
