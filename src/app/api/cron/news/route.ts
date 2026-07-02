import { NextResponse, type NextRequest } from "next/server";
import { refreshNewsCache } from "@/lib/news/fetcher";

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
    const cache = await refreshNewsCache();
    return NextResponse.json({
      ok: true,
      generatedAt: cache.generatedAt,
      count: cache.count,
    });
  } catch (err) {
    console.error("[cron/news] refresh failed:", err);
    return NextResponse.json(
      { ok: false, error: "refresh_failed" },
      { status: 500 },
    );
  }
}

// Vercel Cron triggers via GET; POST supported for manual/local triggers.
export const GET = handle;
export const POST = handle;
