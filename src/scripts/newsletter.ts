/**
 * Weekly digest CLI
 *
 *   npm run newsletter:draft              # assemble only (no send)
 *   npm run newsletter:notify             # assemble + send email (no Slack)
 *   npm run newsletter:notify -- --force  # resend even if already sent this week
 *   … --slack                             # optional: also post send FYI to #orbit
 */
import { runNewsletterPipeline } from "../lib/newsletter/run";

async function main() {
  const args = new Set(process.argv.slice(2));
  const send = args.has("--notify") || args.has("--send");
  const force = args.has("--force");
  const slack = args.has("--slack");

  const result = await runNewsletterPipeline({
    force,
    send,
    notify: slack,
  });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
