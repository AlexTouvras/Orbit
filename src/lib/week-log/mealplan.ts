import "server-only";
import {
  githubBlobUrl,
  opsGithubToken,
  parseRepoSlug,
  readGithubFile,
} from "@/lib/week-log/github";
import { listLocalDir, readLocalFile, siblingRoot } from "@/lib/week-log/local";
import { markdownSection, parseMarkdownTable } from "@/lib/week-log/markdown";
import type { MealDay, MealWeek, WeekLane } from "@/lib/week-log/types";

function mealplanRepo() {
  return parseRepoSlug(
    process.env.MEALPLAN_GITHUB_REPO?.trim() || "AlexTouvras/mealplan-private",
    process.env.MEALPLAN_GITHUB_BRANCH?.trim() || "main",
  );
}

function parseDays(markdown: string): MealDay[] {
  const daily = markdownSection(markdown, "Daily plan") || markdown;
  const chunks = daily.split(/^###\s+/m).slice(1);
  const days: MealDay[] = [];
  for (const chunk of chunks) {
    const newline = chunk.indexOf("\n");
    const heading = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
    const body = newline === -1 ? "" : chunk.slice(newline + 1);
    const table = parseMarkdownTable(body);
    const mealIdx = table.headers.findIndex((h) => /meal/i.test(h));
    const dishIdx = table.headers.findIndex((h) => /dish/i.test(h));
    const notesIdx = table.headers.findIndex((h) => /note/i.test(h));
    const meals = table.rows.map((row) => ({
      meal: row[mealIdx >= 0 ? mealIdx : 0] ?? "",
      dish: row[dishIdx >= 0 ? dishIdx : 1] ?? "",
      notes: notesIdx >= 0 ? (row[notesIdx] ?? "") : "",
    }));
    days.push({ heading, meals });
  }
  return days;
}

function mealFromMarkdown(text: string, weekId: string): MealWeek {
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const goals = markdownSection(text, "Goals one-liner");
  return {
    title: titleMatch?.[1]?.trim() || `Meal plan — ${weekId}`,
    goals: goals || null,
    days: parseDays(text),
  };
}

async function readMealText(
  weekId: string,
): Promise<{ text: string; via: "github" | "local"; path: string } | null> {
  const filePath = `output/${weekId}-plan.md`;
  const token = opsGithubToken();
  const repo = mealplanRepo();
  if (token && repo) {
    const remote = await readGithubFile(repo, filePath, token);
    if (remote.ok) return { text: remote.text, via: "github", path: filePath };
  }
  const local = readLocalFile(siblingRoot("mealplan"), filePath);
  if (local) return { text: local, via: "local", path: filePath };
  return null;
}

function latestLocalMealId(atMost: string): string | null {
  const entries = listLocalDir(siblingRoot("mealplan"), "output");
  if (!entries) return null;
  const weeks = entries
    .filter((entry) => entry.type === "file" && /^\d{4}-W\d{2}-plan\.md$/i.test(entry.name))
    .map((entry) => entry.name.replace(/-plan\.md$/i, ""))
    .filter((id) => id <= atMost)
    .sort();
  return weeks.at(-1) ?? null;
}

export async function loadMealWeek(weekId: string): Promise<WeekLane<MealWeek>> {
  const exact = await readMealText(weekId);
  if (exact) {
    const repo = mealplanRepo();
    return {
      status: "ok",
      source: exact.path,
      href: exact.via === "github" && repo ? githubBlobUrl(repo, exact.path) : undefined,
      data: mealFromMarkdown(exact.text, weekId),
    };
  }

  const latestId = latestLocalMealId(weekId);
  if (latestId) {
    const latest = await readMealText(latestId);
    if (latest) {
      return {
        status: "ok",
        stale: `Latest meal plan is ${latestId} — nothing committed for ${weekId} yet.`,
        source: latest.path,
        data: mealFromMarkdown(latest.text, latestId),
      };
    }
  }

  return {
    status: "empty",
    detail: `No meal plan for ${weekId}, and no older plan on this machine.`,
    source: `output/${weekId}-plan.md`,
    data: null,
  };
}
