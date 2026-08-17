import type { NextRequest } from "next/server";
import { confirmSubscriber } from "@/lib/newsletter/resend";
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
      `<p>This confirmation link is ${escapeHtml(verified.error.replace(/_/g, " "))}.</p>
       <p>Request a new one from <a href="${escapeHtml(siteBaseUrl())}/newsletter">/newsletter</a>.</p>`,
      false,
    );
  }
  if (verified.action !== "confirm") {
    return htmlPage(
      "Wrong link",
      `<p>This token cannot confirm a subscription.</p>`,
      false,
    );
  }

  const result = await confirmSubscriber(verified.email);
  if (!result.ok) {
    return htmlPage(
      "Could not confirm",
      `<p>${escapeHtml(result.reason)}</p>`,
      false,
      502,
    );
  }

  return htmlPage(
    "You're on the list",
    `<p>Confirmed <strong>${escapeHtml(verified.email)}</strong>.</p>
     <p><a href="${escapeHtml(siteBaseUrl())}/newsletter">Back to newsletter</a></p>`,
    true,
  );
}
