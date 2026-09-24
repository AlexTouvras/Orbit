#!/usr/bin/env node
/**
 * Sync Power BI portfolio showcase from the sibling powerbi-portfolio repo.
 *
 * Discovers every `NN-slug/screenshots/*.png` folder, copies PNGs into
 * `public/portfolio/power-bi/{slug}/`, and regenerates
 * `src/content/power-bi-reports.ts` from each project's README
 * (title, summary, Pages table).
 *
 * Usage (from website/):
 *   npm run powerbi:sync
 *   POWERBI_ROOT=C:/path/to/PowerBI npm run powerbi:sync
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const websiteRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const configPath = path.join(websiteRoot, "power-bi-projects.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const powerBiRoot = path.resolve(
  process.env.POWERBI_ROOT ?? path.join(websiteRoot, config.powerBiRoot),
);
const repoUrl = config.repoUrl;
const slugAliases = config.slugAliases ?? {};
const liveUrls = config.liveUrls ?? {};

const publicRoot = path.join(websiteRoot, "public", "portfolio", "power-bi");
const outTs = path.join(websiteRoot, "src", "content", "power-bi-reports.ts");

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripBold(s) {
  return s.replace(/\*\*/g, "").trim();
}

function parseReadme(readmePath) {
  const raw = fs.readFileSync(readmePath, "utf8");
  const lines = raw.split(/\r?\n/);

  let title = "";
  let summary = "";
  for (const line of lines) {
    if (!title && line.startsWith("# ")) {
      title = line
        .slice(2)
        .replace(/^\d+\s*[—–-]\s*/, "")
        // Drop trailing " — subtitle" / " - subtitle" clutter from H1
        .replace(/\s+[—–]\s+.*$/, "")
        .replace(/\s*\(.*\)\s*$/, "")
        .trim();
      continue;
    }
    if (title && !summary) {
      const t = line.trim();
      if (!t || t.startsWith("#") || t.startsWith("!") || t.startsWith("**")) {
        continue;
      }
      summary = t;
      break;
    }
  }

  const pages = [];
  let inPages = false;
  for (const line of lines) {
    if (/^##\s+Pages\b/i.test(line)) {
      inPages = true;
      continue;
    }
    if (inPages && /^##\s+/.test(line)) break;
    if (!inPages) continue;
    if (!line.trim().startsWith("|")) continue;
    if (/^\|\s*-+/.test(line) || /\bPage\b.*\bRole\b/i.test(line)) continue;

    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 2) continue;

    const label = stripBold(cells[0]);
    const caption = stripBold(cells[1])
      .replace(/[·•]/g, " · ")
      .replace(/\s*·\s*/g, " · ")
      .replace(/[×✕]/g, "×")
      .replace(/[▲⬆]/g, "up")
      .replace(/[▼⬇]/g, "down")
      .replace(/\s+/g, " ")
      .trim();
    if (!label) continue;
    if (/hidden/i.test(caption) || /hidden/i.test(label)) continue;

    pages.push({
      id: slugify(label),
      label,
      caption: caption || label,
    });
  }

  return { title: title || path.basename(path.dirname(readmePath)), summary, pages };
}

function findScreenshotFile(pngs, pageId) {
  const lowerMap = new Map(pngs.map((f) => [f.toLowerCase(), f]));
  const candidates = [
    `${pageId}.png`,
    `${pageId.replace(/-and-/g, "-")}.png`,
    `${pageId.replace(/-and-/g, "-and-")}.png`,
  ];
  for (const c of candidates) {
    const hit = lowerMap.get(c.toLowerCase());
    if (hit) return hit;
  }
  // Last resort: ignore "and" and hyphen breaks.
  // README slug "cut-off-strategy" must still find screenshots/cutoff-strategy.png.
  const withoutAnd = pageId.replace(/-and-/g, "-");
  const collapsed = withoutAnd.replace(/-/g, "");
  for (const f of pngs) {
    const stem = f.replace(/\.png$/i, "").toLowerCase();
    if (
      stem === withoutAnd ||
      stem.replace(/-and-/g, "-") === withoutAnd ||
      stem.replace(/-/g, "") === collapsed
    ) {
      return f;
    }
  }
  return null;
}

function discoverProjects() {
  if (!fs.existsSync(powerBiRoot)) {
    throw new Error(
      `Power BI root not found: ${powerBiRoot}\nSet POWERBI_ROOT or power-bi-projects.json → powerBiRoot.`,
    );
  }

  const dirs = fs
    .readdirSync(powerBiRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d+-/.test(d.name))
    .map((d) => d.name)
    .sort((a, b) => {
      const na = Number(a.match(/^(\d+)/)?.[1] ?? 0);
      const nb = Number(b.match(/^(\d+)/)?.[1] ?? 0);
      return na - nb;
    });

  const projects = [];

  for (const dirName of dirs) {
    const projectDir = path.join(powerBiRoot, dirName);
    const shotsDir = path.join(projectDir, "screenshots");
    if (!fs.existsSync(shotsDir)) continue;

    const pngs = fs
      .readdirSync(shotsDir)
      .filter((f) => /\.png$/i.test(f))
      .sort((a, b) => a.localeCompare(b));
    if (pngs.length === 0) continue;

    const folderSlug = dirName.replace(/^\d+-/, "");
    const id = slugAliases[folderSlug] ?? folderSlug;
    const readmePath = path.join(projectDir, "README.md");
    const meta = fs.existsSync(readmePath)
      ? parseReadme(readmePath)
      : { title: folderSlug, summary: "", pages: [] };

    let pages = meta.pages
      .map((p) => {
        const file = findScreenshotFile(pngs, p.id);
        if (!file) return null;
        return {
          ...p,
          id: file.replace(/\.png$/i, ""),
          src: `/portfolio/power-bi/${id}/${file}`,
          file,
        };
      })
      .filter(Boolean);

    if (pages.length === 0) {
      pages = pngs.map((file) => {
        const pageId = file.replace(/\.png$/i, "");
        return {
          id: pageId,
          label: pageId
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          caption: "",
          src: `/portfolio/power-bi/${id}/${file}`,
          file,
        };
      });
    }

    projects.push({
      id,
      dirName,
      projectDir,
      shotsDir,
      title: meta.title,
      summary: meta.summary,
      liveUrl: liveUrls[id] || liveUrls[folderSlug] || undefined,
      pages,
    });
  }

  return projects;
}

function copyScreenshots(projects) {
  fs.mkdirSync(publicRoot, { recursive: true });
  // Remove stale slug dirs not in this sync
  const keep = new Set(projects.map((p) => p.id));
  if (fs.existsSync(publicRoot)) {
    for (const entry of fs.readdirSync(publicRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && !keep.has(entry.name)) {
        fs.rmSync(path.join(publicRoot, entry.name), {
          recursive: true,
          force: true,
        });
        console.log(`⊘ removed stale public slug ${entry.name}`);
      }
    }
  }

  for (const project of projects) {
    const destDir = path.join(publicRoot, project.id);
    fs.mkdirSync(destDir, { recursive: true });
    // Clear old PNGs in this slug
    for (const f of fs.readdirSync(destDir)) {
      if (/\.png$/i.test(f)) fs.unlinkSync(path.join(destDir, f));
    }
    for (const page of project.pages) {
      const src = path.join(project.shotsDir, page.file);
      const dest = path.join(destDir, page.file);
      fs.copyFileSync(src, dest);
    }
    console.log(
      `✓ ${project.dirName} → public/portfolio/power-bi/${project.id}/ (${project.pages.length} pages)`,
    );
  }
}

function escapeTs(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, " ");
}

function generateTs(projects) {
  const blocks = projects.map((p) => {
    const pages = p.pages
      .map(
        (page) => `      {
        id: "${page.id}",
        label: "${escapeTs(page.label)}",
        caption: "${escapeTs(page.caption)}",
        src: "${page.src}",
      }`,
      )
      .join(",\n");

    const liveLine = p.liveUrl
      ? `\n    liveUrl: "${escapeTs(p.liveUrl)}",`
      : "";

    return `  {
    id: "${p.id}",
    title: "${escapeTs(p.title)}",
    summary: "${escapeTs(p.summary)}",
    repoUrl: "${repoUrl}",${liveLine}
    pages: [
${pages},
    ],
  }`;
  });

  return `/**
 * AUTO-GENERATED by \`npm run powerbi:sync\` — do not edit by hand.
 * Source: Power BI repo screenshots + README Pages tables.
 * Config: power-bi-projects.json
 */

export interface PowerBiReportPage {
  id: string;
  label: string;
  caption: string;
  src: string;
}

export interface PowerBiReport {
  id: string;
  title: string;
  summary: string;
  repoUrl?: string;
  /** Optional interactive demo (e.g. Vercel board for Nordic Equity). */
  liveUrl?: string;
  pages: PowerBiReportPage[];
}

export const powerBiReports: PowerBiReport[] = [
${blocks.join(",\n")},
];
`;
}

const projects = discoverProjects();
if (projects.length === 0) {
  console.error(`No report folders with screenshots found under ${powerBiRoot}`);
  process.exit(1);
}

copyScreenshots(projects);
fs.mkdirSync(path.dirname(outTs), { recursive: true });
fs.writeFileSync(outTs, generateTs(projects), "utf8");
console.log(`\nWrote ${outTs}`);
console.log(`Synced ${projects.length} report(s) from ${powerBiRoot}`);
