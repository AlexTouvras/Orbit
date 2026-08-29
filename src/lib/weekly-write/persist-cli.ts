import {
  hasGithubStorage,
  readRepoFile,
  writeRepoFile,
} from "@/lib/github-storage-core";
import { repairDraftTextFields } from "@/lib/weekly-write/text-encoding";
import {
  parseWeeklyDraftJson,
  WEEKLY_DRAFT_RELATIVE_PATH,
  writeWeeklyDraftFs,
} from "@/lib/weekly-write/store";
import type { WeeklyDraft } from "@/lib/weekly-write/types";

export interface PersistWeeklyDraftResult {
  viaGithub: boolean;
  /** Read-back from GitHub default branch matched id + pending status. */
  verified: boolean;
}

/**
 * Persist a pending draft for CLI / GitHub Actions (no `server-only` imports).
 * Always writes local FS; also commits via GitHub API when GITHUB_TOKEN is set
 * so Slack preview links work before the workflow's git push step.
 */
export async function persistWeeklyDraftCli(
  draft: WeeklyDraft,
  commitMessage?: string,
): Promise<PersistWeeklyDraftResult> {
  const cleaned = repairDraftTextFields(draft);
  writeWeeklyDraftFs(cleaned);

  if (!hasGithubStorage()) {
    return { viaGithub: false, verified: false };
  }

  const message =
    commitMessage ??
    `chore: weekly write draft ${cleaned.id} [${cleaned.status}]`;
  const content = `${JSON.stringify(cleaned, null, 2)}\n`;
  await writeRepoFile(WEEKLY_DRAFT_RELATIVE_PATH, content, message);

  const remote = await readRepoFile(WEEKLY_DRAFT_RELATIVE_PATH);
  const parsed = remote ? parseWeeklyDraftJson(remote) : null;
  const verified =
    parsed?.id === cleaned.id &&
    parsed.status === cleaned.status &&
    Boolean(parsed.mdx?.trim());

  return { viaGithub: true, verified };
}
