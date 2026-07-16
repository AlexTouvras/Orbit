/**
 * Weekly Write CLI
 *
 *   npm run weekly:draft              # generate (IDE brief if Gemini fails)
 *   npm run weekly:notify             # generate + Slack (or IDE brief)
 *   npm run weekly:notify-draft       # Slack an existing IDE/local draft
 *   npm run weekly:notify -- --force  # replace pending draft
 *   npm run weekly:notify -- --allow-local-fallback  # Ollama/template if Gemini fails
 */
import {
  notifyExistingWeeklyDraft,
  runWeeklyWritePipeline,
} from "../lib/weekly-write/run";

async function main() {
  const args = new Set(process.argv.slice(2));
  const notifyOnly = args.has("--notify-only");
  const notify = args.has("--notify") || notifyOnly;
  const force = args.has("--force");
  const allowLocalFallback = args.has("--allow-local-fallback");

  const result = notifyOnly
    ? await notifyExistingWeeklyDraft()
    : await runWeeklyWritePipeline({ notify, force, allowLocalFallback });

  console.log(JSON.stringify(result, null, 2));

  if (result.awaitingIde) {
    console.error(
      "\n[weekly-write] Open data/weekly-write-ide-brief.md in Cursor, write the essay, then: npm run weekly:notify-draft\n",
    );
  }

  if (!result.ok) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
