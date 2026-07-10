import "server-only";
import { getEditableProfile } from "@/lib/profile-store";

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false; reason: "not_configured" | "send_failed" }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: "not_configured" };
  }

  const to = process.env.CONTACT_TO_EMAIL?.trim() || getEditableProfile().email;
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Orbit Contact <onboarding@resend.dev>";

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
    console.error("Resend contact email failed:", await res.text());
    return { ok: false, reason: "send_failed" };
  }

  return { ok: true };
}
