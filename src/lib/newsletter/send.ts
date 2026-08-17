import "server-only";
import { deliverDigest } from "@/lib/newsletter/deliver";
import { writeNewsletterDraft } from "@/lib/newsletter/store-remote";
import type { NewsletterDigest } from "@/lib/newsletter/types";

export async function sendNewsletterDigest(
  draft: NewsletterDigest,
): Promise<{ draft: NewsletterDigest; broadcastId?: string }> {
  if (draft.status !== "pending") {
    throw new Error(`Digest is ${draft.status}, not pending`);
  }

  const sent = await deliverDigest(draft);
  if (!sent.ok) {
    throw new Error(sent.reason);
  }

  const updated: NewsletterDigest = {
    ...draft,
    status: "sent",
    sentAt: new Date().toISOString(),
    broadcastId: sent.id,
    sendMode: sent.mode,
    sentTo: sent.sentTo,
  };
  await writeNewsletterDraft(updated, `chore: newsletter ${draft.id} sent`);
  return { draft: updated, broadcastId: sent.id };
}

export async function skipNewsletterDigest(
  draft: NewsletterDigest,
): Promise<NewsletterDigest> {
  if (draft.status !== "pending") {
    throw new Error(`Digest is ${draft.status}, not pending`);
  }
  const updated: NewsletterDigest = {
    ...draft,
    status: "skipped",
    skippedAt: new Date().toISOString(),
  };
  await writeNewsletterDraft(
    updated,
    `chore: newsletter ${draft.id} skipped`,
  );
  return updated;
}
