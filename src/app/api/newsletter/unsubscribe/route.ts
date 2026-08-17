import type { NextRequest } from "next/server";
import { unsubscribeSubscriber } from "@/lib/newsletter/resend";
import { htmlPage, escapeHtml } from "@/lib/newsletter/html-page";
import { siteBaseUrl, verifyNewsletterEmailToken } from "@/lib/newsletter/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const verified = verifyNewsletterEmailToken(token);
  if ("error" in verified) {
    return htmlPage(
      "Link invalid",
      `<p>This unsubscribe link is ${escapeHtml(verified.error.replace(/_/g, " "))}.</p>`,
      false,
    );
  }
  if (verified.action !== "unsubscribe") {
    return htmlPage(
      "Wrong link",
      `<p>This token cannot unsubscribe.</p>`,
      false,
    );
  }

  const result = await unsubscribeSubscriber(verified.email);
  if (!result.ok) {
    return htmlPage(
      "Could not unsubscribe",
      `<p>${escapeHtml(result.reason)}</p>`,
      false,
      502,
    );
  }

  return htmlPage(
    "Unsubscribed",
    `<p><strong>${escapeHtml(verified.email)}</strong> is off the Orbit weekly digest.</p>
     <p>You can subscribe again at <a href="${escapeHtml(siteBaseUrl())}/newsletter">/newsletter</a>.</p>`,
    true,
  );
}
