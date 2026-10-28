#!/usr/bin/env node
/**
 * Sync Power BI portfolio showcase from the sibling powerbi-portfolio repo.
 *
 * Discovers every `NN-slug/screenshots/*.png` folder, copies PNGs into
 * `public/portfolio/power-bi/{slug}/`, and regenerates
 * `src/content/power-bi-reports.ts` from each project's README
 * (title, Pages table) and the landing-page claim.
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

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim());
  const cols = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row = {};
    cols.forEach((col, i) => {
      row[col] = cells[i] ?? "";
    });
    return row;
  });
}

function formatWhole(n) {
  const rounded = Math.round(Math.abs(n));
  return rounded.toLocaleString("en-US");
}

/** Unfiltered Controllership landing sentence. Same words as the Landing Thesis measure. */
function controllershipClaim(projectDir) {
  const gold = path.join(projectDir, "data", "gold");
  const factPath = path.join(gold, "FactPnL.csv");
  const accountPath = path.join(gold, "DimAccount.csv");
  const entityPath = path.join(gold, "DimEntity.csv");
  if (![factPath, accountPath, entityPath].every((p) => fs.existsSync(p))) {
    return "";
  }

  const accounts = new Map(
    parseCsv(accountPath).map((row) => [row.AccountID, row]),
  );
  const entities = new Map(
    parseCsv(entityPath).map((row) => [row.EntityID, row.EntityName]),
  );
  let gap = 0;
  const signed = new Map();
  for (const row of parseCsv(factPath)) {
    const variance = Number(row.VarianceEur);
    if (!Number.isFinite(variance)) continue;
    if (row.AccountID === "O900") gap += variance;
    const account = accounts.get(row.AccountID);
    if (!account || Number(account.Level) !== 1) continue;
    const sign = Number(account.Sign);
    signed.set(
      row.EntityID,
      (signed.get(row.EntityID) ?? 0) + variance * sign,
    );
  }

  const ranked = [...signed.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked.length || !Number.isFinite(gap)) return "";

  const cover = entities.get(ranked[0][0]);
  const drag = entities.get(ranked[ranked.length - 1][0]);
  const coverVal = ranked[0][1];
  const dragVal = ranked[ranked.length - 1][1];
  if (!cover || !drag) return "";

  const gapAbs = formatWhole(gap);
  const sameEntity = cover === drag;
  if (sameEntity && gap < 0) {
    return `Operating profit is ${gapAbs} EUR below budget - pressure concentrates in ${drag}.`;
  }
  if (sameEntity && gap > 0) {
    return `Operating profit is ${gapAbs} EUR above budget - led by ${cover}.`;
  }
  if (gap < 0 && coverVal > 0 && dragVal < 0) {
    return `Operating profit is ${gapAbs} EUR below budget - ${cover}'s contribution does not cover ${drag}'s drag.`;
  }
  if (gap < 0) return `Operating profit is ${gapAbs} EUR below budget.`;
  if (gap > 0) {
    return `Operating profit is ${gapAbs} EUR above budget - led by ${cover}.`;
  }
  return "Operating profit is on budget.";
}

function textboxLines(visual) {
  if (visual.visual?.visualType !== "textbox") return [];
  const general = visual.visual.objects?.general;
  if (!Array.isArray(general)) return [];
  const y = visual.position?.y ?? 0;
  const lines = [];
  for (const block of general) {
    for (const para of block.properties?.paragraphs ?? []) {
      const runs = para.textRuns ?? [];
      const text = runs
        .map((run) => run.value ?? "")
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      if (!text) continue;
      const style = runs[0]?.textStyle ?? {};
      lines.push({
        text,
        y,
        size: style.fontSize ?? "",
        weight: style.fontWeight ?? "",
      });
    }
  }
  return lines;
}

/**
 * The landing sentence the report itself prints under the title.
 * That is the 16pt or 18pt line. A bold line at that size is the finding.
 */
function landingClaim(projectDir) {
  const reportDirs = fs
    .readdirSync(projectDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.endsWith(".Report"))
    .map((entry) => entry.name);

  for (const reportDir of reportDirs) {
    const pagesDir = path.join(
      projectDir,
      reportDir,
      "definition",
      "pages",
    );
    if (!fs.existsSync(pagesDir)) continue;
    for (const section of fs.readdirSync(pagesDir)) {
      const pagePath = path.join(pagesDir, section, "page.json");
      if (!fs.existsSync(pagePath)) continue;
      const page = JSON.parse(fs.readFileSync(pagePath, "utf8"));
      if (page.displayName !== "Landing") continue;
      const visualsDir = path.join(pagesDir, section, "visuals");
      if (!fs.existsSync(visualsDir)) continue;
      const lines = [];
      for (const visualName of fs.readdirSync(visualsDir)) {
        const visualPath = path.join(visualsDir, visualName, "visual.json");
        if (!fs.existsSync(visualPath)) continue;
        const visual = JSON.parse(fs.readFileSync(visualPath, "utf8"));
        lines.push(...textboxLines(visual));
      }
      const sized = lines.filter((line) => {
        if (line.size !== "16pt" && line.size !== "18pt") return false;
        const text = line.text.trim();
        if (text.length < 40) return false;
        if (/^what you[’']ll see$/i.test(text)) return false;
        if (/^(audience|signature|source|tip)\b/i.test(text)) return false;
        if (/^\d{2}\s/.test(text)) return false;
        return true;
      });
      if (!sized.length) continue;
      const bold = sized.filter((line) => line.weight === "bold");
      const pool = bold.length ? bold : sized;
      pool.sort((a, b) => a.y - b.y);
      return pool[0].text;
    }
  }

  return controllershipClaim(projectDir);
}

function parseReadme(readmePath) {
  const raw = fs.readFileSync(readmePath, "utf8");
  const lines = raw.split(/\r?\n/);

  let title = "";
  for (const line of lines) {
    if (!title && line.startsWith("# ")) {
      title = line
        .slice(2)
        .replace(/^\d+\s*[—–-]\s*/, "")
        // Drop trailing " — subtitle" / " - subtitle" clutter from H1
        .replace(/\s+[—–]\s+.*$/, "")
        .replace(/\s*\(.*\)\s*$/, "")
        .trim();
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

  return { title: title || path.basename(path.dirname(readmePath)), pages };
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
  // Last resort: ignore hyphens so "Cut-off Strategy" matches cutoff-strategy.png.
  const compact = pageId.replace(/-/g, "");
  for (const f of pngs) {
    const stem = f.replace(/\.png$/i, "").toLowerCase().replace(/-/g, "");
    if (stem === compact) return f;
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
      : { title: folderSlug, pages: [] };

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

    const claim = landingClaim(projectDir);
    if (!claim) {
      console.warn(`! ${dirName} has no landing claim`);
    }

    projects.push({
      id,
      dirName,
      projectDir,
      shotsDir,
      title: meta.title,
      claim,
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
    claim: "${escapeTs(p.claim)}",
    repoUrl: "${repoUrl}",${liveLine}
    pages: [
${pages},
    ],
  }`;
  });

  return `/**
 * AUTO-GENERATED by \`npm run powerbi:sync\` — do not edit by hand.
 * Source: Power BI repo screenshots, landing claims, and README Pages tables.
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
  /** Landing sentence printed on the report, not the README build note. */
  claim: string;
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
