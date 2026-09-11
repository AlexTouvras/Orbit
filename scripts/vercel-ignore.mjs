#!/usr/bin/env node
/**
 * Vercel Ignored Build Step (exit 0 = skip, exit 1 = build).
 *
 * Skip only when every file in HEAD is runtime-read from GitHub, so a rebuild
 * would not change what the live app serves. Unknown git state fails open
 * (build) so Power BI screenshots, profile, Writes, and field cards still ship.
 *
 * @see https://vercel.com/docs/project-configuration/vercel-json#ignorecommand
 */
import { execSync } from "node:child_process";
import assert from "node:assert/strict";

/** Paths the production app reads via GitHub at request time — no rebuild needed. */
export const RUNTIME_DATA_FILES = new Set([
  "data/news-cache.json",
  "data/essay-feedback.json",
  "data/newsletter-draft.json",
  "data/weekly-write-draft.json",
  "data/weekly-write-ide-brief.json",
  "data/weekly-write-ide-brief.md",
]);

export function normalizePath(file) {
  return String(file).trim().replaceAll("\\", "/");
}

/**
 * @param {string[] | null | undefined} changedFiles
 * @returns {boolean} true → skip the Vercel build
 */
export function shouldSkipBuild(changedFiles) {
  if (!Array.isArray(changedFiles) || changedFiles.length === 0) return false;
  return changedFiles.every((file) =>
    RUNTIME_DATA_FILES.has(normalizePath(file)),
  );
}

function listHeadFiles() {
  try {
    const out = execSync("git diff-tree --no-commit-id --name-only -r HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return out
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.log(`vercel-ignore: git failed (${detail}); building to be safe`);
    return null;
  }
}

function runIgnoreCommand() {
  try {
    const files = listHeadFiles();
    if (files === null) process.exit(1);

    if (shouldSkipBuild(files)) {
      console.log("vercel-ignore: skip (runtime data only)");
      for (const file of files) console.log(`  ${file}`);
      process.exit(0);
    }

    console.log("vercel-ignore: build");
    for (const file of files) console.log(`  ${file}`);
    process.exit(1);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.log(`vercel-ignore: unexpected error (${detail}); building to be safe`);
    process.exit(1);
  }
}

function runSelfTest() {
  assert.equal(shouldSkipBuild(["data/news-cache.json"]), true);
  assert.equal(shouldSkipBuild(["data/essay-feedback.json"]), true);
  assert.equal(
    shouldSkipBuild(["data/newsletter-draft.json", "data/weekly-write-draft.json"]),
    true,
  );
  assert.equal(
    shouldSkipBuild([
      "data/weekly-write-ide-brief.json",
      "data/weekly-write-ide-brief.md",
    ]),
    true,
  );
  assert.equal(shouldSkipBuild(["data/news-cache.json", "src/app/page.tsx"]), false);
  assert.equal(
    shouldSkipBuild([
      "public/portfolio/power-bi/foo.png",
      "src/content/power-bi-reports.ts",
    ]),
    false,
  );
  assert.equal(shouldSkipBuild(["data/profile.json"]), false);
  assert.equal(shouldSkipBuild(["data/published-projects.json"]), false);
  assert.equal(
    shouldSkipBuild(["public/field-card/index.html"]),
    false,
  );
  assert.equal(shouldSkipBuild(["src/content/writes/hello.mdx"]), false);
  assert.equal(shouldSkipBuild([]), false);
  assert.equal(shouldSkipBuild(null), false);
  assert.equal(shouldSkipBuild(["data\\news-cache.json"]), true);
  console.log("vercel-ignore self-test ok");
}

if (process.argv[1] && process.argv[1].replaceAll("\\", "/").endsWith("/vercel-ignore.mjs")) {
  if (process.argv.includes("--test")) {
    runSelfTest();
  } else {
    runIgnoreCommand();
  }
}
