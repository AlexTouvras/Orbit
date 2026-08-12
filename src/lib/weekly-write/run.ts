import { createWeeklyDraft } from "@/lib/weekly-write/draft";
import { buildWeeklyIntake } from "@/lib/weekly-write/intake";
import {
  appendWeeklyWriteLog,
  clearIdeBrief,
  writeIdeBrief,
} from "@/lib/weekly-write/ide-brief";
import { sendWeeklyDraftSlack } from "@/lib/weekly-write/slack";
import { persistWeeklyDraftCli } from "@/lib/weekly-write/persist-cli";
import { readWeeklyDraftFs } from "@/lib/weekly-write/store";
import type { WeeklyDraft } from "@/lib/weekly-write/types";

export interface RunWeeklyWriteResult {
  ok: boolean;
  skipped?: boolean;
  awaitingIde?: boolean;
  reason?: string;
  draftId?: string;
  slug?: string;
  source?: WeeklyDraft["source"];
  slack?: boolean;
  /** Pending draft committed to GitHub default branch (required for preview/Approve). */
  githubSynced?: boolean;
  briefPath?: string;
  draft?: WeeklyDraft;
}

async function notifyDraft(
  draft: WeeklyDraft,
  options?: { githubSynced?: boolean },
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const slack = await sendWeeklyDraftSlack(draft, {
    githubSynced: options?.githubSynced,
  });
  if (!slack.ok) return { ok: false, reason: slack.reason };
  appendWeeklyWriteLog(
    `Slack notify sent for ${draft.id} (${draft.source}): ${draft.title}${
      options?.githubSynced === false ? " [github_sync_missing]" : ""
    }`,
  );
  clearIdeBrief();
  return { ok: true };
}

/** Slack-notify an existing pending draft (after IDE generation). */
export async function notifyExistingWeeklyDraft(): Promise<RunWeeklyWriteResult> {
  const draft = readWeeklyDraftFs();
  if (!draft) {
    return { ok: false, reason: "no_draft_file" };
  }
  if (draft.status !== "pending") {
    return {
      ok: false,
      reason: `draft_not_pending:${draft.status}`,
      draftId: draft.id,
      slug: draft.slug,
      draft,
    };
  }

  // Preview/Approve on Vercel read the draft from GitHub default branch —
  // persist before Slack. Use CLI-safe persist (no `server-only`) so GitHub
  // Actions / tsx / Cloud Automation can run. Feature-branch-only commits are
  // not enough: readRepoFile always hits the default branch.
  const persisted = await persistWeeklyDraftCli(
    draft,
    `chore: weekly write pending draft ${draft.id}`,
  );
  if (!persisted.viaGithub) {
    const msg =
      "Draft saved locally only (GITHUB_TOKEN unset). Set GITHUB_TOKEN (+ optional GITHUB_REPO) so preview/Approve work; full essay is still posted in Slack.";
    appendWeeklyWriteLog(`WARN: ${msg}`);
    console.warn(`[weekly-write] ${msg}`);
  }

  const slack = await notifyDraft(draft, {
    githubSynced: persisted.viaGithub,
  });
  if (!slack.ok) {
    return {
      ok: false,
      reason: slack.reason,
      draftId: draft.id,
      slug: draft.slug,
      source: draft.source,
      slack: false,
      githubSynced: persisted.viaGithub,
      draft,
    };
  }

  return {
    ok: true,
    draftId: draft.id,
    slug: draft.slug,
    source: draft.source,
    slack: true,
    githubSynced: persisted.viaGithub,
    draft,
  };
}

/**
 * Build intake → draft (or IDE brief) → optional Slack notify.
 * When Gemini is configured but fails, writes a local IDE brief and stops
 * before Slack — finish the essay in Cursor, then `npm run weekly:notify-draft`.
 */
export async function runWeeklyWritePipeline(options?: {
  force?: boolean;
  notify?: boolean;
  allowLocalFallback?: boolean;
  /** When set (API/cron), used instead of local FS to detect pending drafts. */
  existingDraft?: WeeklyDraft | null;
}): Promise<RunWeeklyWriteResult> {
  const notify = options?.notify !== false;
  const existing =
    options?.existingDraft !== undefined
      ? options.existingDraft
      : readWeeklyDraftFs();

  if (existing?.status === "pending" && !options?.force) {
    return {
      ok: true,
      skipped: true,
      reason: "pending_draft_exists",
      draftId: existing.id,
      slug: existing.slug,
      draft: existing,
    };
  }

  const intake = buildWeeklyIntake();
  const created = await createWeeklyDraft(intake, {
    allowLocalFallback: options?.allowLocalFallback,
  });

  if (created.status === "awaiting_ide") {
    const brief = writeIdeBrief({
      reason: created.reason,
      intake: created.intake,
      thesis: created.thesis,
    });
    const logLine =
      created.reason === "cloud_automation"
        ? "Cloud Automation / IDE path — brief ready for essay generation."
        : "Gemini unavailable — waiting for IDE essay generation before Slack.";
    appendWeeklyWriteLog(logLine);
    console.warn(
      "[weekly-write] IDE brief written (cloud automation / IDE path):",
      "data/weekly-write-ide-brief.md",
    );
    return {
      ok: true,
      awaitingIde: true,
      reason: created.reason,
      briefPath: "data/weekly-write-ide-brief.md",
      draft: undefined,
    };
  }

  const draft = created.draft;
  // Persist before Slack so preview links work (CLI-safe; no server-only).
  const persisted = await persistWeeklyDraftCli(
    draft,
    `chore: weekly write draft ${draft.id} [${draft.status}]`,
  );
  if (!persisted.viaGithub) {
    const msg =
      "Draft saved locally only (GITHUB_TOKEN unset). Set GITHUB_TOKEN (+ optional GITHUB_REPO) so preview/Approve work; full essay is still posted in Slack.";
    appendWeeklyWriteLog(`WARN: ${msg}`);
    console.warn(`[weekly-write] ${msg}`);
  }
  appendWeeklyWriteLog(
    `Draft ready (${draft.source}): ${draft.title} [${draft.id}]`,
  );

  let slackOk = false;
  if (notify) {
    const slack = await notifyDraft(draft, {
      githubSynced: persisted.viaGithub,
    });
    if (!slack.ok) {
      return {
        ok: false,
        reason: slack.reason,
        draftId: draft.id,
        slug: draft.slug,
        source: draft.source,
        slack: false,
        githubSynced: persisted.viaGithub,
        draft,
      };
    }
    slackOk = true;
  }

  return {
    ok: true,
    draftId: draft.id,
    slug: draft.slug,
    source: draft.source,
    slack: slackOk,
    githubSynced: persisted.viaGithub,
    draft,
  };
}
