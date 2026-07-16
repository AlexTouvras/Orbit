import "server-only";
import { hasGithubStorage, readRepoFile } from "@/lib/github-storage";
import { persistDataJson } from "@/lib/data-persist";
import {
  parseWeeklyDraftJson,
  readWeeklyDraftFs,
  WEEKLY_DRAFT_RELATIVE_PATH,
  writeWeeklyDraftFs,
} from "@/lib/weekly-write/store";
import type { WeeklyDraft } from "@/lib/weekly-write/types";

/** Read draft — GitHub first when configured (Vercel Approve before redeploy). */
export async function readWeeklyDraft(): Promise<WeeklyDraft | null> {
  if (hasGithubStorage()) {
    const remote = await readRepoFile(WEEKLY_DRAFT_RELATIVE_PATH);
    if (remote) {
      const parsed = parseWeeklyDraftJson(remote);
      if (parsed) return parsed;
    }
  }
  return readWeeklyDraftFs();
}

/** Persist draft JSON via GitHub on Vercel, else local FS. */
export async function writeWeeklyDraft(
  draft: WeeklyDraft,
  commitMessage?: string,
): Promise<{ viaGithub: boolean }> {
  const message =
    commitMessage ?? `chore: weekly write draft ${draft.id} [${draft.status}]`;

  if (process.env.VERCEL || hasGithubStorage()) {
    return persistDataJson(WEEKLY_DRAFT_RELATIVE_PATH, draft, message);
  }

  writeWeeklyDraftFs(draft);
  return { viaGithub: false };
}
