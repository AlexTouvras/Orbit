#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildArchitecturePage } from "./lib.mjs";

const websiteRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const archOutDir = path.join(websiteRoot, "src", "content", "architecture");
const registry = JSON.parse(
  fs.readFileSync(path.join(websiteRoot, "architecture-projects.json"), "utf8"),
);

const filterId = process.argv.find((a) => a.startsWith("--project="))?.split("=")[1];
const projects = registry.projects.filter((p) => !filterId || p.id === filterId);

let synced = 0;
let skipped = 0;

for (const project of projects) {
  const archDir = path.join(websiteRoot, registry.projectsRoot, project.dir, "docs", "architecture");
  if (!fs.existsSync(archDir)) {
    console.warn(`⊘ skip ${project.id} — missing ${project.dir}/docs/architecture/`);
    skipped += 1;
    continue;
  }

  const mdFiles = fs
    .readdirSync(archDir)
    .filter((f) => f.endsWith(".md") && f !== "README.md");
  if (mdFiles.length === 0) {
    console.warn(`⊘ skip ${project.id} — no diagram markdown files`);
    skipped += 1;
    continue;
  }

  const outPath = path.join(archOutDir, `${project.id}.mdx`);
  fs.mkdirSync(archOutDir, { recursive: true });
  fs.writeFileSync(outPath, buildArchitecturePage({ project, archDir }), "utf8");
  console.log(`✓ ${project.id} → architecture/${project.id}.mdx`);
  synced += 1;
}

console.log(`\nSynced ${synced} architecture page(s), skipped ${skipped}.`);
process.exit(0);
