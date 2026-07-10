import "server-only";
import { getEditableProfile } from "@/lib/profile-store";

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

/** Web3Forms — free, works on Vercel with one access key (web3forms.com). */
async function sendViaWeb3Forms(payload: ContactPayload): Promise<SendResult> {
  const accessKey = normalizeSecret(process.env.WEB3FORMS_ACCESS_KEY);
  if (!accessKey) {
    return { ok: false, reason: "not_configured" };
  }

  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: accessKey,
      from_name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.company
        ? `Company: ${payload.company}\n\n${payload.message}`
        : payload.message,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
  };

  if (data.success) return { ok: true };

  console.error("Web3Forms contact failed:", data);
  return {
    ok: false,
    reason: "send_failed",
    detail: data.message ?? "Web3Forms could not send the message.",
  };
}

async function sendViaResend(payload: ContactPayload): Promise<SendResult> {
  const apiKey = normalizeSecret(process.env.RESEND_API_KEY);
  if (!apiKey) {
    return { ok: false, reason: "not_configured" };
  }
  if (!apiKey.startsWith("re_")) {
    return {
      ok: false,
      reason: "invalid_key",
      detail:
        "RESEND_API_KEY should start with re_ — or use WEB3FORMS_ACCESS_KEY instead.",
    };
  }

  const to = normalizeSecret(process.env.CONTACT_TO_EMAIL) || getEditableProfile().email;
  const from = normalizeSecret(process.env.CONTACT_FROM_EMAIL) || "onboarding@resend.dev";
  const companyLine = payload.company ? `\nCompany: ${payload.company}` : "";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject: `[Orbit] ${payload.subject}`,
      text: `From: ${payload.name} <${payload.email}>${companyLine}\n\n${payload.message}`,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Resend contact email failed:", errText);
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

export async function sendContactEmail(payload: ContactPayload): Promise<SendResult> {
  // Web3Forms is simpler on Vercel — use it when configured.
  if (normalizeSecret(process.env.WEB3FORMS_ACCESS_KEY)) {
    return sendViaWeb3Forms(payload);
  }
  return sendViaResend(payload);
}
