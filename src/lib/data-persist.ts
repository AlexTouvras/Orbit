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
 * Persist JSON data locally (dev / VM) or commit to GitHub (Vercel).
 * Returns whether a GitHub commit was made (triggers Vercel redeploy).
 */
export async function persistDataJson(
  relativePath: string,
  data: unknown,
  commitMessage: string,
): Promise<{ viaGithub: boolean }> {
  const content = `${JSON.stringify(data, null, 2)}\n`;

  if (hasGithubStorage()) {
    await writeRepoFile(relativePath, content, commitMessage);
    return { viaGithub: true };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "GITHUB_TOKEN is not configured on Vercel. Studio cannot save without it.",
    );
  }

  writeLocalFile(relativePath, content);
  return { viaGithub: false };
}
