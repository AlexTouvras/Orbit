# Weekly Write — IDE generation needed

Gemini cloud generation failed or was unavailable. **Generate the essay in Cursor**, then continue the normal Slack approve pipeline.

## Why

`gemini_unavailable`

Created: 2026-07-21T06:36:56.643Z  
Week of: 2026-07-20

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
- **Primary inspiration:** [Using Fabric Operations Agents And Workspace Monitoring With Power BI](https://blog.crossjoin.co.uk/2026/07/19/using-fabric-operations-agents-and-workspace-monitoring-with-power-bi/) (Chris Webb's BI Blog)
- **Snippet:** This week, in the announcement about support for Fabric Pipelines in Workspace Monitoring, I noticed that it came with an Operations Agent that actively monitors and analyses Pipeline activity. And that got me thinking, since Workspace Monitoring also contains Power BI activity d…
- **Optional project bridge:** Orbit — Portfolio & Radar — This site: a personal portfolio bank and a self-updating news radar across AI, Data, and Delivery, with a built-in Studio for editing content and publishing projects.
- **Suggested category:** Data
- **Suggested tags:** Power BI, Agents, Data, Analytics, Next.js, React

## Intake (reference only)

### Signals
- [Data Engineering Weekly #279](https://www.dataengineeringweekly.com/p/data-engineering-weekly-279) — Data Engineering Weekly (Data)
- [Using Fabric Operations Agents And Workspace Monitoring With Power BI](https://blog.crossjoin.co.uk/2026/07/19/using-fabric-operations-agents-and-workspace-monitoring-with-power-bi/) — Chris Webb's BI Blog (Analytics)
- [A scorecard for the AI age](https://openai.com/index/a-scorecard-for-the-ai-age) — OpenAI Blog (AI)
- [Why teens deserve access to safe AI](https://openai.com/index/why-teens-deserve-access-safe-ai) — OpenAI Blog (AI)
- [How Cars24 scales conversations and builds faster with OpenAI](https://openai.com/index/cars24) — OpenAI Blog (AI)
- [The US is advancing AI safety through state and federal action](https://openai.com/index/advancing-ai-safety-through-state-and-federal-action) — OpenAI Blog (AI)
- [GPT-Red: Unlocking Self-Improvement for Robustness](https://openai.com/index/unlocking-self-improvement-gpt-red) — OpenAI Blog (AI)
- [How to manage AI investments in the agentic era](https://openai.com/index/managing-ai-investments-in-agentic-era) — OpenAI Blog (AI)

### Active projects
- **Orbit — Portfolio & Radar** (wip) — This site: a personal portfolio bank and a self-updating news radar across AI, Data, and Delivery, with a built-in Studio for editing content and publishing projects.
- **Faceless Reels** (wip) — An automated short-form video pipeline for Greek-mythology reels: beat-split narration, AI image generation with a quality loop, neural TTS, and karaoke-style captions.
- **Sunplot Garden** (prototype) — A cozy mobile gardening game (Unity) built as a studio repo with an agent-driven content pipeline and a vertical-grid layout system.

## Draft JSON shape

Write `data/weekly-write-draft.json` like:

```json
{
  "id": "ww-2026-07-20-ide",
  "status": "pending",
  "createdAt": "<ISO now>",
  "weekOf": "2026-07-20",
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
