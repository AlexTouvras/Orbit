import "server-only";
import { hasGithubStorage, readRepoFile } from "@/lib/github-storage";
import { persistDataJson } from "@/lib/data-persist";
import {
  NEWSLETTER_DRAFT_RELATIVE_PATH,
  parseNewsletterDraftJson,
  readNewsletterDraftFs,
  writeNewsletterDraftFs,
} from "@/lib/newsletter/store";
import type { NewsletterDigest } from "@/lib/newsletter/types";

export async function readNewsletterDraft(): Promise<NewsletterDigest | null> {
  if (hasGithubStorage()) {
    const remote = await readRepoFile(NEWSLETTER_DRAFT_RELATIVE_PATH);
    if (remote) {
      const parsed = parseNewsletterDraftJson(remote);
      if (parsed) return parsed;
    }
  }
  return readNewsletterDraftFs();
}

export async function writeNewsletterDraft(
  draft: NewsletterDigest,
  commitMessage?: string,
): Promise<{ viaGithub: boolean }> {
  const message =
    commitMessage ?? `chore: newsletter draft ${draft.id} [${draft.status}]`;

  if (process.env.VERCEL || hasGithubStorage()) {
    return persistDataJson(NEWSLETTER_DRAFT_RELATIVE_PATH, draft, message);
  }

  writeNewsletterDraftFs(draft);
  return { viaGithub: false };
}
