# Weekly blog draft pipeline

Automated draft from Related articles + workshop projects → Slack approval in `#orbit` → publish to Blog.

```mermaid
flowchart LR
  cron[Weekly cron / Cloud Automation] --> gemini{Gemini OK?}
  gemini -->|yes| draft[Draft MDX JSON]
  gemini -->|no| ideBrief[Local IDE brief]
  ideBrief --> cursor[Cursor writes essay]
  cursor --> draft
  draft --> sync[Persist draft to GitHub default branch]
  sync --> slack[Slack #orbit webhook]
  slack --> you{Approve or Skip}
  you -->|Approve| publish[Commit Blog MDX]
  you -->|Skip| discard[Mark draft skipped]
  publish --> site[Blog slug live after redeploy]
```

**Slack access:** the notify payload includes the **full essay** in chunked Block Kit sections (not a teaser). Browser preview/Approve still need `data/weekly-write-draft.json` on the **default branch** (`GITHUB_TOKEN` via `persistWeeklyDraftCli`). A feature-branch-only commit is not enough — Vercel reads the default branch.

When Gemini is configured but unavailable (rate limit etc.), the pipeline writes `data/weekly-write-ide-brief.md` and waits. Generate the essay in Cursor, then `npm run weekly:notify-draft` to continue Slack approve. Confirm `"githubSynced": true` in the CLI output.
