# Weekly Write — IDE generation needed

Cursor Cloud Automation writes this week's essay (Gemini skipped). **Generate the essay in Cursor**, then continue the normal Slack approve pipeline.

## Why

`cloud_automation`

Created: 2026-08-10T09:01:32.574Z  
Week of: 2026-08-10

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
- **Primary inspiration:** [Rayfin Data App — The Future of Power BI Reporting](https://radacad.com/rayfin-data-app-the-future-of-power-bi-reporting/?utm_source=rss&utm_medium=rss&utm_campaign=rayfin-data-app-the-future-of-power-bi-reporting) (RADACAD)
- **Snippet:** You can build an application whose frontend is TypeScript and ReactJS, and whose backend is a Power BI semantic model — meaning you get a fully interactive, visualized report inside your application without it being a Power BI report at all. Project Rayfin makes this possible. An…
- **Optional project bridge:** Orbit — Portfolio & related articles — Public HQ: Blog MDX in git, portfolio proof, curated Related articles RSS, and Studio JSON edits. Weekly Write drafts can generate; Slack Approve is the publish gate.
- **Suggested category:** Data
- **Suggested tags:** Power BI, Analytics, AI, Next.js, React

## Intake (reference only)

### Signals
- [Using Detail Rows Expressions To Drill To A Different Fact Table In Power BI](https://blog.crossjoin.co.uk/2026/08/09/using-detail-rows-expressions-to-drill-to-a-different-fact-table-in-power-bi/) — Chris Webb's BI Blog (Analytics)
- [Data Engineering Weekly #282](https://www.dataengineeringweekly.com/p/data-engineering-weekly-282) — Data Engineering Weekly (Data)
- [AI Tools Evaluation & Approval Framework for Scrum Teams](https://www.scrum.org/resources/blog/ai-tools-evaluation-approval-framework-scrum-teams) — Scrum.org (Delivery)
- [Now we have a timeline of the OpenAI accidental attack against Hugging Face](https://simonwillison.net/2026/Aug/7/openai-timeline/#atom-entries) — Simon Willison (AI)
- [Rayfin Data App — The Future of Power BI Reporting](https://radacad.com/rayfin-data-app-the-future-of-power-bi-reporting/?utm_source=rss&utm_medium=rss&utm_campaign=rayfin-data-app-the-future-of-power-bi-reporting) — RADACAD (Analytics)
- [Managing AI Coding Costs at Scale](https://www.databricks.com/blog/managing-ai-coding-costs-scale) — Databricks Blog (Data)
- [Cognitive Trap: Scrum Master as a Manager](https://www.scrum.org/resources/blog/cognitive-trap-scrum-master-manager) — Scrum.org (Delivery)
- [Responding to the next frontier of critical cyber capabilities](https://openai.com/index/responding-next-frontier-critical-cyber-capabilities) — OpenAI Blog (AI)

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
  "id": "ww-2026-08-10-ide",
  "status": "pending",
  "createdAt": "<ISO now>",
  "weekOf": "2026-08-10",
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
