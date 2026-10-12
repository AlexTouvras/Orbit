# Weekly Write draft reference

## `data/weekly-write-draft.json`

```json
{
  "id": "ww-YYYY-MM-DD-ide",
  "status": "pending",
  "createdAt": "<ISO-8601>",
  "weekOf": "YYYY-MM-DD",
  "slug": "kebab-case-title",
  "title": "Essay title",
  "summary": "One sentence.",
  "category": "Delivery",
  "tags": ["Delivery", "Learning"],
  "mdx": "---\ntitle: \"...\"\nsummary: \"...\"\ndate: \"YYYY-MM-DD\"\ncategory: \"Delivery\"\nfeatured: false\ntags: [\"...\"]\n---\n\n## The question\n\n...",
  "preview": "Title\n\nSummary\n\nInspired by: <primary signal title>",
  "intake": {},
  "source": "ide"
}
```

- `category`: one of `Career` | `Data` | `AI` | `Delivery` | `Learning`. Match the **decision rule**, not the tool stack. Prefer rotation; do not default to `Data`/`AI` Power BI.
- `intake`: copy verbatim from `data/weekly-write-ide-brief.json`.
- `mdx.date`: usually `weekOf`.
- Prefer `featured: false` for weekly drafts (hub featured is curated separately).

## CLI

| Command | Purpose |
|---------|---------|
| `npm run weekly:draft` | Intake + IDE brief. Cursor writes the essay. |
| `npm run weekly:notify` | Force a new IDE brief. Slack waits for `weekly:notify-draft`. |
| `npm run weekly:notify-draft` | Slack a pending local draft (persists to the GitHub default branch when `GITHUB_TOKEN` is set; Slack includes the full essay) |
| `npm run weekly:notify -- --force` | Replace a pending draft |
| `npm run weekly:draft -- --allow-local-fallback` | Ollama, then OpenAI, then a template. Explicit only. |

## Essay skeleton (Orbit)

```mdx
## The question
…

## The issue
… (one sentence a stranger can repeat; the Signal's claim, with the example in one clause)

## … (the gate: work you already do on this artifact, so the issue does not repeat)

## Takeaway
…
```

Name the middle sections for the issue and the gate. A recap of the Signal is not a section. Keep `## The question` first. The bar is `docs/essay-voice.md`.

## After Approve

Slack **Approve & publish** → confirm POST → GitHub commit of MDX → Vercel redeploy. Agent does not need to push unless the user asks.
