# Weekly blog draft pipeline

Automated draft from Related articles + workshop projects → Slack approval in `#orbit` → publish to Blog.

```mermaid
flowchart LR
  cron[Monday Cursor run] --> brief[IDE brief from Signals]
  brief --> cursor[Cursor writes the essay]
  cursor --> draft[Pending draft JSON]
  draft --> sync[Persist draft to GitHub default branch]
  sync --> slack[Slack #orbit webhook]
  slack --> you{Approve or Skip}
  you -->|Approve| publish[Commit Blog MDX]
  you -->|Skip| discard[Mark draft skipped]
  publish --> site[Blog slug live after redeploy]
```

**Slack access:** the notify payload includes the **full essay** in chunked Block Kit sections (not a teaser). Browser preview/Approve still need `data/weekly-write-draft.json` on the **default branch** (`GITHUB_TOKEN` via `persistWeeklyDraftCli`). A feature-branch-only commit is not enough — Vercel reads the default branch.

The pipeline writes `data/weekly-write-ide-brief.md` and waits. Generate the essay in Cursor (`docs/essay-voice.md`), then `npm run weekly:notify-draft`. Confirm `"githubSynced": true` in the CLI output. `--allow-local-fallback` can draft with Ollama, OpenAI, or a template. That flag is explicit.
