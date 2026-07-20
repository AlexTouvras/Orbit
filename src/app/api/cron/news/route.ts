import { NextResponse, type NextRequest } from "next/server";
import { persistDataJson } from "@/lib/data-persist";
import { readNewsCache, writeNewsCache } from "@/lib/news/cache";
import {
  fetchAllNews,
  sameNewsItems,
} from "@/lib/news/fetcher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Allow up to 60s for all feeds to respond (Vercel function max on hobby).
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // If no secret is configured (local dev), allow the call.
  if (!secret) return true;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const qp = req.nextUrl.searchParams.get("secret");
  return qp === secret;
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cache = await fetchAllNews();
    const previous = readNewsCache();
    const unchanged = Boolean(
      previous.generatedAt && sameNewsItems(previous, cache),
    );
    const next = unchanged
      ? { ...previous, generatedAt: cache.generatedAt }
      : cache;

    let viaGithub = false;
    if (process.env.VERCEL) {
      // Ephemeral FS — commit so the next deploy ships the new cache.
      const result = await persistDataJson(
        "data/news-cache.json",
        next,
        unchanged
          ? "chore: touch news cache sweep time [skip ci]"
          : "chore: refresh news cache [skip ci]",
      );
      viaGithub = result.viaGithub;
    } else {
      writeNewsCache(next);
    }

    return NextResponse.json({
      ok: true,
      generatedAt: next.generatedAt,
      count: next.count,
      viaGithub,
      unchanged,
    });
  } catch (err) {
    console.error("[cron/news] refresh failed:", err);
    const message = err instanceof Error ? err.message : "refresh_failed";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}

// Vercel Cron triggers via GET; POST supported for manual/local triggers.
export const GET = handle;
export const POST = handle;
