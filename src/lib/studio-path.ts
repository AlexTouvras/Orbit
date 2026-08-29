/** Safe in-Studio redirect targets after login. */

const STUDIO_NEXT_RE = /^\/studio(?:\/[\w\-./]*)?(?:\?[\w\-.=&]*)?$/;

export function safeStudioPath(raw: string | null | undefined): string {
  if (!raw) return "/studio";
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    return "/studio";
  }
  if (value.length > 180) return "/studio";
  if (!STUDIO_NEXT_RE.test(value)) return "/studio";
  if (value.startsWith("/studio/login")) return "/studio";
  return value;
}
