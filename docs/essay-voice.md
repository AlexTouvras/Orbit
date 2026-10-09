# Orbit essay voice (shared)

Binding quality bar for **both** `orbit-essay` and `weekly-write-essay`. Open this before drafting. Peer examples: `src/content/writes/building-orbit.mdx`, `from-risk-to-delivery.mdx`, `when-the-coach-got-gate-ranks.mdx`, `useful-work-per-dollar-what-delivery-and-analytics-should-change-first.mdx`. Prefer at least one non-Power-BI peer when the draft is not itself a Power BI piece.

Also open **Voice from the theses** below. Peer Writes show the blog form; the theses show the owner's reasoning fingerprint. Use the fingerprint to sharpen essays — never to turn them into academic papers.

Also open personal skill `anti-ai-slop-writing` (and its banned-words list) before drafting. Orbit essays must pass a stranger-and-human test, not only a structure checklist.

## Primary reader (binding)

Write for an **external stranger**: a hiring manager, peer, or curious reader who has never heard of your repos, nicknames, or tool stack, and who may not work in AI, agents, data, or analytics.

| Do | Don't |
|----|-------|
| Define every project nickname on first use in plain language ("a shared notes vault I call Ravens") | Drop Ravens, Heimdall, Huginn, Muninn, JARVIS, field cards, Arc Mode, Studio, etc. as if the reader already lives in the workshop |
| Prefer the plain description; keep the nickname optional after the gloss | Make the nickname do the explanatory work |
| Translate metrics once (fitness load / freshness, not only CTL / TSB) | Assume CTL, TSB, MCP, Direct Lake, semantic model, gold tables are common knowledge |
| One decision rule a non-specialist can reuse Monday | Architecture dump, tool catalog, or MCP method list as the body |
| Category and topic that match the thesis, not the default stack | Another Power BI / Fabric piece when Delivery, Learning, Career, or general data would fit better |

**Stranger test (fail any → rewrite):** Cover the byline and project names. Could a smart friend outside tech finish the piece and state the decision rule in one sentence? If they would ask "what is Ravens?", the gloss failed.

## What "compelling for humans" means here

A stranger should finish the piece feeling they borrowed a **decision rule**, not a product brochure. Prefer tension → concrete move → limit → takeaway.

| Do | Don't |
|----|-------|
| Open on real friction (a failed habit, a soft question, a Monday mess) | Throat-clear ("In today's AI landscape…") |
| Specific nouns, defined once for outsiders (Slack Approve, gold tables, VaR, ECL) | Vague virtue ("robust", "seamless", "leverage") |
| One concrete failure or limit you still live with | Unbroken success narrative |
| Short paragraphs; one idea each | Wall of equal-weight sections |
| Takeaway = rule you will keep | Slogan, CTA deck, or "interesting hire" pitch |
| First person, document what you learned | Feature-announcement / SEO blog tone |
| Name when the "good" move hurts (counter-case) | One-sided win narrative |
| Method before adjective ("challenger vs baseline") | "Advanced / powerful / innovative" |
| Varied sentence length; connective tissue between thoughts | Parataxis stacks; Rule-of-Three lists; bookend summary that restates the opener |

## Topic and category balance (weekly + showcase)

Valid categories: `Career` | `Data` | `AI` | `Delivery` | `Learning`.

- Prefer the category that matches the **decision rule**, not the stack you used to learn it. Institutional memory → Delivery. Habit design → Learning. Role change → Career. General measurement / evidence habits → Data even when no Power BI appears.
- **Do not default weekly essays to Power BI / Fabric.** Rotate across Delivery, Learning, Career, general data topics (measurement, contracts, evidence, ops), and AI only when the thesis is actually about AI.
- Before locking a Data/AI draft, ask: is there a stronger Delivery or Learning angle with the same Signal? If yes, take it.
- Across a month of weekly Writes, avoid three consecutive Power BI / Fabric / semantic-model pieces unless the user explicitly asks.

## Structure (both paths)

1. `## The question` — one problem in a paragraph (optionally a second short paragraph of stakes).
2. Middle sections — named for the work, not "Background / Overview / Benefits".
3. `## Takeaway` — one clear conclusion a tired reader can reuse.

Length: ~600–1200 words typical; weekly path hard bounds 500–1600.

## Compelling checklist (fail any → rewrite that section)

- [ ] First screen answers: why should I care *this week*?
- [ ] Stranger test passes (nicknames glossed; metrics translated; decision rule portable)
- [ ] At least one sentence a peer would underline (decision, constraint, or number)
- [ ] Something stays manual, broken, or uncertain on purpose — named honestly
- [ ] No digest shape (no "Week of…", no multi-link roundup as the thesis)
- [ ] Claims (metrics, features, dates) trace to opened sources or are hedged
- [ ] Would you send this to a hiring manager or peer without apology? If no, cut fluff
- [ ] A hiring manager can retell the decision, what you rejected, and what you will not claim
- [ ] If you recommend a move, you also say where it fails or what it costs
- [ ] Reads like a practitioner deciding, not a student summarizing literature
- [ ] Would not be mistaken for raw LLM output (banned words, em-dash budget, no tricolon habit)

## Hiring-manager story (weekly Writes)

Owner ask, 2026-10-09, after a hiring-demand conversation. Weekly Writes already work. The next level is that a hiring manager in Finland or the Nordics can retell the piece as evidence of how you lead a decision.

Essays stay MDX prose. The picture, the cast, and the thing a visitor can move stay on live desks and `/stories`.

### Two jobs, one essay

1. **The story.** A consequential decision, a false belief, evidence that moves it.
2. **The judgment.** Enough of the work behind that story that a stranger can see you frame, choose, reject, and limit.

Before the draft is locked, answer these in sentences a stranger could repeat:

- What decision is this?
- What did I assume, and which evidence moved me?
- What did I choose, and what did I reject?
- What stays unproven, broken, or out of scope?
- What should change on Monday, and where does that move fail?

Those answers live inside the existing shape (`## The question`, middle sections named for the work, `## Takeaway`). If an answer is missing, rewrite a section. If the answers only appear as a checklist at the end, fold them back into the prose.

One link of the chain leads: business problem → data → intelligent system → delivery → measurable outcome. A second link may support it. Prefer the gap between a demo that works and a decision a team can own. A Signal about a tool still has to land on that gap.

### Leave these out

| Tempting addition | Why it stays out |
|-------------------|------------------|
| A standing `## Behind the decision` card (sources, system design, validation, delivery, next step) | Turns the close into a lab report. The same facts belong in the sections, in sentences. |
| Role-title badges, a competency pair, or a hiring soft-close | The essay is the evidence. A pitch undoes it. Career may name a role change only when the user asked for that angle. |
| A month of topics chosen in advance | This week's Signal still picks the thesis. The territory only chooses the angle. |
| A hypothetical company as the default subject | Open on friction from the Signal or from work you can say in public. If a scene is synthetic, say so in one clause. |
| Interactive charts, a film, or a metadata block beside the essay | Desks and `/stories` already carry the picture. Weekly Writes stay prose. |
| A volume target | One essay that survives an interview conversation is the unit. |
| A market statistic you did not open | Cite the primary Signal. Hedge anything you did not read. |

### Fail (rewrite)

- A hiring manager outside the workshop cannot say what you decided, what you rejected, and what you will not claim.
- The piece is a good story with no judgment, or a method note with no stakes.
- The close sells the author.

## Anti-patterns (reject)

- Listicle marketing, keyword stuffing, unverifiable "#1 / guaranteed"
- Architecture-dump with no human stakes
- Invented workshop capabilities
- Dual thesis (two questions pretending to be one)
- Thesis cosplay: lit-review padding, "this paper examines…", "the remainder is organized as follows…", citation stacks, third-person academic distance
- Insider codename essay (workshop slang without gloss)
- Tool-catalog essay (lists of MCP tools, file paths, or CLI flags as the narrative)
- Power BI tunnel vision when the Signal supports Delivery / Learning / Career / general data
- Hiring-manager soft close ("ask for the repos", "the interesting hire") unless the piece is explicitly Career and the user asked for that angle
- Story with no judgment, or a method note with no stakes
- A trailing evidence card or role badge standing in for the prose

## Punctuation and cadence (anti-slop)

- Em dashes: at most one per ~500 words. Prefer commas, semicolons, colons, parentheses, or a new sentence.
- No three consecutive sentences of similar length. Mix short and long.
- No default lists of three. Use two, four, or one when that is honest.
- No "It's not X, it's Y" more than once per piece.
- Load `anti-ai-slop-writing` banned words; never ship delve / landscape / tapestry / seamless / robust (as marketing) / leverage (as verb) / unlock / foster / pivotal / etc.

## Voice from the theses (Alex)

Sources (public):

- BIF (2019): [Government bonds and credit risk…](https://jyx.jyu.fi/jyx/Record/jyx_123456789_62906)
- BDA (2024): [ECL forecasting for auto loan portfolios](https://www.theseus.fi/handle/10024/860989)

### Steal these moves (improve essays)

1. **Open on a false belief, then correct it.** BIF starts with markets treating all EMU sovereigns as risk-free; the rest of the piece exists to undo that delusion with a measurable alternative. Essays should open the same way: wrong default assumption → why it breaks → what you do instead.

2. **Make the question testable.** Numbered research questions in BIF, nested forecasting stages in BDA. In a Write, one question still — but phrase it so a reader could imagine an evidence check, not a mood.

3. **Named instruments over praise words.** VaR / CVaR, Monte Carlo, PD, LGD, XGBoost vs logistic regression, SHAP, out-of-sample monitoring. Prefer the tool or metric that did the work, **and define it in one clause for outsiders**. If you lack a number, say so; don't invent one.

4. **Always include the counter-case.** Diversification helps risky sovereign books and can hurt German ones; SBBS moves risk to junior holders rather than deleting it. Essays that recommend a practice must name who loses, when it backfires, or what stays out of scope.

5. **Challenger vs baseline.** BDA pits XGBoost against logistic regression and nests early performance into maturity ECL. When comparing approaches in a Write, say what lost and why the winner still isn't free.

6. **Translate risk into a decision.** Capital held, loan supply, reforecast at admission, stress with a systematic shock. End sections with "so what do you do Monday?" — not "therefore it is important."

7. **Scope limits as credibility.** Both theses say what they did *not* settle (SBBS demand/ratings; portfolio transferability). In essays, one honest limit beats a tidy bow.

8. **Ground in a real book or geography.** Auto loans (FI/DK), five euro-area countries, Nordic banking, Azure ops. Prefer a concrete portfolio or team over "organizations today."

### Do not import (would worsen essays)

| Thesis habit | Why it hurts Orbit Writes |
|--------------|---------------------------|
| Literature review / citation chains | Blog readers came for a decision rule, not a survey |
| "This paper / thesis examines…" scaffolding | Breaks first-person Orbit voice |
| Long uniform paragraphs, chapter roadmap | Peer Writes win with short grafs and named sections |
| Passive academic glue ("it is thus essential", "being as it may") | Sounds like a committee, not Alex |
| Stacking Furthermore / Moreover / Additionally | ESL/academic cadence; vary connectors or cut |
| Third-person distance | Orbit is first person; keep "I" and lived friction |
| Emulating thesis length or formality | Cap ~600–1200 words; keep conversational precision |

### Fingerprint in one line

**Quantitative skeptic who treats uncertainty as a design input: wrong assumption → measurable method → conditional result → named limit.**

If a draft sounds warmer but vaguer than that, rewrite toward the fingerprint. If it sounds like a journal article, rewrite toward the peer Writes. If it sounds like a private Slack for people who already know the workshop, rewrite for the stranger.

## Frontmatter for SEO (automatic)

Valid MDX frontmatter is enough for discovery — no hand-written meta tags. On a **substantive rewrite**, set `updated: "YYYY-MM-DD"` and keep the original `date`. First publishes omit `updated`. Details: `CONTENT.md` §1.

## Path reminder

| Path | Skill | Publish |
|------|--------|---------|
| Weekly Signal | `weekly-write-essay` | Slack Approve |
| Showcase / response / rewrite | `orbit-essay` | Direct MDX + user AUTH for git |
