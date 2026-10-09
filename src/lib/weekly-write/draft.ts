import { createHash, randomBytes } from "node:crypto";
import type { WriteCategory } from "@/lib/types";
import { repairUtf8Mojibake } from "@/lib/weekly-write/text-encoding";
import type { WeeklyDraft, WeeklyIntake } from "@/lib/weekly-write/types";
import {
  pickEssayThesis,
  type EssayThesis,
} from "@/lib/weekly-write/thesis";

export type WeeklyDraftSource =
  | "ollama"
  | "gemini"
  | "openai"
  | "template"
  | "ide";

export type CreateWeeklyDraftResult =
  | { status: "ready"; draft: WeeklyDraft }
  | {
      status: "awaiting_ide";
      reason: string;
      intake: WeeklyIntake;
      thesis: EssayThesis | null;
    };

type BuiltDraft = {
  title: string;
  summary: string;
  category: WriteCategory;
  tags: string[];
  slug: string;
  mdx: string;
  preview: string;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function looksLikeDigest(title: string, body: string): boolean {
  const t = title.toLowerCase();
  const b = body.toLowerCase();
  if (/^week of\b/.test(t)) return true;
  if (/what i learned this week/.test(t)) return true;
  if (/weekly (roundup|digest|recap|summary)/.test(t)) return true;
  if (/this week,? i (learned|explored|came across)/.test(b)) return true;
  if ((b.match(/^- \[/gm) || []).length >= 5) return true;
  if (/## what (i|we) shipped/.test(b) && /## what the field/.test(b))
    return true;
  // Shared template fingerprints — model should not regurgitate these.
  if (/capability is cheap\.\s*\*\*trust\*\* is expensive/i.test(b)) return true;
  if (/steal \*\*one constraint\*\* from the signal/i.test(b)) return true;
  return false;
}

function failsEssayQuality(title: string, body: string): string | null {
  if (looksLikeDigest(title, body)) return "digest_shape";
  if (!/^##\s+the question\b/im.test(body)) return "missing_the_question";
  const pipeLines = (body.match(/^\|/gm) || []).length;
  if (pipeLines >= 4) return "table_outline";
  const words = wordCount(body);
  if (words < 500) return "too_short";
  if (words > 1600) return "too_long";
  // Need real sectioning like published Writes.
  const headings = (body.match(/^##\s+/gm) || []).length;
  if (headings < 3) return "too_few_sections";
  return null;
}

function cite(s: { title: string; link: string; source: string }): string {
  return `[${s.title}](${s.link}) (${s.source})`;
}

function craftTitle(thesis: EssayThesis): string {
  const p = thesis.primary;
  const hay = `${p.title} ${p.snippet}`.toLowerCase();

  if (/isinscope|isatlevel|hierarchy|formatting/i.test(hay)) {
    return "Dynamic formatting is not a chart trick — it is a decision contract";
  }
  if (/agentic|agent investments|useful work per dollar/i.test(hay)) {
    return "Useful work per dollar — the metric agentic teams actually need";
  }
  if (/safety|governance|federal|alignment|red team/i.test(hay)) {
    return "AI safety outside the lab — what operating teams can actually own";
  }
  if (/power\s*bi|fabric|dashboard|semantic model|dax/i.test(hay)) {
    return "What changes when the reporting layer gets smarter than the meeting";
  }
  if (/data engineering|pipeline|warehouse/i.test(hay)) {
    return "When the data platform moves, which contracts should stay boring?";
  }

  // Fall back: short claim title, not "{news headline} — what actually matters"
  const short = p.title
    .replace(/\s+[—|:].*$/, "")
    .replace(/\.$/, "")
    .trim()
    .slice(0, 72);
  return `${short} — a working take`;
}

/** Topic-shaped essay scaffold — still a fallback, but not one reused paragraph block. */
function buildEssayFromThesis(thesis: EssayThesis, weekOf: string): BuiltDraft {
  const { primary, supporting, bridgeProject, question, category, tags } =
    thesis;
  const title = craftTitle(thesis);
  const summary = `An Orbit essay on ${primary.title}: what to take seriously, what to ignore, and how it lands in analytics and delivery work.`;
  const primaryCite = cite(primary);
  const support =
    supporting[0] != null
      ? `I am treating ${cite(supporting[0])} as adjacent reading, not a second thesis.`
      : "";

  const bridge = bridgeProject
    ? `On **${bridgeProject.name}**, the same pressure shows up in miniature: ${bridgeProject.description || "ship something durable without confusing novelty for progress."}`
    : `In my work the same split appears between **analytics judgment** and **delivery constraints**: a clever capability without an owner is still a demo.`;

  const hay = `${primary.title} ${primary.snippet}`.toLowerCase();
  let middle: string;

  if (/isinscope|isatlevel|hierarchy|power\s*bi|fabric|dax|dashboard|formatting/i.test(hay)) {
    middle = `## What was broken before

Most “reporting improvements” still look like more visuals. Another slicer. Another breakdown. Another meeting where half the time goes to reconciling definitions instead of deciding what to do.

Hierarchy formatting sounds cosmetic until you notice what it is really asking: **which grain of the number is allowed to speak**. Year, quarter, and month are not the same decision. If the visual cannot encode that, people invent their own stories in Excel.

## What this signal is actually about

${primaryCite} is useful because it treats formatting as a **rule at a level**, not a theme. That is closer to how risk and portfolio reviews already work: the question changes as you drill.

I do not care about the DAX trivia for its own sake. I care that the report can say, without a sidebar explanation: “at this level, here is the contract.”

## How I would use it on a Monday dashboard

1. **One decision per level.** Emerging risk at vintage level is not the same call as a segment blip at month level.
2. **Keep logic out of the canvas.** Prefer measures/views that own the rule; do not hide policy in twenty conditional format panes.
3. **Delete cleverness that needs a legend.** If an executive has to ask what the color means, the chart already lost.

${bridge}

## Mistakes I refuse to repeat

- Letting “just one more hierarchy” recreate the spreadsheet forest.
- Shipping dynamic format without a written definition of the metric at each grain.
- Optimizing for demo wow instead of **trust at 8 a.m.**

${support}

## Takeaway

Better Power BI is not denser Power BI. It is a report that makes the decision grain obvious — so the meeting can start at judgment, not archaeology.
`;
  } else if (/agentic|agent|useful work|investment/i.test(hay)) {
    middle = `## What people get wrong

“Add agents” is being sold the way “add a dashboard” used to be sold: as if the tool *is* the operating model. Teams then measure activity — tokens, runs, tickets closed — and wonder why nothing feels more legible.

${primaryCite} lands for me on a sharper idea: **useful work per dollar** (or per hour of human attention). That is closer to how I already think about portfolio analytics. Volume without a decision is noise.

## The operating model, not the demo

If agentic systems become a unit of work, the first change is not the model. It is the **definition of done**:

1. What decision or artifact did this loop improve?
2. Who owns the failure when it is wrong?
3. What eval or metric would falsify the hype next week?

Without those, you have an expensive autocomplete with a project plan.

I have watched the same failure mode in reporting organizations: a beautiful Fabric workspace with no metric owner, and a Monday meeting that turns into archaeology. Agents will recreate that pattern faster, because they can generate plausible work without improving the call.

## Where analytics and delivery should push back

Delivery leads should refuse agent workflows that cannot name a rollback. Analytics leads should refuse agent outputs that cannot name a definition. Same instinct as a credit dashboard: if two teams disagree on “delinquency,” the chart is a debate club.

Practically, that means writing three boring artifacts before the exciting demo:

- A one-page **scope**: what the agent may decide vs what a human must sign
- An **eval slice**: ten real cases where wrong is costly
- A **kill switch**: how we disable the loop without a war room

${bridge}

## How this changes what I ship

I am less interested in “an agent that writes SQL” than in a loop that makes the **decision contract** clearer: which grain of the number matters, which exception needs a human, which refresh failure is a release blocker. Orbit’s own automation bias is the same — Signals and drafts are useful only if they end in a publish decision with an owner.

## What I am deliberately not doing yet

Chasing every agent framework. Automating the meeting before the metric is stable. Treating a vendor narrative as a roadmap. Letting “useful work per dollar” become another vanity KPI with no definition doc.

${support}

## Takeaway

Agentic capability is interesting when it changes the **unit of useful work**. Until you can measure that — with owners, evals, and rollback — keep the agents in a sandbox and keep production boring on purpose.
`;
  } else if (/safety|governance|alignment|red team|federal/i.test(hay)) {
    middle = `## The question behind the headline

Lab-grade AI safety talk often never reaches the people who will actually ship something into a bank, a portfolio process, or an internal tool. ${primaryCite} is interesting as a reminder that governance is becoming an **operating concern**, not only a research paper.

## What “responsible” has to mean in delivery

Outside a lab, responsible means:

- A named owner for the system’s behavior
- A written scope for what the model is allowed to decide
- An eval or review loop that can fail a release
- A rollback that does not require heroics

If those are missing, “safety” is branding.

## The analytics parallel

We already know this pattern from reporting. A dashboard without metric ownership becomes politics. An AI feature without eval ownership becomes the same politics with worse audit trails.

${bridge}

${support}

## Takeaway

Treat safety and governance as production requirements — owners, scopes, evals, rollback — or do not pretend you adopted them.
`;
  } else {
    middle = `## Why this is essay material

${primaryCite}${primary.snippet ? ` — ${primary.snippet}` : "."}

The useful move is not to summarize it. It is to ask what **constraint** it introduces for people who build analytics, AI tooling, or delivery systems.

## What I take seriously

- **Decision first.** If it does not change a call, it does not earn the fold — same rule as a Monday portfolio review.
- **Contracts over spectacles.** Stable interfaces and definitions beat one-off brilliance.
- **Failure modes on the page.** If I cannot name how this breaks, I am not ready to recommend it.

${bridge}

## What I am leaving alone

Trend commentary without an owner. Vendor theater. A second thesis smuggled in as “also interesting.”

${support}

## Takeaway

Steal one constraint from the signal and make your system more legible because of it. Ignore the rest until it earns a decision.
`;
  }

  const body = `## The question

${question}

${middle}`;

  const mdx = `---
title: ${JSON.stringify(title)}
summary: ${JSON.stringify(summary)}
date: ${JSON.stringify(weekOf)}
category: ${JSON.stringify(category)}
featured: false
tags: ${JSON.stringify(tags.length ? tags : ["Learning"])}
---

${body}`;

  return {
    title,
    summary,
    category,
    tags: tags.length ? tags : ["Learning"],
    slug: slugify(title),
    mdx,
    preview: `${title}\n\n${summary}\n\nInspired by: ${primary.title}`,
  };
}

function buildTemplateMdx(intake: WeeklyIntake): BuiltDraft {
  const thesis = pickEssayThesis(intake);
  if (thesis) return buildEssayFromThesis(thesis, intake.weekOf);

  const title =
    "What is worth documenting when the field moves faster than your roadmap?";
  const summary =
    "When Signals are quiet, the useful essay is still about judgment: what to adopt, what to defer, and how to keep analytics and delivery honest.";
  const body = `## The question

${title}

## The tension

Tooling and models will keep jumping. Portfolios, risk dashboards, and delivery programs still need **owners, definitions, and rollback plans**.

## Takeaway

Write about the constraint you refuse to drop — evidence before decisions — even when the stack is exciting.
`;
  return {
    title,
    summary,
    category: "Learning",
    tags: ["Learning", "Delivery"],
    slug: slugify(title),
    mdx: `---
title: ${JSON.stringify(title)}
summary: ${JSON.stringify(summary)}
date: ${JSON.stringify(intake.weekOf)}
category: "Learning"
featured: false
tags: ["Learning","Delivery"]
---

${body}`,
    preview: `${title}\n\n${summary}`,
  };
}

const FEW_SHOT = `
CANONICAL ORBIT VOICE (study; do not copy sentences):
- Titles are specific claims or questions, never "Week of…" or "What I learned this week".
- Example title: "The Power BI dashboard I actually open every Monday"
- Example opening: "Can a Monday morning portfolio review fit on one screen without losing the signals that matter for credit risk?"
- Example takeaway: "The best operational dashboard isn't the prettiest — it's the one people trust on Monday."
- Example career essay move: contrast what stayed the same vs what changed; end with a transferable principle ("make the system legible").
- Include at least one concrete "mistake I made / refuse to repeat" or "what I am not doing yet" section when it fits.
- A hiring manager who does not know the workshop should be able to say what you decided, what you rejected, and what you will not claim.
- Prefer 700–1000 words of original argument. Cite the inspiration once; do not paraphrase the whole article.
`;

const SYSTEM_PROMPT = `You are ghostwriting a personal essay for Alex's Orbit portfolio (Writes).

GOAL
Write ONE focused essay worth publishing — the kind of piece someone would share: a new capability, a meaningful shift in AI, analytics / Power BI / Fabric reporting, data platforms, or delivery practice.
Signals and projects are INSPIRATION only. Produce an original argument with judgment.

${FEW_SHOT}

VOICE
- First-person, calm, specific. Document judgment; do not perform expertise.
- Evergreen > hot take.
- No emojis. No "As an AI". No "In today's fast-paced world". No motivational filler.

REQUIRED ARC
1. ## The question — one concrete question
2. Context / what was broken or what people get wrong
3. What you take seriously about the inspiration (argument, not article summary)
4. How it lands for analytics, Power BI/Fabric, AI tooling, or delivery — optional bridge to one real project from intake
5. Mistakes / what you are not doing yet
6. ## Takeaway — one sharp conclusion

HIRING-MANAGER STORY
Put these inside the sections above. Do not add a "Behind the decision" heading, a competency badge, or a closing pitch about being hireable.
- The decision.
- The assumption, and the evidence that moved it.
- What you chose, and what you rejected.
- What stays unproven.
- What should change on Monday, and where that move fails.
One link leads: business problem, data, intelligent system, delivery, or measurable outcome. Prefer the gap between a demo that works and a decision a team can own. If a scene is hypothetical, say so in one clause.

FORMAT RULES
- Normal markdown prose with ## headings. NEVER markdown tables.
- Do NOT reuse stock lines like "Capability is cheap. Trust is expensive" or "Steal one constraint".
- category: Career | Data | AI | Delivery | Learning
`;

function userPromptJson(intake: WeeklyIntake, thesis: EssayThesis): string {
  return `${SYSTEM_PROMPT}

Return ONLY JSON:
{"title":"...","summary":"...","category":"...","tags":["..."],"bodyMarkdown":"## The question\\n..."}

Thesis intake:
${JSON.stringify(
  {
    primaryInspiration: thesis.primary,
    supportingInspiration: thesis.supporting,
    essayQuestion: thesis.question,
    suggestedCategory: thesis.category,
    suggestedTags: thesis.tags,
    optionalProjectBridge: thesis.bridgeProject,
    weekOf: intake.weekOf,
    forbid: [
      "weekly digest",
      "Week of",
      "What I Learned This Week",
      "list all projects",
      "markdown tables",
    ],
  },
  null,
  2,
)}`;
}

function userPromptMdx(intake: WeeklyIntake, thesis: EssayThesis): string {
  return `${SYSTEM_PROMPT}

Write a complete MDX article. Output ONLY the MDX (no code fences), starting with YAML frontmatter:

---
title: "..."
summary: "..."
date: "${intake.weekOf}"
category: "${thesis.category}"
featured: false
tags: [...]
---

## The question
...

Thesis:
- Primary: ${thesis.primary.title} (${thesis.primary.link})
  ${thesis.primary.snippet}
- Question to answer: ${thesis.question}
- Optional project bridge: ${
    thesis.bridgeProject
      ? `${thesis.bridgeProject.name} — ${thesis.bridgeProject.description}`
      : "none"
  }
- Supporting (optional, max one mention): ${
    thesis.supporting.map((s) => s.title).join("; ") || "none"
  }
`;
}

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function parseMdxOutput(
  raw: string,
  intake: WeeklyIntake,
  fallback: BuiltDraft,
): BuiltDraft | null {
  let text = raw.trim();
  const fenced = text.match(/```(?:mdx?|markdown)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) text = fenced[1].trim();

  if (!text.startsWith("---")) {
    // Model returned body only — wrap with fallback frontmatter + quality check body.
    const body = text.includes("## The question")
      ? text.slice(text.indexOf("## The question"))
      : text;
    const qualityFail = failsEssayQuality(fallback.title, body);
    if (qualityFail) {
      console.warn("[weekly-write] MDX body failed quality:", qualityFail);
      return null;
    }
    const title = fallback.title;
    const mdx = `---
title: ${JSON.stringify(title)}
summary: ${JSON.stringify(fallback.summary)}
date: ${JSON.stringify(intake.weekOf)}
category: ${JSON.stringify(fallback.category)}
featured: false
tags: ${JSON.stringify(fallback.tags)}
---

${body}
`;
    return {
      ...fallback,
      mdx,
      slug: slugify(`${title}-${createHash("sha1").update(title).digest("hex").slice(0, 6)}`),
      preview: `${title}\n\n${fallback.summary}`,
    };
  }

  const end = text.indexOf("---", 3);
  if (end < 0) return null;
  const fm = text.slice(3, end).trim();
  const body = text.slice(end + 3).trim();

  const grab = (key: string): string | null => {
    const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
    if (!m) return null;
    return m[1]!.trim().replace(/^["']|["']$/g, "");
  };

  const title = grab("title") || fallback.title;
  const summary = grab("summary") || fallback.summary;
  const category = (grab("category") as WriteCategory) || fallback.category;
  const tagsMatch = fm.match(/^tags:\s*\[([^\]]*)\]/m);
  const tags = tagsMatch
    ? tagsMatch[1]!
        .split(",")
        .map((t) => t.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean)
        .slice(0, 8)
    : fallback.tags;

  const qualityFail = failsEssayQuality(title, body);
  if (qualityFail) {
    console.warn("[weekly-write] MDX failed quality:", qualityFail, title);
    return null;
  }

  const mdx = `---
title: ${JSON.stringify(title)}
summary: ${JSON.stringify(summary)}
date: ${JSON.stringify(intake.weekOf)}
category: ${JSON.stringify(category)}
featured: false
tags: ${JSON.stringify(tags)}
---

${body}
`;

  return {
    title,
    summary,
    category,
    tags,
    slug: slugify(
      `${title}-${createHash("sha1").update(title).digest("hex").slice(0, 6)}`,
    ),
    mdx,
    preview: `${title}\n\n${summary}`,
  };
}

function builtFromModelJson(
  raw: string,
  intake: WeeklyIntake,
  fallback: BuiltDraft,
): BuiltDraft | null {
  try {
    const parsed = JSON.parse(extractJsonObject(raw)) as {
      title?: string;
      summary?: string;
      category?: WriteCategory;
      tags?: string[];
      bodyMarkdown?: string;
    };

    const title = parsed.title?.trim() || fallback.title;
    const summary = parsed.summary?.trim() || fallback.summary;
    const category = parsed.category || fallback.category;
    const tags =
      Array.isArray(parsed.tags) && parsed.tags.length > 0
        ? parsed.tags.slice(0, 8)
        : fallback.tags;
    const body = (parsed.bodyMarkdown || "").trim();
    if (!body) return null;

    const qualityFail = failsEssayQuality(title, body);
    if (qualityFail) {
      console.warn(
        "[weekly-write] rejecting low-quality draft:",
        qualityFail,
        title,
      );
      return null;
    }

    const slug = slugify(
      `${title}-${createHash("sha1").update(title).digest("hex").slice(0, 6)}`,
    );

    const mdx = body.startsWith("---")
      ? body
      : `---
title: ${JSON.stringify(title)}
summary: ${JSON.stringify(summary)}
date: ${JSON.stringify(intake.weekOf)}
category: ${JSON.stringify(category)}
featured: false
tags: ${JSON.stringify(tags)}
---

${body}
`;

    return {
      title,
      summary,
      category,
      tags,
      slug,
      mdx,
      preview: `${title}\n\n${summary}`,
    };
  } catch (err) {
    console.error("[weekly-write] failed to parse model JSON:", err);
    return null;
  }
}

async function tryOllamaDraft(
  intake: WeeklyIntake,
  thesis: EssayThesis,
  fallback: BuiltDraft,
): Promise<BuiltDraft | null> {
  if (process.env.VERCEL) return null;
  if (process.env.WEEKLY_WRITE_DISABLE_OLLAMA === "1") return null;

  const base = (
    process.env.OLLAMA_HOST?.trim() || "http://127.0.0.1:11434"
  ).replace(/\/$/, "");
  // Prefer a stronger local model when available; llama3.2 is the known install.
  const model = process.env.OLLAMA_WEEKLY_MODEL?.trim() || "llama3.2";

  try {
    // MDX prose works far better on small local models than JSON-with-escaped-newlines.
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        options: { temperature: 0.65, num_predict: 2800 },
        messages: [
          {
            role: "system",
            content:
              "You write long-form Orbit portfolio essays in MDX. Output only MDX. No tables. No weekly digests.",
          },
          { role: "user", content: userPromptMdx(intake, thesis) },
        ],
      }),
      signal: AbortSignal.timeout(240_000),
    });

    if (!res.ok) {
      console.error("[weekly-write] Ollama failed:", await res.text());
      return null;
    }

    const data = (await res.json()) as { message?: { content?: string } };
    const raw = data.message?.content;
    if (!raw) return null;
    return parseMdxOutput(raw, intake, fallback);
  } catch (err) {
    console.error("[weekly-write] Ollama error:", err);
    return null;
  }
}

async function tryGeminiDraft(
  intake: WeeklyIntake,
  thesis: EssayThesis,
  fallback: BuiltDraft,
): Promise<BuiltDraft | null> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;

  const model =
    process.env.GEMINI_WEEKLY_MODEL?.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const payload = JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [{ text: userPromptJson(intake, thesis) }],
      },
    ],
    generationConfig: {
      temperature: 0.65,
      responseMimeType: "application/json",
    },
  });

  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal: AbortSignal.timeout(120_000),
      });

      if (res.status === 429 || res.status === 503) {
        const waitMs = attempt * 20_000;
        console.warn(
          `[weekly-write] Gemini ${res.status}, retry in ${waitMs}ms (attempt ${attempt}/${maxAttempts})`,
        );
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      if (!res.ok) {
        console.error("[weekly-write] Gemini failed:", await res.text());
        return null;
      }

      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const raw = data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("");
      if (!raw) return null;
      return builtFromModelJson(raw, intake, fallback);
    } catch (err) {
      console.error("[weekly-write] Gemini error:", err);
      if (attempt === maxAttempts) return null;
      await new Promise((r) => setTimeout(r, attempt * 12_000));
    }
  }

  return null;
}

async function tryOpenAiDraft(
  intake: WeeklyIntake,
  thesis: EssayThesis,
  fallback: BuiltDraft,
): Promise<BuiltDraft | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_WEEKLY_MODEL?.trim() || "gpt-4o-mini",
        temperature: 0.65,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPromptJson(intake, thesis) },
        ],
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      console.error("[weekly-write] OpenAI failed:", await res.text());
      return null;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;
    return builtFromModelJson(raw, intake, fallback);
  } catch (err) {
    console.error("[weekly-write] OpenAI error:", err);
    return null;
  }
}

function toWeeklyDraft(
  built: BuiltDraft,
  intake: WeeklyIntake,
  source: WeeklyDraftSource,
): WeeklyDraft {
  return {
    id: `ww-${intake.weekOf}-${randomBytes(4).toString("hex")}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    weekOf: intake.weekOf,
    slug: built.slug,
    title: repairUtf8Mojibake(built.title),
    summary: repairUtf8Mojibake(built.summary),
    category: built.category,
    tags: built.tags,
    mdx: repairUtf8Mojibake(built.mdx),
    preview: repairUtf8Mojibake(built.preview),
    intake,
    source,
  };
}

/** Cursor Cloud Automation / IDE is the primary writer (skip Gemini + template). */
function useCloudAutomationWriter(): boolean {
  return (
    process.env.WEEKLY_WRITE_USE_CLOUD_AUTOMATION === "1" ||
    process.env.WEEKLY_WRITE_SKIP_GEMINI === "1"
  );
}

/**
 * Default: Cursor Cloud Automation / IDE writes the essay (Gemini skipped).
 * Legacy: Gemini when configured and cloud mode off.
 * Local fallback: Ollama → OpenAI → template (only when explicitly allowed).
 */
export async function createWeeklyDraft(
  intake: WeeklyIntake,
  options?: { allowLocalFallback?: boolean },
): Promise<CreateWeeklyDraftResult> {
  const thesis = pickEssayThesis(intake);

  if (useCloudAutomationWriter()) {
    return {
      status: "awaiting_ide",
      reason: thesis ? "cloud_automation" : "no_thesis",
      intake,
      thesis,
    };
  }

  const fallback = buildTemplateMdx(intake);
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY?.trim());
  const allowLocal =
    options?.allowLocalFallback === true ||
    process.env.WEEKLY_WRITE_ALLOW_LOCAL_FALLBACK === "1" ||
    !geminiConfigured;

  if (thesis && geminiConfigured) {
    const gemini = await tryGeminiDraft(intake, thesis, fallback);
    if (gemini) {
      return {
        status: "ready",
        draft: toWeeklyDraft(gemini, intake, "gemini"),
      };
    }

    if (!allowLocal) {
      return {
        status: "awaiting_ide",
        reason: "gemini_unavailable",
        intake,
        thesis,
      };
    }
  }

  let built: BuiltDraft | null = null;
  let source: WeeklyDraftSource = "template";

  if (thesis) {
    built = await tryOllamaDraft(intake, thesis, fallback);
    if (built) source = "ollama";

    if (!built) {
      built = await tryOpenAiDraft(intake, thesis, fallback);
      if (built) source = "openai";
    }
  }

  if (!built) {
    built = fallback;
    source = "template";
  }

  return {
    status: "ready",
    draft: toWeeklyDraft(built, intake, source),
  };
}
