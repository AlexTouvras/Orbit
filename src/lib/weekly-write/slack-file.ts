import type { WeeklyDraft } from "@/lib/weekly-write/types";

function essayBodyMarkdown(draft: WeeklyDraft): string {
  let body = draft.mdx || "";
  if (body.startsWith("---")) {
    const end = body.indexOf("---", 3);
    if (end >= 0) body = body.slice(end + 3).trim();
  }
  body = body.replace(/\r\n/g, "\n").trim();
  return body || draft.preview || draft.summary || "";
}

/**
 * Upload the full essay as a .md file to Slack (free plan OK).
 * Requires bot token with files:write — Incoming Webhooks cannot attach files.
 */
export async function uploadWeeklyDraftMarkdown(
  draft: WeeklyDraft,
): Promise<{ ok: true; fileId?: string } | { ok: false; reason: string }> {
  const token = process.env.SLACK_BOT_TOKEN?.trim();
  const channel =
    process.env.SLACK_CHANNEL_ID?.trim() ||
    process.env.SLACK_WEEKLY_CHANNEL_ID?.trim();

  if (!token) {
    return {
      ok: false,
      reason:
        "SLACK_BOT_TOKEN not set (Incoming Webhooks cannot attach .md files)",
    };
  }
  if (!channel) {
    return {
      ok: false,
      reason: "SLACK_CHANNEL_ID not set (e.g. C… for #career-ops)",
    };
  }

  const body = essayBodyMarkdown(draft);
  const filename = `${draft.slug || "weekly-write"}.md`;
  const content = `# ${draft.title}\n\n> ${draft.summary}\n\n${body}\n`;
  const bytes = Buffer.from(content, "utf8");

  const auth = { Authorization: `Bearer ${token}` };

  // 1) Get upload URL
  const start = await fetch("https://slack.com/api/files.getUploadURLExternal", {
    method: "POST",
    headers: {
      ...auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      filename,
      length: String(bytes.length),
    }),
  });
  const startJson = (await start.json()) as {
    ok?: boolean;
    error?: string;
    upload_url?: string;
    file_id?: string;
  };
  if (!startJson.ok || !startJson.upload_url || !startJson.file_id) {
    return {
      ok: false,
      reason: `files.getUploadURLExternal: ${startJson.error || "failed"}`,
    };
  }

  // 2) Upload bytes
  const put = await fetch(startJson.upload_url, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: bytes,
  });
  if (!put.ok) {
    return {
      ok: false,
      reason: `file upload POST failed (${put.status})`,
    };
  }

  // 3) Complete + share to channel
  const complete = await fetch(
    "https://slack.com/api/files.completeUploadExternal",
    {
      method: "POST",
      headers: {
        ...auth,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        files: [{ id: startJson.file_id, title: draft.title }],
        channel_id: channel,
        initial_comment: `Orbit weekly Write (.md): *${draft.title}* (~${body.split(/\s+/).filter(Boolean).length} words)`,
      }),
    },
  );
  const completeJson = (await complete.json()) as {
    ok?: boolean;
    error?: string;
  };
  if (!completeJson.ok) {
    return {
      ok: false,
      reason: `files.completeUploadExternal: ${completeJson.error || "failed"}`,
    };
  }

  return { ok: true, fileId: startJson.file_id };
}
