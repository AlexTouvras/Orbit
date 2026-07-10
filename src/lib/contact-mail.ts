import "server-only";
import { getEditableProfile } from "@/lib/profile-store";

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

function normalizeSecret(value: string | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, "");
}

export async function sendContactEmail(
  payload: ContactPayload,
): Promise<
  | { ok: true }
  | { ok: false; reason: "not_configured" | "invalid_key" | "send_failed"; detail?: string }
> {
  const apiKey = normalizeSecret(process.env.RESEND_API_KEY);
  if (!apiKey) {
    return { ok: false, reason: "not_configured" };
  }
  if (!apiKey.startsWith("re_")) {
    return {
      ok: false,
      reason: "invalid_key",
      detail:
        "RESEND_API_KEY on Vercel should start with re_ — create a new key at resend.com/api-keys.",
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
