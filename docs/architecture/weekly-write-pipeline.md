# Weekly blog draft pipeline

Automated draft from Related articles + workshop projects → Slack approval in career-ops → publish to Blog.

```mermaid
flowchart LR
  cron[Weekly cron] --> gemini{Gemini OK?}
  gemini -->|yes| draft[Draft MDX JSON]
  gemini -->|no| ideBrief[Local IDE brief]
  ideBrief --> cursor[Cursor writes essay]
  cursor --> draft
  draft --> slack[Incoming webhook career-ops]
  slack --> you{Approve or Skip link}
  you -->|Approve| publish[Commit Blog MDX]
  you -->|Skip| discard[Mark draft skipped]
  publish --> site[Blog slug live after redeploy]
```

When Gemini is configured but unavailable (rate limit etc.), the pipeline writes `data/weekly-write-ide-brief.md` and waits. Generate the essay in Cursor, then `npm run weekly:notify-draft` to continue Slack approve.
