const HOST_SUFFIXES = [
  "calendar.google.com",
  "outlook.office.com",
  "outlook.office365.com",
  "outlook.live.com",
  "icloud.com",
];

/** https feed on a known calendar host. Rejects anything else so the server cannot be pointed at an internal address. */
export function allowedCalendarFeedUrl(raw: string | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  const allowed = HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
  if (!allowed) return null;
  return url.toString();
}

/** One or more secret feeds. Separate addresses with a space. Invalid entries are counted, not fetched. */
export function calendarFeedUrls(raw: string | undefined): { urls: string[]; invalid: number } {
  const parts = (raw ?? "")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const urls: string[] = [];
  let invalid = 0;
  for (const part of parts) {
    const url = allowedCalendarFeedUrl(part);
    if (!url) {
      invalid += 1;
      continue;
    }
    if (!urls.includes(url)) urls.push(url);
  }
  return { urls, invalid };
}
