import "server-only";
import { getEditableProfile } from "@/lib/profile-store";
import {
  subscribeConfigured,
  type NewsletterResendConfig,
} from "@/lib/newsletter/config";
import { newsletterConfirmUrl } from "@/lib/newsletter/tokens";

type ResendResult =
  | { ok: true; id?: string }
  | { ok: false; reason: string; status?: number };

interface ResendContact {
  id?: string;
  email?: string;
  unsubscribed?: boolean;
}

function headers(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function resendJson(
  apiKey: string,
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: { ...headers(apiKey), ...init?.headers },
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

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export async function sendConfirmEmail(email: string): Promise<ResendResult> {
  const ready = subscribeConfigured();
  if (!ready.ok) return ready;
  const { apiKey, from } = ready.config;
  const confirmUrl = newsletterConfirmUrl(email);
  const profile = getEditableProfile();

  const { status, body } = await resendJson(apiKey, "/emails", {
    method: "POST",
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: profile.email,
      subject: "Confirm your Orbit weekly digest",
      text: `Confirm your subscription to the Orbit weekly digest:\n\n${confirmUrl}\n\nIf you did not request this, ignore this email.`,
      html: `<p>Confirm your subscription to the Orbit weekly digest.</p>
<p><a href="${confirmUrl}">Confirm subscription</a></p>
<p style="color:#64748b;font-size:13px">If you did not request this, ignore this email.</p>`,
    }),
  });

  if (status >= 200 && status < 300) {
    const id =
      body && typeof body === "object" && "id" in body
        ? String((body as { id?: unknown }).id ?? "")
        : undefined;
    return { ok: true, id };
  }

  console.error("[newsletter] confirm email failed:", status, body);
  return {
    ok: false,
    reason: errorMessage(body, "Could not send confirmation email."),
    status,
  };
}

async function getAudienceContact(
  config: NewsletterResendConfig,
  email: string,
): Promise<ResendContact | null> {
  const encoded = encodeURIComponent(email);
  const audience = await resendJson(
    config.apiKey,
    `/audiences/${config.audienceId}/contacts/${encoded}`,
  );
  if (audience.status >= 200 && audience.status < 300) {
    return audience.body as ResendContact;
  }
  const global = await resendJson(config.apiKey, `/contacts/${encoded}`);
  if (global.status >= 200 && global.status < 300) {
    return global.body as ResendContact;
  }
  return null;
}

export async function isAlreadySubscribed(email: string): Promise<boolean> {
  const ready = subscribeConfigured();
  if (!ready.ok) return false;
  const contact = await getAudienceContact(ready.config, email);
  return Boolean(contact && contact.unsubscribed === false);
}

async function addToAudience(
  config: NewsletterResendConfig,
  email: string,
): Promise<ResendResult> {
  const createAudience = await resendJson(
    config.apiKey,
    `/audiences/${config.audienceId}/contacts`,
    {
      method: "POST",
      body: JSON.stringify({ email, unsubscribed: false }),
    },
  );
  if (createAudience.status >= 200 && createAudience.status < 300) {
    return { ok: true };
  }
  if (createAudience.status === 409) {
    const patch = await resendJson(
      config.apiKey,
      `/audiences/${config.audienceId}/contacts/${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ unsubscribed: false }),
      },
    );
    if (patch.status >= 200 && patch.status < 300) return { ok: true };
  }

  const createGlobal = await resendJson(config.apiKey, "/contacts", {
    method: "POST",
    body: JSON.stringify({
      email,
      unsubscribed: false,
      segments: [{ id: config.audienceId }],
    }),
  });
  if (createGlobal.status >= 200 && createGlobal.status < 300) {
    return { ok: true };
  }
  if (createGlobal.status === 409) {
    const patchGlobal = await resendJson(
      config.apiKey,
      `/contacts/${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          unsubscribed: false,
          segments: [{ id: config.audienceId }],
        }),
      },
    );
    if (patchGlobal.status >= 200 && patchGlobal.status < 300) return { ok: true };
    return {
      ok: false,
      reason: errorMessage(patchGlobal.body, "Could not update contact."),
      status: patchGlobal.status,
    };
  }

  return {
    ok: false,
    reason: errorMessage(
      createAudience.body,
      errorMessage(createGlobal.body, "Could not add contact."),
    ),
    status: createGlobal.status || createAudience.status,
  };
}

export async function confirmSubscriber(email: string): Promise<ResendResult> {
  const ready = subscribeConfigured();
  if (!ready.ok) return ready;
  return addToAudience(ready.config, email);
}

export async function unsubscribeSubscriber(
  email: string,
): Promise<ResendResult> {
  const ready = subscribeConfigured();
  if (!ready.ok) return ready;
  const { apiKey, audienceId } = ready.config;
  const encoded = encodeURIComponent(email);

  const audience = await resendJson(
    apiKey,
    `/audiences/${audienceId}/contacts/${encoded}`,
    {
      method: "PATCH",
      body: JSON.stringify({ unsubscribed: true }),
    },
  );
  if (audience.status >= 200 && audience.status < 300) return { ok: true };

  const global = await resendJson(apiKey, `/contacts/${encoded}`, {
    method: "PATCH",
    body: JSON.stringify({ unsubscribed: true }),
  });
  if (global.status >= 200 && global.status < 300) return { ok: true };

  if (audience.status === 404 && global.status === 404) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: errorMessage(global.body, "Could not unsubscribe."),
    status: global.status,
  };
}
