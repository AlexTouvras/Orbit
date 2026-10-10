---
name: weekly-write-essay
description: >-
  Generate and Slack-notify Orbit weekly Write essays from Signals + workshop
  intake. Use when weekly-write-ide-brief exists, the user asks for a weekly
  Write / essay draft / notify-draft, or Cursor must write this week's essay.
---

# Weekly Write essay (Orbit)

One essay → `data/weekly-write-draft.json` → Slack `#orbit` Approve. Do not commit or publish the MDX unless the user explicitly asks. Cursor writes the essay. There is no model-API draft step.

## When this applies

- `data/weekly-write-ide-brief.md` (or `.json`) exists with status awaiting IDE
- The user asks to draft, notify, or regenerate a weekly Write

If the brief is absent and the user did not ask for a weekly Write, stop.

## Named verify

Primary: `npm run weekly:notify-draft` exits 0 and prints `"ok": true`, `"slack": true`, and `"githubSynced": true`.

Before notify, the draft must pass the mechanical gates below and the Pass list in `docs/essay-voice.md`.

## Open before writing

1. `data/weekly-write-ide-brief.md` and `data/weekly-write-ide-brief.json`
2. `docs/essay-voice.md`
3. Personal skill `anti-ai-slop-writing`
4. One peer Write in the chosen category. Defaults: `from-risk-to-delivery.mdx`, `building-orbit.mdx`, `when-the-coach-got-gate-ranks.mdx`. Skip a Power BI peer unless this thesis is Power BI.

Do not cite deleted placeholders (for example the former `power-bi-monday-dashboard.mdx`).

## Procedure

1. **Read the brief.** Thesis question plus the primary Signal. Supporting Signals stay adjacent. Use a project bridge only when the brief names one.
2. **Draft from `docs/essay-voice.md`.** Five headlines, then the five argument notes, then the prose. `## The question` first, `## Takeaway` last, about 700–1000 words (hard bounds 500–1600). Cite the primary Signal. Optional: one `/architecture/{slug}` link when the essay is about a featured project.
3. **Build the MDX string** (frontmatter, then body). SEO comes from `title`, `summary`, `date`, `category`, and `tags`. A first publish omits `updated`.
4. **Save** `data/weekly-write-draft.json` (shape in `reference.md`). `status: "pending"`, `source: "ide"`, `intake` copied from the brief JSON, `id` like `ww-{weekOf}-ide`, slug from the title.
5. **UTF-8.** At most one em dash per ~500 words. No mojibake.
6. **Notify.** `npm run weekly:notify-draft` with `GITHUB_TOKEN` (and `GITHUB_REPO` if needed) so the draft lands on the **default branch**. Vercel reads that branch. Confirm `"slack": true` and `"githubSynced": true`. Slack posts the full essay.
7. **Stop.** The user Approves or Skips in `#orbit`. Do not publish the Write MDX yourself.

If `githubSynced` is false, set `GITHUB_TOKEN` with `repo` scope and notify again, or PUT `data/weekly-write-draft.json` to the default branch, then re-notify.

## Mechanical gates

These match `failsEssayQuality` in `src/lib/weekly-write/draft.ts`. The voice bar is `docs/essay-voice.md`.

| Gate | Fail if |
|------|---------|
| Digest shape | Title like "Week of…" or "what I learned this week"; or the body is a link roundup |
| Missing question | Body does not start with `## The question` |
| Table outline | 4 or more markdown table rows |
| Length | Body under 500 or over 1600 words |
| Sections | Fewer than 3 `##` headings |
| Template lines | "Capability is cheap. **Trust** is expensive" or "steal **one constraint** from the signal" |
| Voice | Any item in the essay-voice Pass list fails |

## Pipeline anti-patterns

- Publishing `src/content/writes/*.mdx` without Slack Approve or an explicit user ask
- Inventing a Signal that is not in the brief
- Forcing a project bridge the brief does not name
- Treating an `/architecture/` page as the essay
- Notifying from a feature branch without syncing the draft JSON to the default branch

## Related

- `src/lib/weekly-write/`
- `.cursor/rules/weekly-write-ide.mdc`
- `CONTENT.md` §6b
- `docs/essay-voice.md`
- [reference.md](reference.md)
