import fs from "node:fs";
import path from "node:path";
import type { NewsletterDigest } from "@/lib/newsletter/types";

export const NEWSLETTER_DRAFT_RELATIVE_PATH = "data/newsletter-draft.json";
const LOCAL_PATH = path.join(process.cwd(), NEWSLETTER_DRAFT_RELATIVE_PATH);

function parseDigest(raw: string): NewsletterDigest | null {
  try {
    const parsed = JSON.parse(raw) as NewsletterDigest;
    if (!parsed?.id || !parsed?.status || !parsed?.subject) return null;
    if (!Array.isArray(parsed.writes) || !Array.isArray(parsed.signals)) {
      return null;
    }
    return {
      ...parsed,
      ravens: Array.isArray(parsed.ravens) ? parsed.ravens : [],
    };
  } catch {
    return null;
  }
}

export function readNewsletterDraftFs(): NewsletterDigest | null {
  try {
    if (!fs.existsSync(LOCAL_PATH)) return null;
    return parseDigest(fs.readFileSync(LOCAL_PATH, "utf8"));
  } catch {
    return null;
  }
}

export function writeNewsletterDraftFs(draft: NewsletterDigest): void {
  fs.mkdirSync(path.dirname(LOCAL_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_PATH, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
}

export function parseNewsletterDraftJson(raw: string): NewsletterDigest | null {
  return parseDigest(raw);
}
