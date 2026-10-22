/**
 * Slugs that use the scrolling volume reader.
 * Keep this in step with `Handbook.reader === "volume"`.
 * Chrome decides from the URL, before the page content is chosen.
 */
export const VOLUME_READER_SLUGS = ["data-that-drives-decisions"] as const;

export function isVolumeReaderSlug(slug: string): boolean {
  return (VOLUME_READER_SLUGS as readonly string[]).includes(slug);
}

export function isVolumeReaderPath(pathname: string): boolean {
  const match = pathname.match(/^\/handbooks\/([^/]+)\/[1-9]\d*$/);
  return Boolean(match && isVolumeReaderSlug(match[1]));
}
