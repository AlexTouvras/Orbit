function normalizeSecret(value: string | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, "");
}

export interface NewsletterResendConfig {
  apiKey: string;
  from: string;
  audienceId: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getNewsletterResendConfig(): NewsletterResendConfig {
  return {
    apiKey: normalizeSecret(process.env.RESEND_API_KEY),
    from: (process.env.RESEND_NEWSLETTER_FROM ?? "").trim(),
    audienceId: normalizeSecret(process.env.RESEND_NEWSLETTER_AUDIENCE_ID),
  };
}

/** When set, digests mail only this address (validation). Unset = Resend audience. */
export function getNewsletterTestTo(): string {
  const raw = (process.env.RESEND_NEWSLETTER_TEST_TO ?? "").trim().toLowerCase();
  return isValidEmail(raw) ? raw : "";
}

export function isNewsletterTestMode(): boolean {
  return Boolean(getNewsletterTestTo());
}

export function isOnboardingFrom(from: string): boolean {
  return /onboarding@resend\.dev/i.test(from);
}

/** Subscribe + confirm need a key, from-address, and audience. */
export function subscribeConfigured():
  | { ok: true; config: NewsletterResendConfig }
  | { ok: false; reason: string } {
  const config = getNewsletterResendConfig();
  if (!config.apiKey) {
    return { ok: false, reason: "RESEND_API_KEY missing" };
  }
  if (!config.apiKey.startsWith("re_")) {
    return { ok: false, reason: "RESEND_API_KEY should start with re_" };
  }
  if (!config.from) {
    return { ok: false, reason: "RESEND_NEWSLETTER_FROM missing" };
  }
  if (!config.audienceId) {
    return { ok: false, reason: "RESEND_NEWSLETTER_AUDIENCE_ID missing" };
  }
  return { ok: true, config };
}

/** Test-to-self: API key + from + TEST_TO. Onboarding sender is allowed (Resend test mode). */
export function testSendConfigured():
  | { ok: true; config: NewsletterResendConfig; testTo: string }
  | { ok: false; reason: string } {
  const testTo = getNewsletterTestTo();
  if (!testTo) {
    return { ok: false, reason: "RESEND_NEWSLETTER_TEST_TO missing" };
  }
  const config = getNewsletterResendConfig();
  if (!config.apiKey) {
    return { ok: false, reason: "RESEND_API_KEY missing" };
  }
  if (!config.apiKey.startsWith("re_")) {
    return { ok: false, reason: "RESEND_API_KEY should start with re_" };
  }
  if (!config.from) {
    return { ok: false, reason: "RESEND_NEWSLETTER_FROM missing" };
  }
  return { ok: true, config, testTo };
}

/** Audience broadcasts require a verified domain — not Resend's onboarding sender. */
export function broadcastConfigured():
  | { ok: true; config: NewsletterResendConfig }
  | { ok: false; reason: string } {
  const ready = subscribeConfigured();
  if (!ready.ok) return ready;
  if (isOnboardingFrom(ready.config.from)) {
    return {
      ok: false,
      reason:
        "RESEND_NEWSLETTER_FROM cannot be onboarding@resend.dev — verify alextouvras.com in Resend",
    };
  }
  return ready;
}

/** Ready to auto-send: test-to if set, otherwise audience broadcast. */
export function sendConfigured():
  | { ok: true; mode: "test"; testTo: string; config: NewsletterResendConfig }
  | { ok: true; mode: "broadcast"; config: NewsletterResendConfig }
  | { ok: false; reason: string } {
  if (isNewsletterTestMode()) {
    const ready = testSendConfigured();
    if (!ready.ok) return ready;
    return { ok: true, mode: "test", testTo: ready.testTo, config: ready.config };
  }
  const ready = broadcastConfigured();
  if (!ready.ok) return ready;
  return { ok: true, mode: "broadcast", config: ready.config };
}
