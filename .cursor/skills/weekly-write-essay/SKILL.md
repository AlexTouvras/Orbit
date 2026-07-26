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

Primary: `npm run weekly:notify-draft` exits 0 and prints `"ok": true`, `"slack": true`.

Before notify, self-check the draft against Quality gates below (same rules as `src/lib/weekly-write/draft.ts`).

## Minimum evidence (open before writing)

1. `data/weekly-write-ide-brief.md` **and** `data/weekly-write-ide-brief.json` (thesis + intake)
2. `docs/essay-voice.md` — compelling checklist **and** “Voice from the theses” (reasoning fingerprint; no academic cosplay)
3. Voice peer (read at least one fully):
   - `src/content/writes/from-risk-to-delivery.mdx`
   - `src/content/writes/building-orbit.mdx` or another current essay under `src/content/writes/`
4. Optional: `CONTENT.md` §6b for Slack approve flow

Do not cite deleted placeholders (e.g. former `power-bi-monday-dashboard.mdx`).

## Procedure

1. **Read the brief.** Use the thesis question + primary Signal. Supporting Signals are adjacent only — not a second thesis. Project bridge only if the brief names one.
2. **Write one essay**, not a digest:
   - First body heading: `## The question`
   - End with a clear takeaway section (often `## Takeaway`)
   - ~700–1000 words preferred; hard bounds 500–1600
   - First person, concrete, Orbit voice (delivery / data / AI ops — not listicle marketing)
   - Cite the primary Signal with a markdown link
   - Optional: one link to related architecture at `/architecture/{slug}` if the essay is about a featured project
3. **Build frontmatter + body** into full MDX string (frontmatter then body).
4. **Save** `data/weekly-write-draft.json` (see `reference.md` for shape). Required fields:
   - `status: "pending"`, `source: "ide"`
   - `intake` copied from the brief JSON
   - `id` like `ww-{weekOf}-ide` (or keep existing pending id if replacing)
   - Valid `slug` from title (lowercase, hyphens)
5. **UTF-8:** write the file as UTF-8. Prefer ASCII punctuation or real em dashes (`—`); never leave mojibake (`â€"`).
6. **Notify:** `npm run weekly:notify-draft`
7. **Stop.** User Approves/Skips in Slack. Do not call publish APIs or commit Write MDX unless authorized.

## Quality gates (reject / rewrite if any fail)

| Gate | Fail if |
|------|---------|
| Digest shape | Title like "Week of…", "what I learned this week", weekly roundup; or body is a bullet digest of many links |
| Missing question | Body does not start with `## The question` |
| Table outline | ≥4 markdown table rows (`\|`) — not an essay |
| Length | Word count of body (after frontmatter) &lt; 500 or &gt; 1600 |
| Sections | Fewer than 3 `##` headings |
| Template regurgitation | Phrases like "Capability is cheap. **Trust** is expensive" or "steal **one constraint** from the signal" |

## Anti-patterns

- Multi-signal roundup framed as one thesis
- Publishing or `git commit` of `src/content/writes/*.mdx` without Slack Approve / user AUTH
- Inventing Signals not in the brief
- Forcing a WIP project bridge when the brief says none
- Leaving architecture-only pages as "essays" — diagrams live under `/architecture/`, not `/writes`

## Related

- Pipeline code: `src/lib/weekly-write/`
- Thin cursor rule: `.cursor/rules/weekly-write-ide.mdc`
- Ops notes: `CONTENT.md` §6b
- Draft schema details: [reference.md](reference.md)
