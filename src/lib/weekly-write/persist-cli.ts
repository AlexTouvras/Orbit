import {
  hasGithubStorage,
  writeRepoFile,
} from "@/lib/github-storage-core";
import { repairDraftTextFields } from "@/lib/weekly-write/text-encoding";
import {
  WEEKLY_DRAFT_RELATIVE_PATH,
  writeWeeklyDraftFs,
} from "@/lib/weekly-write/store";
import type { WeeklyDraft } from "@/lib/weekly-write/types";

/**
 * Persist a pending draft for CLI / GitHub Actions (no `server-only` imports).
 * Always writes local FS; also commits via GitHub API when GITHUB_TOKEN is set
 * so Slack preview links work before the workflow's git push step.
 */
export async function persistWeeklyDraftCli(
  draft: WeeklyDraft,
  commitMessage?: string,
): Promise<{ viaGithub: boolean }> {
  const cleaned = repairDraftTextFields(draft);
  writeWeeklyDraftFs(cleaned);

  if (!hasGithubStorage()) {
    return { viaGithub: false };
  }

  const message =
    commitMessage ??
    `chore: weekly write draft ${cleaned.id} [${cleaned.status}]`;
  const content = `${JSON.stringify(cleaned, null, 2)}\n`;
  await writeRepoFile(WEEKLY_DRAFT_RELATIVE_PATH, content, message);
  return { viaGithub: true };
}
