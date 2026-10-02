#!/usr/bin/env node
/**
 * Doc currency check.
 * Structural rules always run. Pass --since <git-ref> to also require
 * coupled files in the same diff (three-dot, then two-dot).
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const POINTER_MARKER = "Superseded by";

function readJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), "utf8"));
}

function relExists(rel) {
  return existsSync(join(root, rel));
}

function readRel(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function lineCount(text) {
  if (text.length === 0) return 0;
  return text.split(/\r?\n/).length;
}

function walkMarkdown(dirRel, out) {
  const abs = join(root, dirRel);
  if (!existsSync(abs)) return;
  for (const name of readdirSync(abs)) {
    const rel = `${dirRel}/${name}`;
    const st = statSync(join(root, rel));
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".git") continue;
      walkMarkdown(rel, out);
    } else if (name.endsWith(".md")) {
      out.push(rel);
    }
  }
}

function listMarkdown() {
  const found = [];
  for (const top of readdirSync(root)) {
    if (top === "node_modules" || top === ".git" || top === ".next") continue;
    const abs = join(root, top);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) walkMarkdown(top, found);
    else if (top.endsWith(".md")) found.push(top);
  }
  return found;
}

function prefixMatch(file, prefix) {
  if (prefix.endsWith("/")) return file.startsWith(prefix);
  return file === prefix || file.startsWith(`${prefix}/`);
}

export function couplingFailures(changed, couplings) {
  const failures = [];
  for (const rule of couplings) {
    const hit = changed.some((file) => rule.when.some((prefix) => prefixMatch(file, prefix)));
    if (!hit) continue;
    const touched = rule.alsoTouch.every((need) => changed.includes(need));
    if (!touched) failures.push(rule.message);
  }
  return failures;
}

function changedFiles(since) {
  const attempts = [
    `git diff --name-only ${since}...HEAD`,
    `git diff --name-only ${since} HEAD`,
  ];
  let lastError = "";
  for (const command of attempts) {
    try {
      const out = execSync(command, {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      return out
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    } catch (error) {
      lastError = error.stderr?.toString() || error.message;
    }
  }
  throw new Error(`cannot diff against ${since}: ${lastError.trim()}`);
}

function readmePaths(text) {
  const found = [];
  const re = /`([^`\n]+)`/g;
  let match;
  while ((match = re.exec(text))) {
    let token = match[1].trim();
    if (
      token.includes("*") ||
      token.includes(" ") ||
      token.includes("{") ||
      token.includes("}") ||
      token.includes("$") ||
      token.includes("<") ||
      token.includes(">") ||
      token.startsWith("http") ||
      token.startsWith("npm") ||
      token.startsWith("node") ||
      token.startsWith("curl")
    ) {
      continue;
    }
    token = token.replace(/[.,:;)]+$/, "").replace(/\/$/, "");
    const repoPath =
      /^(?:src|docs|public|data|scripts|deploy|\.cursor|\.github|\.state)\/[A-Za-z0-9_./-]+$/.test(
        token,
      ) ||
      /^(?:CONTENT|PRODUCT|DEPLOY|DEPLOY-VERCEL|PROJECT_CHARTER)\.md$/.test(token) ||
      /^(?:tailwind\.config\.ts|package\.json|architecture-projects\.json)$/.test(token);
    if (repoPath) found.push(token);
  }
  return found;
}

function check(registry, options = {}) {
  const errors = [];
  const owners = new Set();
  const companions = new Set();
  const pointers = new Set();

  for (const topic of registry.topics) {
    if (!topic.owner || !relExists(topic.owner)) {
      errors.push(`${topic.id}: owner missing (${topic.owner})`);
    } else {
      owners.add(topic.owner);
    }
    for (const companion of topic.companions || []) {
      if (!relExists(companion)) errors.push(`${topic.id}: companion missing (${companion})`);
      else companions.add(companion);
    }
    for (const pointer of topic.pointers || []) {
      pointers.add(pointer.path);
      if (pointer.path === topic.owner) {
        errors.push(`${topic.id}: pointer ${pointer.path} is also the owner`);
      }
      if (!relExists(pointer.path)) {
        errors.push(`${topic.id}: pointer missing (${pointer.path})`);
        continue;
      }
      const body = readRel(pointer.path);
      const lines = lineCount(body.replace(/\n$/, ""));
      if (lines > registry.pointerMaxLines) {
        errors.push(
          `${pointer.path} is ${lines} lines. Pointers stay under ${registry.pointerMaxLines}. Move the prose to ${pointer.archive}.`,
        );
      }
      if (!body.includes(POINTER_MARKER)) {
        errors.push(`${pointer.path} must contain "${POINTER_MARKER}"`);
      }
      if (!relExists(pointer.archive)) {
        errors.push(`${topic.id}: archive missing (${pointer.archive})`);
      } else {
        const archived = readRel(pointer.archive);
        const from = `Archived from \`${pointer.path}\``;
        if (!archived.includes(from)) {
          errors.push(`${pointer.archive} must contain ${from}`);
        }
      }
    }
  }

  if (relExists(registry.archiveDir)) {
    for (const name of readdirSync(join(root, registry.archiveDir))) {
      if (!name.endsWith(".md") || name === "README.md") continue;
      const rel = `${registry.archiveDir}/${name}`;
      const body = readRel(rel);
      if (!body.includes("Archived from `")) {
        errors.push(`${rel} must start as an archive (include Archived from \`path\`)`);
      }
    }
  } else {
    errors.push(`archive dir missing (${registry.archiveDir})`);
  }

  const allowedPrimacy = new Set([...owners, ...companions, ...pointers]);
  for (const file of listMarkdown()) {
    if (file.startsWith(`${registry.archiveDir}/`)) continue;
    const body = readRel(file);
    for (const phrase of registry.primacyPhrases) {
      if (!body.includes(phrase)) continue;
      const pointerOk = pointers.has(file) && body.includes(POINTER_MARKER);
      if (!allowedPrimacy.has(file) && !pointerOk) {
        errors.push(`${file} says "${phrase}" but is not the owner, a companion, or a pointer`);
      }
    }
  }

  for (const claim of registry.forbiddenClaims || []) {
    if (!relExists(claim.path)) {
      errors.push(`forbidden-claim path missing (${claim.path})`);
      continue;
    }
    if (readRel(claim.path).includes(claim.text)) {
      errors.push(`${claim.path} still claims "${claim.text}"`);
    }
  }

  if (registry.readmePathScan && relExists(registry.readmePathScan)) {
    for (const token of readmePaths(readRel(registry.readmePathScan))) {
      if (!relExists(token)) errors.push(`${registry.readmePathScan} links missing path \`${token}\``);
    }
  }

  if (registry.architectureIndex && relExists(registry.architectureIndex)) {
    const index = readRel(registry.architectureIndex);
    const dir = dirname(registry.architectureIndex);
    for (const name of readdirSync(join(root, dir))) {
      if (!name.endsWith(".md") || name === "README.md") continue;
      if (!index.includes(name)) {
        errors.push(`${dir}/${name} is not listed in ${registry.architectureIndex}`);
      }
    }
  }

  if (options.since) {
    const changed = changedFiles(options.since);
    for (const message of couplingFailures(changed, registry.couplings || [])) {
      errors.push(message);
    }
  }

  return errors;
}

function selfTest() {
  const failures = couplingFailures(
    [".cursor/automations/daily-ops-check.json"],
    [
      {
        when: [".cursor/automations/"],
        alsoTouch: [".state/AUTOMATION_CONTRACT.md"],
        message: "missing contract",
      },
    ],
  );
  const ok = couplingFailures(
    [".cursor/automations/daily-ops-check.json", ".state/AUTOMATION_CONTRACT.md"],
    [
      {
        when: [".cursor/automations/"],
        alsoTouch: [".state/AUTOMATION_CONTRACT.md"],
        message: "missing contract",
      },
    ],
  );
  if (failures.join() !== "missing contract" || ok.length !== 0) {
    console.error("self-test failed");
    process.exit(1);
  }
  console.log("docs-check self-test ok");
}

const argv = process.argv.slice(2);
if (argv.includes("--self-test")) {
  selfTest();
  process.exit(0);
}

const sinceFlag = argv.indexOf("--since");
const since = sinceFlag >= 0 ? argv[sinceFlag + 1] : null;
if (sinceFlag >= 0 && !since) {
  console.error("docs-check: --since needs a git ref");
  process.exit(1);
}

const registry = readJson("docs/ops/doc-registry.json");
let errors = [];
try {
  errors = check(registry, { since });
} catch (error) {
  console.error(`docs-check: ${error.message}`);
  process.exit(1);
}

if (errors.length) {
  console.error(`docs-check failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(since ? `docs-check ok (since ${since})` : "docs-check ok");
