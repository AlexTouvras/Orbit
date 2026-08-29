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

export type WeeklyDraftLoadIssue =
  | "github_unconfigured"
  | "github_missing_file"
  | "id_mismatch";

/** Read draft — GitHub first when configured (Vercel Approve before redeploy). */
export async function readWeeklyDraft(): Promise<WeeklyDraft | null> {
  if (process.env.VERCEL && !hasGithubStorage()) {
    console.error(
      "[weekly-write] GITHUB_TOKEN missing on Vercel — cannot load gitignored data/weekly-write-draft.json",
    );
    return null;
  }

  if (hasGithubStorage()) {
    const remote = await readRepoFile(WEEKLY_DRAFT_RELATIVE_PATH);
    if (remote) {
      const parsed = parseWeeklyDraftJson(remote);
      if (parsed) return parsed;
    }
  }
  return readWeeklyDraftFs();
}

/** Load draft for a signed Approve/Preview token with actionable errors. */
export async function resolveWeeklyDraftForToken(
  draftId: string,
): Promise<
  | { ok: true; draft: WeeklyDraft }
  | {
      ok: false;
      issue: WeeklyDraftLoadIssue;
      hint: string;
      current?: WeeklyDraft | null;
    }
> {
  if (process.env.VERCEL && !hasGithubStorage()) {
    return {
      ok: false,
      issue: "github_unconfigured",
      hint:
        "Set GITHUB_TOKEN on Vercel (Contents: Read and write on AlexTouvras/Orbit). The pending draft is stored via the GitHub API — it is gitignored and not bundled in the deploy.",
    };
  }

  const draft = await readWeeklyDraft();
  if (!draft) {
    return {
      ok: false,
      issue: "github_missing_file",
      hint:
        "The pending draft is not on the GitHub default branch. Re-run npm run weekly:notify-draft with GITHUB_TOKEN set (confirm githubSynced: true) before using Approve/Preview links.",
    };
  }

  if (draft.id !== draftId) {
    return {
      ok: false,
      issue: "id_mismatch",
      hint: `This link is for draft ${draftId}, but GitHub currently has ${draft.id}. Open the newest Slack message or re-run npm run weekly:notify-draft.`,
      current: draft,
    };
  }

  return { ok: true, draft };
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
