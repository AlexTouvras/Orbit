/**
 * Standalone news fetcher for host-agnostic scheduling.
 *
 *   npm run news:fetch    # one-shot fetch, writes the cache, exits
 *   npm run news:watch    # runs now, then daily via node-cron
 *
 * On Vercel, prefer the Cron-triggered route handler at /api/cron/news instead.
 */
import cron from "node-cron";
import { refreshNewsCache } from "@/lib/news/fetcher";

const SCHEDULE = "0 6 * * *"; // daily at 06:00 UTC

async function runOnce() {
  const startedAt = Date.now();
  console.log(`[news] fetching feeds @ ${new Date().toISOString()}`);
  try {
    const cache = await refreshNewsCache();
    console.log(
      `[news] wrote ${cache.count} items in ${Date.now() - startedAt}ms`,
    );
  } catch (err) {
    console.error("[news] fetch failed:", err);
  }
}

async function main() {
  const once = process.argv.includes("--once");

  await runOnce();

  if (once) {
    process.exit(0);
  }

  console.log(`[news] scheduling refresh (${SCHEDULE})`);
  cron.schedule(SCHEDULE, runOnce);
}

void main();
