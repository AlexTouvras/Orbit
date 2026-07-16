import fs from "node:fs";
import path from "node:path";
import { repairDraftTextFields } from "@/lib/weekly-write/text-encoding";
import type { WeeklyDraft } from "@/lib/weekly-write/types";

export const WEEKLY_DRAFT_RELATIVE_PATH = "data/weekly-write-draft.json";
const LOCAL_PATH = path.join(process.cwd(), WEEKLY_DRAFT_RELATIVE_PATH);

function parseDraft(raw: string): WeeklyDraft | null {
  try {
    const parsed = JSON.parse(raw) as WeeklyDraft;
    if (!parsed?.id || !parsed?.mdx || !parsed?.status) return null;
    return repairDraftTextFields(parsed);
  } catch {
    return null;
  }
}

/** Read draft from the local working tree (CLI / after deploy). */
export function readWeeklyDraftFs(): WeeklyDraft | null {
  try {
    if (!fs.existsSync(LOCAL_PATH)) return null;
    return parseDraft(fs.readFileSync(LOCAL_PATH, "utf8"));
  } catch {
    return null;
  }
}

/** Write draft JSON to the local working tree. */
export function writeWeeklyDraftFs(draft: WeeklyDraft): void {
  fs.mkdirSync(path.dirname(LOCAL_PATH), { recursive: true });
  const cleaned = repairDraftTextFields(draft);
  fs.writeFileSync(LOCAL_PATH, `${JSON.stringify(cleaned, null, 2)}\n`, "utf8");
}

export function parseWeeklyDraftJson(raw: string): WeeklyDraft | null {
  return parseDraft(raw);
}
