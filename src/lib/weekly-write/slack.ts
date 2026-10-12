import type { WeeklyDraft } from "@/lib/weekly-write/types";
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

/** Prefer `#orbit` webhook; fall back to legacy CareerOps webhook. */
function weeklyWriteWebhookUrl(): string | undefined {
  return (
    process.env.SLACK_ORBIT_WEBHOOK_URL?.trim() ||
    process.env.SLACK_WEBHOOK_URL?.trim()
  );
}

/** Slack card for a pending draft: title, summary, and preview. The essay stays on the preview page. */
export function buildWeeklyDraftSlackMessage(
  draft: WeeklyDraft,
  options?: {
    /** When false, warn that preview will not load until the draft is on the default branch. */
    githubSynced?: boolean;
    /** Origin embedded in the after-publish path. */
    linkOrigin?: string;
  },
): { text: string; blocks: Record<string, unknown>[] } {
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

  const text = `Orbit weekly Write ready: ${draft.title}`;

  /** Preview is how the essay is read. Approve and Skip stay on the same row. */
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
        text: `*${draft.title}*\n${draft.summary}\n\n_Source:_ ${draft.source} · _~${wordCount} words_ · _Week of_ ${draft.weekOf}\n_Inspired by:_ ${inspiration}`,
      },
    },
    actionButtons("weekly_write_actions_top", "top"),
  ];

  if (options?.githubSynced === false) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":warning: *Open preview will not load this draft* until it is on the GitHub default branch.",
      },
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `*Open preview* has the essay. *Approve* opens a confirm page (won't publish on tap alone). After publish: \`${site}/writes/${draft.slug}\``,
      },
    ],
  });

  return { text, blocks };
}

export async function sendWeeklyDraftSlack(
  draft: WeeklyDraft,
  options?: {
    /** When false, warn that preview will not load until the draft is on the default branch. */
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

  const { text, blocks } = buildWeeklyDraftSlackMessage(draft, options);
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
