# Weekly Write — IDE generation needed

Cursor Cloud Automation writes this week's essay (Gemini skipped). **Generate the essay in Cursor**, then continue the normal Slack approve pipeline.

## Why

`cloud_automation`

Created: 2026-07-27T09:02:08.530Z  
Week of: 2026-07-27

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
- **Primary inspiration:** [What Is Fabric App or Rayfin and Why You Should Care](https://radacad.com/what-is-fabric-app-or-rayfin-and-why-you-should-care/?utm_source=rss&utm_medium=rss&utm_campaign=what-is-fabric-app-or-rayfin-and-why-you-should-care) (RADACAD)
- **Snippet:** Imagine an application built entirely inside the Microsoft Fabric environment. Not an application that connects to Fabric. Not an application that reads from a Fabric data source. An application where the database is a Fabric SQL database, the semantic model is a Power BI semanti…
- **Optional project bridge:** Orbit — Portfolio & related articles — Public HQ: Blog MDX in git, portfolio proof, curated Related articles RSS, and Studio JSON edits. Weekly Write drafts can generate; Slack Approve is the publish gate.
- **Suggested category:** Data
- **Suggested tags:** Power BI, AI, Analytics, Next.js, React

## Intake (reference only)

### Signals
- [Power BI, M365 Copilot And The Importance Of DAX UDFs](https://blog.crossjoin.co.uk/2026/07/26/power-bi-m365-copilot-and-the-importance-of-dax-udfs/) — Chris Webb's BI Blog (Analytics)
- [Data Engineering Weekly #280](https://www.dataengineeringweekly.com/p/data-engineering-weekly-280) — Data Engineering Weekly (Data)
- [The Project Manager Isn't Dead. It Was Disassembled on Purpose!](https://www.scrum.org/resources/blog/project-manager-isnt-dead-it-was-disassembled-purpose) — Scrum.org (Delivery)
- [Launching Health in ChatGPT](https://openai.com/index/health-in-chatgpt) — OpenAI Blog (AI)
- [What Is Fabric App or Rayfin and Why You Should Care](https://radacad.com/what-is-fabric-app-or-rayfin-and-why-you-should-care/?utm_source=rss&utm_medium=rss&utm_campaign=what-is-fabric-app-or-rayfin-and-why-you-should-care) — RADACAD (Analytics)
- [How the FDA Built an AI Platform That 85% of Its Staff Now Use Daily](https://www.databricks.com/blog/how-fda-built-ai-platform-85-its-staff-now-use-daily) — Databricks Blog (Data)
- [The Pyramid of Impediments](https://www.scrum.org/resources/blog/pyramid-impediments) — Scrum.org (Delivery)
- [OpenAI’s accidental cyberattack against Hugging Face is science fiction that happened](https://simonwillison.net/2026/Jul/22/openai-cyberattack/#atom-entries) — Simon Willison (AI)

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
  "id": "ww-2026-07-27-ide",
  "status": "pending",
  "createdAt": "<ISO now>",
  "weekOf": "2026-07-27",
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
