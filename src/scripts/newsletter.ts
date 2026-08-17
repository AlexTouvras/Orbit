/**
 * Weekly digest CLI
 *
 *   npm run newsletter:draft              # assemble only (no send)
 *   npm run newsletter:notify             # assemble + send + Slack FYI
 *   npm run newsletter:notify -- --force  # resend even if already sent this week
 */
import { runNewsletterPipeline } from "../lib/newsletter/run";

async function main() {
  const args = new Set(process.argv.slice(2));
  const notify = args.has("--notify");
  const force = args.has("--force");

  const result = await runNewsletterPipeline({
    force,
    send: notify,
    notify,
  });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
