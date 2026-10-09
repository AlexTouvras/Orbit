import fs from "node:fs";
import path from "node:path";
import type { WeeklyIntake } from "@/lib/weekly-write/types";
import type { EssayThesis } from "@/lib/weekly-write/thesis";

const DATA_DIR = path.join(process.cwd(), "data");
export const IDE_BRIEF_JSON = path.join(DATA_DIR, "weekly-write-ide-brief.json");
export const IDE_BRIEF_MD = path.join(DATA_DIR, "weekly-write-ide-brief.md");
export const WEEKLY_WRITE_LOG = path.join(DATA_DIR, "weekly-write.log");

export interface IdeBrief {
  status: "awaiting_ide";
  reason: string;
  createdAt: string;
  weekOf: string;
  thesis: EssayThesis | null;
  intake: WeeklyIntake;
  instructions: string[];
}

export function appendWeeklyWriteLog(line: string): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const stamp = new Date().toISOString();
  fs.appendFileSync(WEEKLY_WRITE_LOG, `[${stamp}] ${line}\n`, "utf8");
}

/** Write a local brief so Cursor IDE can generate the essay, then Slack-notify. */
export function writeIdeBrief(options: {
  reason: string;
  intake: WeeklyIntake;
  thesis: EssayThesis | null;
}): IdeBrief {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const brief: IdeBrief = {
    status: "awaiting_ide",
    reason: options.reason,
    createdAt: new Date().toISOString(),
    weekOf: options.intake.weekOf,
    thesis: options.thesis,
    intake: options.intake,
    instructions: [
      "Open this repo in Cursor.",
      "Read data/weekly-write-ide-brief.md (and the JSON twin).",
      "Write one Orbit essay in the voice of src/content/writes/*.mdx (especially from-risk-to-delivery.mdx and building-orbit.mdx). Use the weekly-write-essay Cursor skill.",
      "Save the pending draft to data/weekly-write-draft.json (status pending, source ide).",
      "Run: npm run weekly:notify-draft",
      "Approve/Skip in Slack #career-ops as usual.",
    ],
  };

  fs.writeFileSync(IDE_BRIEF_JSON, `${JSON.stringify(brief, null, 2)}\n`, "utf8");
  fs.writeFileSync(IDE_BRIEF_MD, renderIdeBriefMarkdown(brief), "utf8");
  appendWeeklyWriteLog(
    `IDE brief written (${options.reason}) → ${path.basename(IDE_BRIEF_MD)}`,
  );

  return brief;
}

export function clearIdeBrief(): void {
  for (const p of [IDE_BRIEF_JSON, IDE_BRIEF_MD]) {
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {
      /* ignore */
    }
  }
}

export function readIdeBrief(): IdeBrief | null {
  try {
    if (!fs.existsSync(IDE_BRIEF_JSON)) return null;
    return JSON.parse(fs.readFileSync(IDE_BRIEF_JSON, "utf8")) as IdeBrief;
  } catch {
    return null;
  }
}

function renderIdeBriefMarkdown(brief: IdeBrief): string {
  const t = brief.thesis;
  const primary = t?.primary;
  const question = t?.question ?? "What is worth taking seriously from this week's Signals?";

  return `# Weekly Write — IDE generation needed

${brief.reason === "cloud_automation" ? "Cursor Cloud Automation writes this week's essay (Gemini skipped)." : "Gemini cloud generation failed or was unavailable."} **Generate the essay in Cursor**, then continue the normal Slack approve pipeline.

## Why

\`${brief.reason}\`

Created: ${brief.createdAt}  
Week of: ${brief.weekOf}

## Your job (in this IDE)

1. Write **one** focused Orbit essay (not a digest) inspired by the thesis below.
2. Match voice/structure of existing Writes (\`## The question\` … \`## Takeaway\`, 700–1000 words). Pass the hiring-manager story in \`docs/essay-voice.md\`: the reader can name the decision, what you rejected, and what stays unproven.
3. Save pending draft JSON to \`data/weekly-write-draft.json\` with \`source: "ide"\` and \`status: "pending"\`.
4. Run:

\`\`\`powershell
npm run weekly:notify-draft
\`\`\`

5. In Slack \`#career-ops\`, click **Approve & publish** or **Skip**.

## Thesis

- **Question:** ${question}
${
  primary
    ? `- **Primary inspiration:** [${primary.title}](${primary.link}) (${primary.source})
- **Snippet:** ${primary.snippet || "_none_"}`
    : "- _(No thesis ranked — pick the strongest Signal from intake.)_"
}
${
  t?.bridgeProject
    ? `- **Optional project bridge:** ${t.bridgeProject.name} — ${t.bridgeProject.description}`
    : "- **Project bridge:** none (do not force an unrelated WIP)"
}
- **Suggested category:** ${t?.category ?? "Learning"}
- **Suggested tags:** ${(t?.tags ?? []).join(", ") || "AI, Learning"}

## Intake (reference only)

### Signals
${brief.intake.signals
  .map((s) => `- [${s.title}](${s.link}) — ${s.source} (${s.category})`)
  .join("\n") || "- _none_"}

### Active projects
${brief.intake.projects
  .map((p) => `- **${p.name}** (${p.status}) — ${p.description}`)
  .join("\n") || "- _none_"}

## Draft JSON shape

Write \`data/weekly-write-draft.json\` like:

\`\`\`json
{
  "id": "ww-${brief.weekOf}-ide",
  "status": "pending",
  "createdAt": "<ISO now>",
  "weekOf": "${brief.weekOf}",
  "slug": "<from-title>",
  "title": "<essay title>",
  "summary": "<one sentence>",
  "category": "${t?.category ?? "Learning"}",
  "tags": [],
  "mdx": "---\\ntitle: \\"...\\"\\n...\\n---\\n\\n## The question\\n...",
  "preview": "<title + summary>",
  "intake": {},
  "source": "ide"
}
\`\`\`

Copy \`intake\` from \`data/weekly-write-ide-brief.json\`.

## Do not

- Do not Slack-notify until the essay draft JSON exists
- Do not write a weekly digest / "what I learned this week" list
- Do not invent project facts not in intake
`;
}
