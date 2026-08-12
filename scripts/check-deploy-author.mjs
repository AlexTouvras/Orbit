#!/usr/bin/env node
import { execSync } from "node:child_process";

const DEFAULT_ALLOWED = [
  "92086651+AlexTouvras@users.noreply.github.com",
  "41898282+github-actions[bot]@users.noreply.github.com",
];

function allowedEmails() {
  const extra = process.env.DEPLOY_AUTHOR_EMAIL?.trim();
  return extra ? [...DEFAULT_ALLOWED, extra] : DEFAULT_ALLOWED;
}

function latestCommitAuthor() {
  const out = execSync('git log -1 --format="%ae"', {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  return out.replace(/^"|"$/g, "");
}

const email = latestCommitAuthor();
const allowed = allowedEmails();
const ok = allowed.some((a) => a.toLowerCase() === email.toLowerCase());
const strict = process.env.SHIP_CHECK_STRICT !== "0";

if (ok) {
  console.log(`deploy-author ok: ${email}`);
  process.exit(0);
}

const msg = `deploy-author blocked: ${email} (allowed: ${allowed.join(", ")})`;
if (strict) {
  console.error(msg);
  process.exit(1);
}
console.warn(`WARN ${msg}`);
