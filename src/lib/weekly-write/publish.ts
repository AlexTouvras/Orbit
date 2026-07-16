import "server-only";
import fs from "node:fs";
import path from "node:path";
import {
  hasGithubStorage,
  readRepoFile,
  writeRepoFile,
} from "@/lib/github-storage";
import { repairUtf8Mojibake } from "@/lib/weekly-write/text-encoding";
import type { WeeklyDraft } from "@/lib/weekly-write/types";
import { writeWeeklyDraft } from "@/lib/weekly-write/store-remote";

const WRITES_REL = (slug: string) => `src/content/writes/${slug}.mdx`;

function uniqueSlugLocal(preferred: string): string {
  const writesDir = path.join(process.cwd(), "src", "content", "writes");
  if (!fs.existsSync(path.join(writesDir, `${preferred}.mdx`))) {
    return preferred;
  }
  return `${preferred}-${Date.now().toString(36)}`;
}

async function uniqueSlugRemote(preferred: string): Promise<string> {
  const existing = await readRepoFile(WRITES_REL(preferred));
  if (!existing) return preferred;
  return `${preferred}-${Date.now().toString(36)}`;
}

/** Publish a pending draft to Writes (GitHub commit on Vercel, FS locally). */
export async function publishWeeklyDraft(
  draft: WeeklyDraft,
): Promise<{ slug: string; viaGithub: boolean }> {
  if (draft.status !== "pending") {
    throw new Error(`Draft is ${draft.status}, not pending`);
  }

  const mdx = repairUtf8Mojibake(draft.mdx);
  if (!mdx.trimStart().startsWith("---")) {
    throw new Error("Draft MDX missing frontmatter");
  }

  const slug =
    process.env.VERCEL || hasGithubStorage()
      ? await uniqueSlugRemote(draft.slug)
      : uniqueSlugLocal(draft.slug);

  const filePath = WRITES_REL(slug);
  const content = mdx.endsWith("\n") ? mdx : `${mdx}\n`;

  if (hasGithubStorage()) {
    await writeRepoFile(
      filePath,
      content,
      `content: publish weekly write ${slug}`,
    );

    const updated: WeeklyDraft = {
      ...draft,
      status: "published",
      publishedAt: new Date().toISOString(),
      publishedSlug: slug,
      slug,
    };
    await writeWeeklyDraft(
      updated,
      `chore: mark weekly write ${draft.id} published`,
    );
    return { slug, viaGithub: true };
  }

  if (process.env.VERCEL) {
    throw new Error("GITHUB_TOKEN is required to publish weekly Writes on Vercel.");
  }

  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");

  const updated: WeeklyDraft = {
    ...draft,
    status: "published",
    publishedAt: new Date().toISOString(),
    publishedSlug: slug,
    slug,
  };
  await writeWeeklyDraft(updated);
  return { slug, viaGithub: false };
}


export async function skipWeeklyDraft(draft: WeeklyDraft): Promise<void> {
  if (draft.status !== "pending") {
    throw new Error(`Draft is ${draft.status}, not pending`);
  }
  await writeWeeklyDraft({
    ...draft,
    status: "skipped",
    skippedAt: new Date().toISOString(),
  });
}
