import { NextResponse } from "next/server";
import { readNewsCache } from "@/lib/news/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Returns the cached news payload for client-side filtering. No external calls. */
export function GET() {
  const cache = readNewsCache();
  return NextResponse.json(cache, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
