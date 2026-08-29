import "server-only";
import { digestIdFor } from "@/lib/newsletter/digest";
import { dateFromYmd, mondayOfIsoWeek } from "@/lib/iso-week";
import { readNewsletterDraft } from "@/lib/newsletter/store-remote";
import type { NewsletterDigest } from "@/lib/newsletter/types";
import type { WeekLane } from "@/lib/week-log/types";

export async function loadNewsletterWeek(
  weekId: string,
): Promise<WeekLane<NewsletterDigest>> {
  const draft = await readNewsletterDraft();
  if (!draft) {
    return {
      status: "empty",
      detail: `No newsletter draft on disk or GitHub for ${weekId}.`,
      data: null,
    };
  }

  const monday = mondayOfIsoWeek(weekId);
  const expectedId = monday
    ? digestIdFor(dateFromYmd(monday))
    : `newsletter-${weekId}`;
  const matches =
    draft.id === expectedId ||
    draft.id === `newsletter-${weekId}` ||
    draft.weekOf === monday;

  if (!matches) {
    return {
      status: "empty",
      detail: `Latest draft is ${draft.id}, not ${weekId}.`,
      source: "data/newsletter-draft.json",
      data: null,
    };
  }

  return {
    status: "ok",
    source: "data/newsletter-draft.json",
    data: draft,
  };
}
