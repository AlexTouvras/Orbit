import { NextResponse } from "next/server";
import { readNewsCacheRemote } from "@/lib/news/cache-remote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Returns the cached news payload for client-side filtering. No external calls. */
export async function GET() {
  const cache = await readNewsCacheRemote();
  return NextResponse.json(cache, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
