import { NextResponse, type NextRequest } from "next/server";
import { runNewsletterPipeline } from "@/lib/newsletter/run";
import { readNewsletterDraft } from "@/lib/newsletter/store-remote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
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

  const force = req.nextUrl.searchParams.get("force") === "1";
  const send = req.nextUrl.searchParams.get("send") !== "0";
  const notify = req.nextUrl.searchParams.get("notify") !== "0";

  try {
    const existing = await readNewsletterDraft();
    const result = await runNewsletterPipeline({
      force,
      send,
      notify,
      existingDraft: existing,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error("[cron/newsletter] failed:", err);
    const message = err instanceof Error ? err.message : "newsletter_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
