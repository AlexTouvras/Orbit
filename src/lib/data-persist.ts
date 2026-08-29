import "server-only";
import fs from "node:fs";
import path from "node:path";
import { hasGithubStorage, writeRepoFile } from "@/lib/github-storage";

const DATA_DIR = path.join(process.cwd(), "data");

function writeLocalFile(relativePath: string, content: string): void {
  const normalized = relativePath.replace(/^data[\\/]/, "");
  const fullPath = path.join(DATA_DIR, normalized);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

/**
 * Persist JSON data locally (dev) and/or commit to GitHub (Vercel / when token set).
 * On Vercel, GitHub is required (ephemeral filesystem). Locally, always write disk
 * so the running Next server sees the change even if a PAT is also configured.
 */
export async function persistDataJson(
  relativePath: string,
  data: unknown,
  commitMessage: string,
): Promise<{ viaGithub: boolean; warning?: string }> {
  const content = `${JSON.stringify(data, null, 2)}\n`;
  const onVercel = Boolean(process.env.VERCEL);
  const github = hasGithubStorage();

  if (onVercel) {
    if (!github) {
      throw new Error(
        "GITHUB_TOKEN is not configured on Vercel. Studio cannot save without it.",
      );
    }
    await writeRepoFile(relativePath, content, commitMessage);
    return { viaGithub: true };
  }

  // Dev / local: always update the file Next reads.
  writeLocalFile(relativePath, content);

  if (github) {
    try {
      await writeRepoFile(relativePath, content, commitMessage);
      return { viaGithub: true };
    } catch (err) {
      const detail = err instanceof Error ? err.message : "GitHub save failed.";
      return {
        viaGithub: false,
        warning: `Saved locally, but GitHub sync failed (${detail}). Live site unchanged until this is fixed.`,
      };
    }
  }

  return { viaGithub: false };
}
