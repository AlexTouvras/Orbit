import "server-only";
import { getEditableProfile } from "@/lib/profile-store";
import { resolveVerifiedFrom } from "@/lib/mail-from";

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

type SendResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "invalid_key" | "send_failed"; detail?: string };

function normalizeSecret(value: string | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, "");
}

function verifiedFrom(): string {
  return resolveVerifiedFrom(
    process.env.CONTACT_FROM_EMAIL,
    process.env.RESEND_NEWSLETTER_FROM,
  );
}

/** Inbox that receives contact messages and appointment notices. */
export function ownerInbox(): string {
  return normalizeSecret(process.env.CONTACT_TO_EMAIL) || getEditableProfile().email;
}

const FROM_MISSING =
  "Set RESEND_NEWSLETTER_FROM or CONTACT_FROM_EMAIL to an address on alextouvras.com. onboarding@resend.dev is refused because inboxes file it as spam.";

async function postResend(body: Record<string, unknown>): Promise<SendResult> {
  const apiKey = normalizeSecret(process.env.RESEND_API_KEY);
  if (!apiKey) return { ok: false, reason: "not_configured" };
  if (!apiKey.startsWith("re_")) {
    return {
      ok: false,
      reason: "invalid_key",
      detail: "RESEND_API_KEY should start with re_.",
    };
  }

  const from = verifiedFrom();
  if (!from) {
    return { ok: false, reason: "not_configured", detail: FROM_MISSING };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...body, from }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Resend email failed:", errText);
    let detail: string | undefined;
    try {
      const parsed = JSON.parse(errText) as { message?: string };
      detail = parsed.message;
    } catch {
      detail = undefined;
    }
    return { ok: false, reason: "send_failed", detail };
  }

  return { ok: true };
}

export async function sendPlainEmail(input: {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}): Promise<SendResult> {
  const body: Record<string, unknown> = {
    to: [input.to],
    subject: input.subject,
    text: input.text,
  };
  if (input.replyTo) body.reply_to = input.replyTo;
  return postResend(body);
}

async function sendViaResend(payload: ContactPayload): Promise<SendResult> {
  const to = ownerInbox();
  if (!to) {
    return {
      ok: false,
      reason: "not_configured",
      detail: "Set CONTACT_TO_EMAIL or a profile email.",
    };
  }

  const companyLine = payload.company ? `\nCompany: ${payload.company}` : "";
  return sendPlainEmail({
    to,
    replyTo: payload.email,
    subject: `[Orbit] ${payload.subject}`,
    text: `From: ${payload.name} <${payload.email}>${companyLine}\n\n${payload.message}`,
  });
}

export async function sendContactEmail(payload: ContactPayload): Promise<SendResult> {
  return sendViaResend(payload);
}
