/** Orbit structure smoke (filename legacy from JARVIS Debug; not a foreman dependency). */
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "package.json",
  "src/app",
  "architecture-projects.json",
  "PROJECT_CHARTER.md",
];
const missing = required.filter((rel) => !existsSync(join(root, rel)));
if (missing.length) {
  console.error("FAIL missing:", missing.join(", "));
  process.exit(1);
}
console.log("ok orbit smoke");
