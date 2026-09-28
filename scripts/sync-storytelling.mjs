#!/usr/bin/env node
/**
 * Mirror the storytelling repo's public engine into Orbit.
 *
 * Storytelling stays the source. Orbit hosts /stories. A push to
 * storytelling main runs this (see .github/workflows/sync-storytelling.yml)
 * and the commit redeploys Vercel.
 *
 * Orbit-only adaptations applied after the copy:
 * - `@/lib/cn` → `@/lib/utils` (shared helper; do not overwrite it)
 * - `@/lib/prefers-reduced-motion` → `@/lib/use-prefers-reduced-motion`
 * - StoryHero top padding stays tight: /stories has no absolute header
 * - href="/" (storytelling home) → href="/stories"
 * - src/app/stories/page.tsx stays Orbit's (canonical metadata). Only
 *   LISTED_SLUGS is taken from storytelling's home page.
 *
 * Usage (from website/):
 *   npm run stories:sync
 *   STORYTELLING_ROOT=/path/to/storytelling npm run stories:sync
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const websiteRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const storytellingRoot = path.resolve(
  process.env.STORYTELLING_ROOT ?? path.join(websiteRoot, "..", "storytelling"),
);

const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  ".css",
  ".md",
]);

/** Relative to the destination stories app dir. Not deleted or overwritten. */
const STORIES_APP_OWNED = new Set(["page.tsx", "layout.tsx"]);

const HERO_PADDING_FROM = "pb-14 pt-28 sm:pb-20 sm:pt-32";
const HERO_PADDING_TO = "pb-14 pt-6 sm:pb-20 sm:pt-10";

function isTestFile(name) {
  return name.endsWith(".test.ts") || name.endsWith(".test.tsx");
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (isTestFile(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkFiles(full));
    else if (ent.isFile()) out.push(full);
  }
  return out;
}

function relPosix(root, file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function adaptText(text, { homeLinks, heroPadding }) {
  let next = text
    .replaceAll(
      "@/lib/prefers-reduced-motion",
      "@/lib/use-prefers-reduced-motion",
    )
    .replaceAll("@/lib/cn", "@/lib/utils");

  if (homeLinks) {
    next = next
      .replaceAll('href="/"', 'href="/stories"')
      .replaceAll("href='/'", "href='/stories'");
  }

  if (heroPadding && next.includes(HERO_PADDING_FROM)) {
    next = next.replaceAll(HERO_PADDING_FROM, HERO_PADDING_TO);
  }

  return next;
}

function sameBytes(existing, next) {
  if (existing.equals(next)) return true;
  if (existing.includes(0) || next.includes(0)) return false;
  const a = existing.toString("utf8").replaceAll("\r\n", "\n");
  const b = next.toString("utf8").replaceAll("\r\n", "\n");
  return a === b;
}

function writeFile(dest, buf) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  let next = buf;
  if (fs.existsSync(dest)) {
    const existing = fs.readFileSync(dest);
    if (sameBytes(existing, buf)) return false;
    // Binary assets (e.g. .riv) can contain CR/LF bytes; never rewrite their line endings.
    const isText = TEXT_EXT.has(path.extname(dest));
    if (isText && existing.includes(13) && existing.includes(10) && !buf.includes(0)) {
      const lf = buf.toString("utf8").replaceAll("\r\n", "\n");
      next = Buffer.from(lf.replaceAll("\n", "\r\n"), "utf8");
    }
  }
  fs.writeFileSync(dest, next);
  return true;
}

/**
 * @param {string} srcDir
 * @param {string} destDir
 * @param {{ homeLinks?: boolean, protect?: Set<string>, hero?: boolean, ignorePrefixes?: string[] }} opts
 */
function mirrorDir(srcDir, destDir, opts) {
  const changed = [];
  const srcFiles = walkFiles(srcDir);
  const keep = new Set();
  const ignored = (rel) =>
    opts.ignorePrefixes?.some((prefix) => rel === prefix || rel.startsWith(prefix));

  for (const src of srcFiles) {
    const rel = relPosix(srcDir, src);
    if (opts.protect?.has(rel) || ignored(rel)) continue;
    keep.add(rel);
    const dest = path.join(destDir, rel);
    let buf = fs.readFileSync(src);
    const ext = path.extname(src);
    if (TEXT_EXT.has(ext)) {
      const text = adaptText(buf.toString("utf8"), {
        homeLinks: Boolean(opts.homeLinks),
        heroPadding: Boolean(opts.hero) && rel === "StoryHero.tsx",
      });
      buf = Buffer.from(text, "utf8");
    }
    if (writeFile(dest, buf)) changed.push(relPosix(websiteRoot, dest));
  }

  for (const dest of walkFiles(destDir)) {
    const rel = relPosix(destDir, dest);
    if (opts.protect?.has(rel) || ignored(rel)) continue;
    if (keep.has(rel)) continue;
    fs.rmSync(dest, { force: true });
    changed.push(`deleted ${relPosix(websiteRoot, dest)}`);
  }

  return changed;
}

function mirrorFile(srcRel, destRel, opts = {}) {
  const src = path.join(storytellingRoot, srcRel);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing storytelling file: ${srcRel}`);
  }
  let buf = fs.readFileSync(src);
  if (TEXT_EXT.has(path.extname(src))) {
    const text = adaptText(buf.toString("utf8"), {
      homeLinks: Boolean(opts.homeLinks),
      heroPadding: false,
    });
    buf = Buffer.from(text, "utf8");
  }
  const dest = path.join(websiteRoot, destRel);
  return writeFile(dest, buf) ? [destRel] : [];
}

function syncListedSlugs() {
  const srcPath = path.join(storytellingRoot, "src", "app", "page.tsx");
  const src = fs.readFileSync(srcPath, "utf8");
  const found = src.match(/const LISTED_SLUGS = new Set<string>\([\s\S]*?\);/);
  if (!found) {
    throw new Error("LISTED_SLUGS missing from storytelling src/app/page.tsx");
  }
  const destPath = path.join(websiteRoot, "src", "app", "stories", "page.tsx");
  const dest = fs.readFileSync(destPath, "utf8");
  if (!/const LISTED_SLUGS = new Set<string>\([\s\S]*?\);/.test(dest)) {
    throw new Error("LISTED_SLUGS missing from Orbit src/app/stories/page.tsx");
  }
  const next = dest.replace(
    /const LISTED_SLUGS = new Set<string>\([\s\S]*?\);/,
    found[0],
  );
  if (next === dest) return [];
  fs.writeFileSync(destPath, next);
  return ["src/app/stories/page.tsx"];
}

function main() {
  if (!fs.existsSync(path.join(storytellingRoot, "package.json"))) {
    console.error(`storytelling repo not found at ${storytellingRoot}`);
    console.error("Set STORYTELLING_ROOT to the storytelling checkout.");
    process.exit(1);
  }

  const changed = [
    ...mirrorDir(
      path.join(storytellingRoot, "src", "components", "storytelling"),
      path.join(websiteRoot, "src", "components", "storytelling"),
      { hero: true },
    ),
    ...mirrorDir(
      path.join(storytellingRoot, "src", "components", "film"),
      path.join(websiteRoot, "src", "components", "film"),
      {},
    ),
    ...mirrorDir(
      path.join(storytellingRoot, "src", "components", "director"),
      path.join(websiteRoot, "src", "components", "director"),
      {},
    ),
    ...mirrorDir(
      path.join(storytellingRoot, "src", "components", "reader"),
      path.join(websiteRoot, "src", "components", "reader"),
      {},
    ),
    ...mirrorDir(
      path.join(storytellingRoot, "src", "illustrations"),
      path.join(websiteRoot, "src", "illustrations"),
      {},
    ),
    ...mirrorDir(
      path.join(storytellingRoot, "src", "stories"),
      path.join(websiteRoot, "src", "stories"),
      {},
    ),
    ...["sim", "director", "reader", "rive"].flatMap((dir) =>
      mirrorDir(
        path.join(storytellingRoot, "src", "lib", dir),
        path.join(websiteRoot, "src", "lib", dir),
        {},
      ),
    ),
    ...mirrorDir(
      path.join(storytellingRoot, "data", "figures"),
      path.join(websiteRoot, "data", "figures"),
      {},
    ),
    ...mirrorDir(
      path.join(storytellingRoot, "src", "app", "stories"),
      path.join(websiteRoot, "src", "app", "stories"),
      { homeLinks: true, protect: STORIES_APP_OWNED, ignorePrefixes: ["lab/"] },
    ),
    ...mirrorDir(
      path.join(storytellingRoot, "src", "app", "lab"),
      path.join(websiteRoot, "src", "app", "stories", "lab"),
      { homeLinks: true },
    ),
    ...mirrorFile("src/lib/loadStory.ts", "src/lib/loadStory.ts"),
    ...mirrorFile("src/lib/resolveScene.ts", "src/lib/resolveScene.ts"),
    ...mirrorFile(
      "src/lib/use-is-compact-viewport.ts",
      "src/lib/use-is-compact-viewport.ts",
    ),
    ...mirrorFile(
      "src/types/react-scrollama.d.ts",
      "src/types/react-scrollama.d.ts",
    ),
    ...syncListedSlugs(),
  ];

  if (changed.length === 0) {
    console.log(`stories:sync unchanged (${storytellingRoot})`);
    return;
  }

  console.log(`stories:sync updated ${changed.length} path(s):`);
  for (const file of changed) console.log(`  ${file}`);
}

main();
