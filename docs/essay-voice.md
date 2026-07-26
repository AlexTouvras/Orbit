# Orbit essay voice (shared)

Binding quality bar for **both** `orbit-essay` and `weekly-write-essay`. Open this before drafting. Peer examples: `src/content/writes/building-orbit.mdx`, `from-risk-to-delivery.mdx`, `power-bi-portfolio-nordic-boardroom.mdx`, `ledger-research-cycle-strategy-selection.mdx`.

Also open **Voice from the theses** below. Peer Writes show the blog form; the theses show the owner's reasoning fingerprint. Use the fingerprint to sharpen essays — never to turn them into academic papers.

## What “compelling for humans” means here

A stranger should finish the piece feeling they borrowed a **decision rule**, not a product brochure. Prefer tension → concrete move → limit → takeaway.

| Do | Don't |
|----|-------|
| Open on real friction (a failed habit, a soft question, a Monday mess) | Throat-clear (“In today’s AI landscape…”) |
| Specific nouns (Sharpe gap 0.08, Slack Approve, gold tables, VaR, ECL) | Vague virtue (“robust”, “seamless”, “leverage”) |
| One concrete failure or limit you still live with | Unbroken success narrative |
| Short paragraphs; one idea each | Wall of equal-weight sections |
| Takeaway = rule you will keep | Slogan or CTA deck |
| First person, document what you learned | Feature-announcement / SEO blog tone |
| Name when the “good” move hurts (counter-case) | One-sided win narrative |
| Method before adjective (“challenger vs baseline”) | “Advanced / powerful / innovative” |

## Structure (both paths)

1. `## The question` — one problem in a paragraph (optionally a second short paragraph of stakes).
2. Middle sections — named for the work, not “Background / Overview / Benefits”.
3. `## Takeaway` — one clear conclusion a tired reader can reuse.

Length: ~600–1200 words typical; weekly path hard bounds 500–1600.

## Compelling checklist (fail any → rewrite that section)

- [ ] First screen answers: why should I care *this week*?
- [ ] At least one sentence a peer would underline (decision, constraint, or number).
- [ ] Something stays manual, broken, or uncertain on purpose — named honestly.
- [ ] No digest shape (no “Week of…”, no multi-link roundup as the thesis).
- [ ] Claims (metrics, features, dates) trace to opened sources or are hedged.
- [ ] Would you send this to a hiring manager or peer without apology? If no, cut fluff.
- [ ] If you recommend a move, you also say where it fails or what it costs.
- [ ] Reads like a practitioner deciding, not a student summarizing literature.

## Anti-patterns (reject)

- Listicle marketing, keyword stuffing, unverifiable “#1 / guaranteed”
- Architecture-dump with no human stakes
- Invented workshop capabilities
- Dual thesis (two questions pretending to be one)
- Thesis cosplay: lit-review padding, “this paper examines…”, “the remainder is organized as follows…”, citation stacks, third-person academic distance

## Voice from the theses (Alex)

Sources (public):

- BIF (2019): [Government bonds and credit risk…](https://jyx.jyu.fi/jyx/Record/jyx_123456789_62906)
- BDA (2024): [ECL forecasting for auto loan portfolios](https://www.theseus.fi/handle/10024/860989)

### Steal these moves (improve essays)

1. **Open on a false belief, then correct it.** BIF starts with markets treating all EMU sovereigns as risk-free; the rest of the piece exists to undo that delusion with a measurable alternative. Essays should open the same way: wrong default assumption → why it breaks → what you do instead.

2. **Make the question testable.** Numbered research questions in BIF, nested forecasting stages in BDA. In a Write, one question still — but phrase it so a reader could imagine an evidence check, not a mood.

3. **Named instruments over praise words.** VaR / CVaR, Monte Carlo, PD, LGD, XGBoost vs logistic regression, SHAP, out-of-sample monitoring. Prefer the tool or metric that did the work. If you lack a number, say so; don’t invent one.

4. **Always include the counter-case.** Diversification helps risky sovereign books and can hurt German ones; SBBS moves risk to junior holders rather than deleting it. Essays that recommend a practice must name who loses, when it backfires, or what stays out of scope.

5. **Challenger vs baseline.** BDA pits XGBoost against logistic regression and nests early performance into maturity ECL. When comparing approaches in a Write, say what lost and why the winner still isn’t free.

6. **Translate risk into a decision.** Capital held, loan supply, reforecast at admission, stress with a systematic shock. End sections with “so what do you do Monday?” — not “therefore it is important.”

7. **Scope limits as credibility.** Both theses say what they did *not* settle (SBBS demand/ratings; portfolio transferability). In essays, one honest limit beats a tidy bow.

8. **Ground in a real book or geography.** Auto loans (FI/DK), five euro-area countries, Nordic banking, Azure ops. Prefer a concrete portfolio or team over “organizations today.”

### Do not import (would worsen essays)

| Thesis habit | Why it hurts Orbit Writes |
|--------------|---------------------------|
| Literature review / citation chains | Blog readers came for a decision rule, not a survey |
| “This paper / thesis examines…” scaffolding | Breaks first-person Orbit voice |
| Long uniform paragraphs, chapter roadmap | Peer Writes win with short grafs and named sections |
| Passive academic glue (“it is thus essential”, “being as it may”) | Sounds like a committee, not Alex |
| Stacking Furthermore / Moreover / Additionally | ESL/academic cadence; vary connectors or cut |
| Third-person distance | Orbit is first person; keep “I” and lived friction |
| Emulating thesis length or formality | Cap ~600–1200 words; keep conversational precision |

### Fingerprint in one line

**Quantitative skeptic who treats uncertainty as a design input: wrong assumption → measurable method → conditional result → named limit.**

If a draft sounds warmer but vaguer than that, rewrite toward the fingerprint. If it sounds like a journal article, rewrite toward the peer Writes.

## Path reminder

| Path | Skill | Publish |
|------|--------|---------|
| Weekly Signal | `weekly-write-essay` | Slack Approve |
| Showcase / response / rewrite | `orbit-essay` | Direct MDX + user AUTH for git |
