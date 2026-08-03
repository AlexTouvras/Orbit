# Weekly Write — IDE generation needed

Cursor Cloud Automation writes this week's essay (Gemini skipped). **Generate the essay in Cursor**, then continue the normal Slack approve pipeline.

## Why

`cloud_automation`

Created: 2026-08-03T09:03:47.769Z  
Week of: 2026-08-03

## Your job (in this IDE)

1. Write **one** focused Orbit essay (not a digest) inspired by the thesis below.
2. Match voice/structure of existing Writes (`## The question` … `## Takeaway`, 700–1000 words).
3. Save pending draft JSON to `data/weekly-write-draft.json` with `source: "ide"` and `status: "pending"`.
4. Run:

```powershell
npm run weekly:notify-draft
```

5. In Slack `#career-ops`, click **Approve & publish** or **Skip**.

## Thesis

- **Question:** What actually changes in how we build analytics when the reporting stack keeps moving?
- **Primary inspiration:** [Fabric MCP Servers, CLI & AI Agents — A Conversation with Hasan Abo-Shally | Fabric Insider Ep. 8](https://radacad.com/fabric-mcp-servers-cli-ai-agents-a-conversation-with-hasan-abo-shally-fabric-insider-ep-8/?utm_source=rss&utm_medium=rss&utm_campaign=fabric-mcp-servers-cli-ai-agents-a-conversation-with-hasan-abo-shally-fabric-insider-ep-8) (RADACAD)
- **Snippet:** Everyone is talking about MCP Servers. But most people still cannot clearly explain what one actually is, why it matters for Fabric, or how it differs from the APIs and skills they already use. In this episode of Fabric Insider, I sat down with Hasan Abo-Shally — Product Manager…
- **Optional project bridge:** Orbit — Portfolio & related articles — Public HQ: Blog MDX in git, portfolio proof, curated Related articles RSS, and Studio JSON edits. Weekly Write drafts can generate; Slack Approve is the publish gate.
- **Suggested category:** Data
- **Suggested tags:** Power BI, Agents, AI, Analytics, Next.js, React

## Intake (reference only)

### Signals
- [(Don’t) Stop materializing your silver layer!](https://data-mozart.com/dont-stop-materializing-your-silver-layer/?utm_source=rss&utm_medium=rss&utm_campaign=dont-stop-materializing-your-silver-layer) — Data Mozart (Analytics)
- [Backstage with Lakebase, part 3](https://www.databricks.com/blog/backstage-lakebase-part-3) — Databricks Blog (Data)
- [AI Made Output Cheap. It Also Made Bad Strategy Impossible to Hide.](https://www.scrum.org/resources/blog/ai-made-output-cheap-it-also-made-bad-strategy-impossible-hide) — Scrum.org (Delivery)
- [Ten advances in mathematics and theoretical computer science](https://openai.com/index/ten-advances-in-mathematics) — OpenAI Blog (AI)
- [Fabric MCP Servers, CLI & AI Agents — A Conversation with Hasan Abo-Shally | Fabric Insider Ep. 8](https://radacad.com/fabric-mcp-servers-cli-ai-agents-a-conversation-with-hasan-abo-shally-fabric-insider-ep-8/?utm_source=rss&utm_medium=rss&utm_campaign=fabric-mcp-servers-cli-ai-agents-a-conversation-with-hasan-abo-shally-fabric-insider-ep-8) — RADACAD (Analytics)
- [Asynchronous I/O in DuckDB: Work, Thread, Work](https://duckdb.org/2026/07/31/asynchronous-io.html) — DuckDB (Data)
- [The Conductor Developer](https://martinfowler.com/rachels-ramblings/conductor-developer.html) — Martin Fowler (Delivery)
- [Stateless MCP has recaptured my interest (and inspired mcp-explorer and datasette-mcp)](https://simonwillison.net/2026/Jul/31/stateless-mcp/#atom-entries) — Simon Willison (AI)

### Active projects
- **Orbit — Portfolio & related articles** (live) — Public HQ: Blog MDX in git, portfolio proof, curated Related articles RSS, and Studio JSON edits. Weekly Write drafts can generate; Slack Approve is the publish gate.
- **Nordic Equity Heatmap** (live) — TradingView-style sector board for Nordic large-caps (size = market cap, color = day change %). Lives with the Nordic Equity report in powerbi-portfolio/01-finance — PBIP pages plus this Vite board on Vercel.
- **Power BI — Nordic Boardroom** (shipped) — Shared report grammar: gold tables → semantic model → Landing / Pulse / Drivers / Queue / Context, then PNG sync into Orbit. Import-shaped demos on purpose; screenshots match the repo.
- **Ledger — strategy research cycle** (prototype) — Compare equity strategy families on one sample, switch the working rule only when Sharpe clears ~0.08, then list exits/adds/trims with reasons. I still click the trades; no broker automation.
- **mealplan** (shipped) — Slack-triggered week plan from YAML defaults (overrides in the kickoff message): plate guidance, multi-store grocery split, phone-readable channel post. No checkout; one shared menu.

## Draft JSON shape

Write `data/weekly-write-draft.json` like:

```json
{
  "id": "ww-2026-08-03-ide",
  "status": "pending",
  "createdAt": "<ISO now>",
  "weekOf": "2026-08-03",
  "slug": "<from-title>",
  "title": "<essay title>",
  "summary": "<one sentence>",
  "category": "Data",
  "tags": [],
  "mdx": "---\ntitle: \"...\"\n...\n---\n\n## The question\n...",
  "preview": "<title + summary>",
  "intake": {},
  "source": "ide"
}
```

Copy `intake` from `data/weekly-write-ide-brief.json`.

## Do not

- Do not Slack-notify until the essay draft JSON exists
- Do not write a weekly digest / "what I learned this week" list
- Do not invent project facts not in intake
