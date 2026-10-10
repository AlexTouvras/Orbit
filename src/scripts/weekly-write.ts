/**
 * Weekly Write CLI
 *
 *   npm run weekly:draft              # intake + IDE brief (Cursor writes the essay)
 *   npm run weekly:notify             # force a new IDE brief
 *   npm run weekly:notify-draft       # Slack an existing IDE/local draft
 *   npm run weekly:draft -- --allow-local-fallback  # Ollama, then OpenAI, then a template
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
