import { buildNewsletterDigest, digestIdFor } from "@/lib/newsletter/digest";
import { deliverDigest } from "@/lib/newsletter/deliver";
import { persistNewsletterDraftCli } from "@/lib/newsletter/persist-cli";
import { notifyNewsletterSent } from "@/lib/newsletter/slack";
import { readNewsletterDraftFs } from "@/lib/newsletter/store";
import type { NewsletterDigest } from "@/lib/newsletter/types";

export interface RunNewsletterResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  draftId?: string;
  slack?: boolean;
  githubSynced?: boolean;
  sent?: boolean;
  sendMode?: "test" | "broadcast";
  sentTo?: string;
  draft?: NewsletterDigest;
}

export async function runNewsletterPipeline(options?: {
  force?: boolean;
  /** Persist + send. Default true. */
  send?: boolean;
  /** Slack FYI after a successful send. Default follows `send`. */
  notify?: boolean;
  existingDraft?: NewsletterDigest | null;
}): Promise<RunNewsletterResult> {
  const send = options?.send !== false;
  const notify = options?.notify ?? send;
  const existing =
    options?.existingDraft !== undefined
      ? options.existingDraft
      : readNewsletterDraftFs();

  const thisWeekId = digestIdFor();

  if (
    existing?.status === "sent" &&
    existing.id === thisWeekId &&
    !options?.force
  ) {
    return {
      ok: true,
      skipped: true,
      reason: "already_sent_this_week",
      draftId: existing.id,
      draft: existing,
    };
  }

  let draft: NewsletterDigest;
  const reusePending =
    existing?.status === "pending" &&
    existing.id === thisWeekId &&
    !options?.force &&
    Array.isArray(existing.ravens);
  if (reusePending && existing) {
    draft = existing;
  } else {
    const built = await buildNewsletterDigest();
    if (!built) {
      return {
        ok: true,
        skipped: true,
        reason: "nothing_new",
      };
    }
    draft = built;
    const persisted = await persistNewsletterDraftCli(
      draft,
      `chore: newsletter draft ${draft.id} [${draft.status}]`,
    );
    if (!persisted.viaGithub) {
      console.warn(
        "[newsletter] Draft saved locally only (GITHUB_TOKEN unset).",
      );
    }
  }

  if (!send) {
    return {
      ok: true,
      draftId: draft.id,
      githubSynced: false,
      sent: false,
      draft,
    };
  }

  const delivered = await deliverDigest(draft);
  if (!delivered.ok) {
    return {
      ok: false,
      reason: delivered.reason,
      draftId: draft.id,
      sent: false,
      draft,
    };
  }

  const updated: NewsletterDigest = {
    ...draft,
    status: "sent",
    sentAt: new Date().toISOString(),
    broadcastId: delivered.id,
    sendMode: delivered.mode,
    sentTo: delivered.sentTo,
  };
  const persisted = await persistNewsletterDraftCli(
    updated,
    `chore: newsletter ${updated.id} sent`,
  );

  let slackOk = false;
  if (notify) {
    const slack = await notifyNewsletterSent(updated);
    slackOk = slack.ok;
    if (!slack.ok) {
      console.warn("[newsletter] Slack FYI failed:", slack.reason);
    }
  }

  return {
    ok: true,
    draftId: updated.id,
    slack: slackOk,
    githubSynced: persisted.viaGithub,
    sent: true,
    sendMode: delivered.mode,
    sentTo: delivered.sentTo,
    draft: updated,
  };
}
