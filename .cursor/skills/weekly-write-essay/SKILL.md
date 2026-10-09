---
name: weekly-write-essay
description: >-
  Generate and Slack-notify Orbit weekly Write essays from Signals + workshop
  intake (Gemini IDE fallback or on-demand). Use when weekly-write-ide-brief
  exists, the user asks for a weekly Write / essay draft / notify-draft, or
  Gemini weekly Write failed and Cursor must write the essay.
---

# Weekly Write essay (Orbit)

Orbit-only workflow: one focused essay → pending draft JSON → Slack `#career-ops` Approve. Do **not** commit/publish MDX yourself unless the user explicitly asks.

## When this applies

- `data/weekly-write-ide-brief.md` (or `.json`) exists with status awaiting IDE
- User asks to draft/notify a weekly Write or continue after Gemini failure
- User asks to regenerate this week's essay from intake

If the brief is absent and the user did not ask for a weekly Write, stop.

## Named verify

Primary: `npm run weekly:notify-draft` exits 0 and prints `"ok": true`, `"slack": true`, and `"githubSynced": true`.

Before notify, self-check the draft against Quality gates below (same rules as `src/lib/weekly-write/draft.ts`) **plus** the stranger / topic-balance gates in `docs/essay-voice.md`.

## Minimum evidence (open before writing)

1. `data/weekly-write-ide-brief.md` **and** `data/weekly-write-ide-brief.json` (thesis + intake)
2. `docs/essay-voice.md` — compelling checklist, **primary reader / stranger test**, **hiring-manager story**, topic balance, **and** "Voice from the theses" (reasoning fingerprint; no academic cosplay)
3. Personal skill `anti-ai-slop-writing` + banned-words list
4. Voice peer (read at least one fully):
   - Prefer a peer in the **chosen category lane**
   - Defaults: `src/content/writes/from-risk-to-delivery.mdx`, `building-orbit.mdx`, `when-the-coach-got-gate-ranks.mdx`
   - Avoid opening another Power BI / Fabric essay as the only peer unless this week's thesis is Power BI
5. Optional: `CONTENT.md` §6b for Slack approve flow

Do not cite deleted placeholders (e.g. former `power-bi-monday-dashboard.mdx`).

## Procedure

1. **Read the brief.** Use the thesis question + primary Signal. Supporting Signals are adjacent only — not a second thesis. Project bridge only if the brief names one.
2. **Choose category for the decision rule**, not the stack. Before locking `Data`/`AI` with a Power BI / Fabric angle, ask whether Delivery, Learning, Career, or general data (measurement, contracts, evidence, ops) fits the Signal better. Prefer rotation across a month; do not ship three consecutive Power BI pieces unless the user asks.
3. **Write one essay**, not a digest:
   - First body heading: `## The question`
   - End with a clear takeaway section (often `## Takeaway`)
   - ~700–1000 words preferred; hard bounds 500–1600
   - First person, concrete, Orbit voice — readable by a stranger with no workshop literacy
   - Gloss every project nickname on first use; translate metrics (fitness load not only CTL)
   - Cite the primary Signal with a markdown link
   - Optional: one link to related architecture at `/architecture/{slug}` if the essay is about a featured project
   - Pass the hiring-manager story in `docs/essay-voice.md`: decision, what you rejected, what stays unproven, what changes Monday. One chain link leads (business problem → data → intelligent system → delivery → measurable outcome). Prefer the gap between a demo that works and a decision a team can own.
   - No tool catalogs, no role badge, and no standing "Behind the decision" card. No hiring soft-close unless the piece is Career and the user asked for a role-change angle.
4. **Build frontmatter + body** into full MDX string (frontmatter then body). SEO (OG image, JSON-LD, sitemap, RSS) is automatic from `title` / `summary` / `date` / `category` / `tags` — do not invent meta tags. First publish: omit `updated`.
5. **Save** `data/weekly-write-draft.json` (see `reference.md` for shape). Required fields:
   - `status: "pending"`, `source: "ide"`
   - `intake` copied from the brief JSON
   - `id` like `ww-{weekOf}-ide` (or keep existing pending id if replacing)
   - Valid `slug` from title (lowercase, hyphens)
6. **UTF-8:** write the file as UTF-8. Prefer commas/semicolons over em dashes (at most one em dash per ~500 words); never leave mojibake.
7. **Sync + Notify:** `npm run weekly:notify-draft` with `GITHUB_TOKEN` (and `GITHUB_REPO` if needed) so the pending draft is committed to the **default branch**. Vercel preview/Approve read GitHub default branch — a feature-branch-only commit is not enough. Confirm the CLI JSON includes `"slack": true` and `"githubSynced": true`. Slack posts the **full essay in-channel** (chunked); browser preview is secondary.
8. **Stop.** User Approves/Skips in Slack. Do not call publish APIs or commit Write MDX unless authorized.

If `githubSynced` is false: set `GITHUB_TOKEN` with `repo` scope and re-run notify, or PUT `data/weekly-write-draft.json` to the default branch via the GitHub Contents API, then re-notify. Do not claim the Slack post is review-ready when only a feature branch has the draft.

## Quality gates (reject / rewrite if any fail)

| Gate | Fail if |
|------|---------|
| Digest shape | Title like "Week of…", "what I learned this week", weekly roundup; or body is a bullet digest of many links |
| Missing question | Body does not start with `## The question` |
| Table outline | ≥4 markdown table rows (`\|`) — not an essay |
| Length | Word count of body (after frontmatter) < 500 or > 1600 |
| Sections | Fewer than 3 `##` headings |
| Template regurgitation | Phrases like "Capability is cheap. **Trust** is expensive" or "steal **one constraint** from the signal" |
| Insider codenames | Workshop nicknames without plain-language gloss on first use |
| Stranger fail | Non-technical reader cannot restate the decision rule |
| Judgment missing | A hiring manager cannot restate the decision, what was rejected, and what stays unproven |
| Pitch close | Takeaway sells the author, names a target job, or ends on a role badge / evidence card |
| Topic tunnel | Defaulted to Power BI / Fabric / semantic-model when Delivery, Learning, Career, or general data fit better |
| AI-slop | Banned words, em-dash overuse, tricolon habit, "It's not X, it's Y" spam |

## Anti-patterns

- Multi-signal roundup framed as one thesis
- Publishing or `git commit` of `src/content/writes/*.mdx` without Slack Approve / user AUTH
- Inventing Signals not in the brief
- Forcing a WIP project bridge when the brief says none
- Leaving architecture-only pages as "essays" — diagrams live under `/architecture/`, not `/writes`
- Slack-notifying from a feature branch without syncing `data/weekly-write-draft.json` to the default branch (preview/Approve 404; readers only get a teaser unless full body is in the Slack message)
- Writing for people who already know Ravens / Heimdall / ProjectBrain
- Another Power BI essay by inertia

## Related

- Pipeline code: `src/lib/weekly-write/`
- Thin cursor rule: `.cursor/rules/weekly-write-ide.mdc`
- Ops notes: `CONTENT.md` §6b
- Shared bar: `docs/essay-voice.md`
- Draft schema details: [reference.md](reference.md)
- Human cadence: personal skill `anti-ai-slop-writing`
