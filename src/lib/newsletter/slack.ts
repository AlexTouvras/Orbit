import type { NewsletterDigest } from "@/lib/newsletter/types";

function weeklyWriteWebhookUrl(): string | undefined {
  return (
    process.env.SLACK_ORBIT_WEBHOOK_URL?.trim() ||
    process.env.SLACK_WEBHOOK_URL?.trim()
  );
}

async function postSlackText(
  text: string,
  blocks: Record<string, unknown>[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const url = weeklyWriteWebhookUrl();
  if (!url) {
    return {
      ok: false,
      reason: "SLACK_ORBIT_WEBHOOK_URL (or SLACK_WEBHOOK_URL) not configured",
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

function digestSummary(draft: NewsletterDigest): string {
  const writes =
    draft.writes.length > 0
      ? draft.writes.map((w) => `• ${w.title}`).join("\n")
      : "• (no Writes this window)";
  const signals = draft.signals
    .map((s) => `• [${s.category}] ${s.title} — ${s.source}`)
    .join("\n");
  const ravensList = draft.ravens ?? [];
  const ravens =
    ravensList.length > 0
      ? ravensList
          .map((item) => `• [${item.domain}] ${item.title}`)
          .join("\n")
      : "• (none this window)";
  const body = `*Writes*\n${writes}\n\n*Signals*\n${signals}\n\n*From the ravens*\n${ravens}`;
  if (body.length <= 2800) return body;
  const counts = new Map<string, number>();
  for (const item of ravensList) {
    counts.set(item.domain, (counts.get(item.domain) ?? 0) + 1);
  }
  const countLine =
    ravensList.length > 0
      ? [...counts.entries()]
          .map(([domain, n]) => `${domain} ${n}`)
          .join(", ")
      : "none";
  return `*Writes*\n${writes}\n\n*Signals*\n${signals}\n\n*From the ravens:* ${ravensList.length} (${countLine})`;
}

/** FYI after auto-send. Not an Approve gate. */
export async function notifyNewsletterSent(
  draft: NewsletterDigest,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const mode =
    draft.sendMode === "test"
      ? `Test send to \`${draft.sentTo ?? "TEST_TO"}\` only`
      : "Broadcast to Resend audience";
  return postSlackText(`Sent weekly digest: ${draft.subject}`, [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Orbit — weekly digest sent",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${draft.subject}*\n${draft.lede}\n\n_${mode}_ · week of ${draft.weekOf}`,
      },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: digestSummary(draft) },
    },
  ]);
}

export async function notifyNewsletterSkipped(
  draft: NewsletterDigest,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  return postSlackText(`Skipped weekly digest: ${draft.subject}`, [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Skipped:* ${draft.subject}\nNext Tuesday's cron can draft a new one.`,
      },
    },
  ]);
}

/** Fail-closed ping when assemble/send dies — so silence is never the only signal. */
export async function notifyNewsletterFailed(options: {
  reason: string;
  draftId?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const id = options.draftId ? `\`${options.draftId}\`` : "_(no draft)_";
  return postSlackText(`Weekly digest failed: ${options.reason}`, [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Orbit — weekly digest FAILED",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Reason:* ${options.reason}\n*Draft:* ${id}\n\nPrimary path is GitHub Actions → *Weekly newsletter digest*. Re-run with force if needed.`,
      },
    },
  ]);
}
