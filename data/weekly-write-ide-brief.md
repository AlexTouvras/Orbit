# Weekly Write — IDE generation needed

Cursor Cloud Automation writes this week's essay (Gemini skipped). **Generate the essay in Cursor**, then continue the normal Slack approve pipeline.

## Why

`cloud_automation`

Created: 2026-08-24T09:03:00.825Z  
Week of: 2026-08-24

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
- **Primary inspiration:** [Tools With Interactive UIs In Fabric Notebooks With Semantic Link Labs](https://blog.crossjoin.co.uk/2026/08/23/tools-with-interactive-uis-in-fabric-notebooks-with-semantic-link-labs/) (Chris Webb's BI Blog)
- **Snippet:** There’s so much going on in the Fabric community that it can be hard to keep up with it all. Semantic Link Labs is a great example: in the six months or so since I last had a proper look at it my colleague Michael Kovalsky has done a whole load of cool things and … Continue readi…
- **Optional project bridge:** Orbit — Portfolio & related articles — Public HQ: Blog MDX in git, portfolio proof, curated Related articles RSS, and Studio JSON edits. Weekly Write drafts can generate; Slack Approve is the publish gate.
- **Suggested category:** Data
- **Suggested tags:** Power BI, Analytics, Next.js, React

## Intake (reference only)

### Signals
- [Tools With Interactive UIs In Fabric Notebooks With Semantic Link Labs](https://blog.crossjoin.co.uk/2026/08/23/tools-with-interactive-uis-in-fabric-notebooks-with-semantic-link-labs/) — Chris Webb's BI Blog (Analytics)
- [Data Engineering Weekly #284](https://www.dataengineeringweekly.com/p/data-engineering-weekly-284) — Data Engineering Weekly (Data)
- [[Episode 5] AI Effects When You Use It In Building Your Product](https://www.scrum.org/resources/blog/episode-5-ai-effects-when-you-use-it-building-your-product) — Scrum.org (Delivery)
- [Introducing AI Futures](https://openai.com/index/introducing-ai-futures) — OpenAI Blog (AI)
- [Displaying The Output Of Detail Rows Expressions In Power BI Reports Using The Paginated Report Visual](https://blog.crossjoin.co.uk/2026/08/16/displaying-the-output-of-detail-rows-expressions-in-power-bi-reports-using-the-paginated-report-visual/) — Chris Webb's BI Blog (Analytics)
- [Connecting retail demand planning to campaign and store execution](https://www.databricks.com/blog/connecting-retail-demand-planning-campaign-and-store-execution) — Databricks Blog (Data)
- [You Priced Being Late. Nobody Priced Being Early.](https://www.scrum.org/resources/blog/you-priced-being-late-nobody-priced-being-early) — Scrum.org (Delivery)
- [Stampli cuts launch hours by 68% using ChatGPT Work](https://openai.com/index/stampli) — OpenAI Blog (AI)

### Active projects
- **Orbit — Portfolio & related articles** (live) — Public HQ: Blog MDX in git, portfolio proof, curated Related articles RSS, and Studio JSON edits. Weekly Write drafts can generate; Slack Approve is the publish gate.
- **Nordic Equity Heatmap** (live) — TradingView-style sector board for Nordic large-caps (size = market cap, color = day change %). Lives with the Nordic Equity report in powerbi-portfolio/01-finance — PBIP pages plus this Vite board on Vercel.
- **Power BI — Nordic Boardroom** (shipped) — Shared report grammar: gold tables → semantic model → Landing / Pulse / Drivers / Queue / Context, then PNG sync into Orbit. Import-shaped demos on purpose; screenshots match the repo.
- **Ledger — strategy research cycle** (prototype) — Compare equity strategy families on one sample, switch the working rule only when Sharpe clears ~0.08, then list exits/adds/trims with reasons. I still click the trades; no broker automation.
- **mealplan** (shipped) — Slack-triggered week plan from YAML defaults (overrides in the kickoff message): plate guidance, multi-store grocery split, phone-readable channel post. No checkout; one shared menu.
- **Personal ops coach (git + Slack)** (prototype) — Science-backed personal coach: Intervals form (CTL/ATL/TSB) + Slack RPE → AthleteState → Sunday week plan in Slack. Concurrent run/lift rules, readiness cuts, phone-first week. Domain is training; payoff is less Monday negotiation.

## Draft JSON shape

Write `data/weekly-write-draft.json` like:

```json
{
  "id": "ww-2026-08-24-ide",
  "status": "pending",
  "createdAt": "<ISO now>",
  "weekOf": "2026-08-24",
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
