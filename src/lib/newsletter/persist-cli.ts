import {
  hasGithubStorage,
  writeRepoFile,
} from "@/lib/github-storage-core";
import {
  NEWSLETTER_DRAFT_RELATIVE_PATH,
  writeNewsletterDraftFs,
} from "@/lib/newsletter/store";
import type { NewsletterDigest } from "@/lib/newsletter/types";

export async function persistNewsletterDraftCli(
  draft: NewsletterDigest,
  commitMessage?: string,
): Promise<{ viaGithub: boolean }> {
  writeNewsletterDraftFs(draft);

  if (!hasGithubStorage()) {
    return { viaGithub: false };
  }

  const message =
    commitMessage ?? `chore: newsletter draft ${draft.id} [${draft.status}]`;
  const content = `${JSON.stringify(draft, null, 2)}\n`;
  await writeRepoFile(NEWSLETTER_DRAFT_RELATIVE_PATH, content, message);
  return { viaGithub: true };
}
