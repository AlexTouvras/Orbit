const SHARED_TEST_SENDER = /onboarding@resend\.dev/i;

/** Resend's shared test sender is refused. Inboxes file it as spam. */
export function isSharedTestSender(from: string): boolean {
  return SHARED_TEST_SENDER.test(from);
}

/**
 * Contact and appointment mail use a From address on our domain.
 * An explicit contact sender wins. Otherwise the newsletter sender.
 * The shared test address is skipped in either slot.
 */
export function resolveVerifiedFrom(
  contactFrom: string | undefined,
  newsletterFrom: string | undefined,
): string {
  const contact = (contactFrom ?? "").trim().replace(/^["']|["']$/g, "");
  const newsletter = (newsletterFrom ?? "").trim().replace(/^["']|["']$/g, "");
  if (contact && !isSharedTestSender(contact)) return contact;
  if (newsletter && !isSharedTestSender(newsletter)) return newsletter;
  return "";
}
