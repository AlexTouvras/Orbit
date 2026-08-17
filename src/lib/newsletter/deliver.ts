import { profile } from "@/content/profile";
import { sendConfigured } from "@/lib/newsletter/config";
import { renderDigestHtml, renderDigestText } from "@/lib/newsletter/email";
import { newsletterUnsubscribeUrl } from "@/lib/newsletter/tokens";
import type { NewsletterDigest } from "@/lib/newsletter/types";

type DeliverResult =
  | {
      ok: true;
      id?: string;
      mode: "test" | "broadcast";
      sentTo?: string;
    }
  | { ok: false; reason: string };

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

async function resendJson(
  apiKey: string,
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const text = await res.text();
  let body: unknown = {};
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = { message: text };
    }
  }
  return { status: res.status, body };
}

function contactsFromList(body: unknown): { unsubscribed?: boolean }[] {
  if (!body || typeof body !== "object") return [];
  const data = (body as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  return data as { unsubscribed?: boolean }[];
}

async function countSubscribed(
  apiKey: string,
  audienceId: string,
): Promise<{ ok: true; count: number } | { ok: false; reason: string }> {
  const audience = await resendJson(apiKey, `/audiences/${audienceId}/contacts`);
  if (audience.status >= 200 && audience.status < 300) {
    const count = contactsFromList(audience.body).filter(
      (c) => c.unsubscribed !== true,
    ).length;
    return { ok: true, count };
  }
  const global = await resendJson(apiKey, "/contacts");
  if (global.status >= 200 && global.status < 300) {
    const count = contactsFromList(global.body).filter(
      (c) => c.unsubscribed !== true,
    ).length;
    return { ok: true, count };
  }
  return {
    ok: false,
    reason: errorMessage(
      audience.body,
      "Could not read Resend audience — refusing to send.",
    ),
  };
}

/** Auto-send: test inbox if TEST_TO is set, otherwise Resend Broadcast. No Slack Approve. */
export async function deliverDigest(
  digest: NewsletterDigest,
): Promise<DeliverResult> {
  const ready = sendConfigured();
  if (!ready.ok) return ready;

  if (ready.mode === "test") {
    const html = renderDigestHtml(digest, {
      unsubscribeUrl: newsletterUnsubscribeUrl(ready.testTo),
      testBanner: true,
    });
    const text = renderDigestText(digest, {
      unsubscribeUrl: newsletterUnsubscribeUrl(ready.testTo),
      testBanner: true,
    });
    const { status, body } = await resendJson(ready.config.apiKey, "/emails", {
      method: "POST",
      body: JSON.stringify({
        from: ready.config.from,
        to: [ready.testTo],
        reply_to: profile.email,
        subject: `[test] ${digest.subject}`,
        html,
        text,
      }),
    });
    if (status >= 200 && status < 300) {
      const id =
        body && typeof body === "object" && "id" in body
          ? String((body as { id?: unknown }).id ?? "")
          : undefined;
      return { ok: true, id, mode: "test", sentTo: ready.testTo };
    }
    return {
      ok: false,
      reason: errorMessage(body, "Could not send the test digest."),
    };
  }

  const counted = await countSubscribed(
    ready.config.apiKey,
    ready.config.audienceId,
  );
  if (!counted.ok) return counted;
  if (counted.count === 0) {
    return { ok: false, reason: "Resend audience is empty — refusing to send." };
  }

  const html = renderDigestHtml(digest);
  const text = renderDigestText(digest);
  const payload = {
    from: ready.config.from,
    subject: digest.subject,
    html,
    text,
    reply_to: profile.email,
    send: true,
    name: digest.subject,
  };

  const withSegment = await resendJson(ready.config.apiKey, "/broadcasts", {
    method: "POST",
    body: JSON.stringify({ ...payload, segment_id: ready.config.audienceId }),
  });
  if (withSegment.status >= 200 && withSegment.status < 300) {
    const id =
      withSegment.body &&
      typeof withSegment.body === "object" &&
      "id" in withSegment.body
        ? String((withSegment.body as { id?: unknown }).id ?? "")
        : undefined;
    return { ok: true, id, mode: "broadcast" };
  }

  const withAudience = await resendJson(ready.config.apiKey, "/broadcasts", {
    method: "POST",
    body: JSON.stringify({ ...payload, audience_id: ready.config.audienceId }),
  });
  if (withAudience.status >= 200 && withAudience.status < 300) {
    const id =
      withAudience.body &&
      typeof withAudience.body === "object" &&
      "id" in withAudience.body
        ? String((withAudience.body as { id?: unknown }).id ?? "")
        : undefined;
    return { ok: true, id, mode: "broadcast" };
  }

  return {
    ok: false,
    reason: errorMessage(
      withAudience.body,
      errorMessage(withSegment.body, "Resend could not send the broadcast."),
    ),
  };
}
