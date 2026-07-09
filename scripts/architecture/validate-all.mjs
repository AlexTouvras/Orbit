#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateArchitectureDir } from "./lib.mjs";

const websiteRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const registry = JSON.parse(
  fs.readFileSync(path.join(websiteRoot, "architecture-projects.json"), "utf8"),
);

const filterId = process.argv.find((a) => a.startsWith("--project="))?.split("=")[1];
const projects = registry.projects.filter((p) => !filterId || p.id === filterId);

let total = 0;
let failedProjects = 0;

for (const project of projects) {
  const archDir = path.join(websiteRoot, registry.projectsRoot, project.dir, "docs", "architecture");
  if (!fs.existsSync(archDir)) {
    console.warn(`⊘ ${project.id} — no docs/architecture/ (${project.dir})`);
    continue;
  }
  const result = validateArchitectureDir(archDir, { label: project.id });
  total += result.count;
  if (result.count === 0) {
    console.warn(`⊘ ${project.id} — no mermaid blocks`);
    continue;
  }
  if (result.ok) {
    console.log(`✓ ${project.id} — ${result.count} diagram(s)`);
  } else {
    failedProjects += 1;
    console.error(`✗ ${project.id} — ${result.failed} invalid diagram(s)`);
  }
}

console.log(`\nValidated ${total} diagram(s) across ${projects.length} project(s).`);
process.exit(failedProjects > 0 ? 1 : 0);
