/**
 * Every handbook chapter uses the scrolling paper reader.
 * Chrome decides from the URL, before the page content is chosen.
 */
export function isVolumeReaderPath(pathname: string): boolean {
  return /^\/handbooks\/[^/]+\/[1-9]\d*$/.test(pathname);
}
