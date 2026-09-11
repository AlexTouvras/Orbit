import type { Write } from "@/lib/types";
import { getSiteUrl } from "@/lib/site";

/** ISO date used for freshness: optional `updated`, else publish `date`. */
export function getWriteModifiedDate(write: Pick<Write, "date" | "updated">): string {
  return write.updated?.trim() || write.date;
}

export function writePath(slug: string): string {
  return `/writes/${slug}`;
}

export function writeAbsoluteUrl(slug: string): string {
  return `${getSiteUrl()}${writePath(slug)}`;
}

/** Absolute OG image URL for a Write (App Router file convention). */
export function writeOgImageUrl(slug: string): string {
  return `${getSiteUrl()}${writePath(slug)}/opengraph-image`;
}

export function siteOgImageUrl(): string {
  return `${getSiteUrl()}/opengraph-image`;
}
