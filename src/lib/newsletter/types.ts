import type { NewsCategory } from "@/lib/types";

export type NewsletterDigestStatus = "pending" | "sent" | "skipped";

export interface NewsletterWriteItem {
  slug: string;
  title: string;
  summary: string;
  date: string;
  href: string;
}

export interface NewsletterSignalItem {
  title: string;
  link: string;
  source: string;
  category: NewsCategory;
  snippet: string;
}

export type NewsletterRavenKind = "knowledge" | "signal" | "inbox";

/** One Muninn note, watching signal, or leftover Huginn finding. */
export interface NewsletterRavenItem {
  kind: NewsletterRavenKind;
  domain: string;
  title: string;
  summary: string;
  href?: string;
  sourceTitle?: string;
  id?: string;
  date?: string;
  priority?: string;
}

export interface NewsletterDigest {
  id: string;
  status: NewsletterDigestStatus;
  createdAt: string;
  weekOf: string;
  subject: string;
  lede: string;
  writes: NewsletterWriteItem[];
  signals: NewsletterSignalItem[];
  ravens: NewsletterRavenItem[];
  sentAt?: string;
  skippedAt?: string;
  broadcastId?: string;
  /** `test` = single address via RESEND_NEWSLETTER_TEST_TO; `broadcast` = Resend audience. */
  sendMode?: "test" | "broadcast";
  sentTo?: string;
}
