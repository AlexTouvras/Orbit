# Orbit essay voice

Binding bar for `orbit-essay` and `weekly-write-essay`. Read this before drafting, then personal skill `anti-ai-slop-writing`.

Peers: `building-orbit.mdx`, `from-risk-to-delivery.mdx`, `when-the-coach-got-gate-ranks.mdx`, `useful-work-per-dollar-what-delivery-and-analytics-should-change-first.mdx`. When the draft is not Power BI, open a non-Power-BI peer.

The reader is a stranger: a hiring manager, a peer, or a curious person who has never heard the workshop nicknames and may not work in AI, data, or analytics. They should leave with one decision rule they can use Monday.

Fingerprint: wrong assumption → measurable method → conditional result → named limit. First person. A journal tone goes back toward the peers. Workshop slang goes back toward the stranger.

## Before paragraphs

1. Write five headlines. Keep the one that names a real tension the essay delivers. A topic label fails.
2. Write five notes: the decision, the evidence that moved it, what you rejected, what stays unproven, and what changes Monday, including where that move fails. If the claim or the evidence does not hold, change the thesis. Line edits wait until the notes survive.

Those notes live in the sections. A checklist pasted at the end fails.

## Shape

1. `## The question` — one problem, and why it matters this week.
2. Middle sections named for the work.
3. `## Takeaway` — one rule a tired reader can reuse.

About 600–1200 words. Weekly hard bounds: 500–1600.

One link of the chain leads: business problem → data → intelligent system → delivery → measurable outcome. A second link may support it. Prefer the gap between a demo that works and a decision a team can own. A Signal about a tool still has to land on that gap.

Category matches the decision, not the stack: `Career` | `Data` | `AI` | `Delivery` | `Learning`. Institutional memory → Delivery. Habit → Learning. Role change → Career. Measurement → Data. Do not default to Power BI / Fabric. Before locking Data or AI, ask whether Delivery or Learning fits the same Signal. Avoid three Power BI pieces in a row unless the user asks.

## Pass

Fail any of these and rewrite the section.

- The title names a tension the essay delivers.
- A stranger can say the decision, what you rejected, and what you will not claim.
- Nicknames are glossed on first use. Metrics are translated once (fitness load, not only CTL).
- It opens on friction or a false belief. Nouns are specific. One sentence is worth underlining (a decision, a constraint, or a number).
- It names where the move fails, who loses, or what stays broken.
- Claims trace to a source you opened, or they are hedged. A hypothetical scene says so in one clause. No invented numbers, quotations, or project outcomes.
- One thesis. Not a digest, a tool catalog, an architecture dump, or a literature review.
- The takeaway is a rule you will keep. It does not sell the author, name a target job, or end on a role badge.
- Cadence: at most one em dash per ~500 words; no three sentences of similar length in a row; no default list of three; "It's not X, it's Y" at most once. Banned words from `anti-ai-slop-writing` (delve, landscape, tapestry, seamless, robust, leverage as a verb, unlock, foster, pivotal).

## Leave out

| Addition | Why it stays out |
|----------|------------------|
| A standing `## Behind the decision` card | Turns the close into a lab report. Those facts belong in the sections. |
| A role badge, a competency pair, or a hiring soft-close | The essay is the evidence. Career may name a role change only when the user asked. |
| A month of topics chosen in advance | This week's Signal picks the thesis. |
| A hypothetical company as the default subject | Open on the Signal, or on work you can say in public. |
| Charts, a film, or a metadata block beside the essay | Desks and `/stories` carry the picture. Writes stay prose. |
| A volume target | One essay that survives a conversation is the unit. |
| A market statistic you did not open | Cite the primary Signal. Hedge anything you did not read. |

## Moves from the theses

Use the reasoning. Leave the academic form. Sources: [BIF 2019](https://jyx.jyu.fi/jyx/Record/jyx_123456789_62906), [BDA 2024](https://www.theseus.fi/handle/10024/860989).

- Open on a false belief, then correct it with something measurable.
- Phrase the question so a reader could imagine an evidence check.
- Name the instrument (VaR, PD, LGD, a challenger against a baseline) and define it in one clause. Say what lost, and why the winner still costs something.
- End a section on what changes Monday.
- Ground it in a real book or place (auto loans in Finland or Denmark, Nordic banking), not "organizations today."

Leave out literature reviews, "this paper examines", chapter roadmaps, passive academic glue, stacks of Furthermore / Moreover, third person, and thesis length.

## SEO

Valid frontmatter is enough. On a substantive rewrite, set `updated` and keep the original `date`. A first publish omits `updated`. Details: `CONTENT.md` §1.

## Paths

| Path | Skill | Publish |
|------|--------|---------|
| Weekly Signal | `weekly-write-essay` | Slack Approve |
| Showcase / response / rewrite | `orbit-essay` | MDX after the user says to commit |
