# Field card review (Orbit)

A second Cursor agent is the monthly gate. It does not write the card. It compares the proposed `index.html` to the live one, then **publishes** or **keeps the previous card**.

All six Hub cards are on this monthly cadence. This agent publishes the three source-repo cards. SDLC, Credit Risk, and Data & Visual Storytelling are judged in the 17:00 hosted pass.

1st of the month 17:00 local drafts the PR. This agent runs 1st 18:00 local (`0 15 1 * *` UTC).

## Cards

| Card | Repo | Live |
|---|---|---|
| Agentic AI | `AlexTouvras/agentic-ai-field-card` | https://alextouvras.com/field-card/ |
| Data Analytics | `AlexTouvras/data-analytics-field-card` | https://alextouvras.com/analytics-field-card/ |
| Technology Delivery | `AlexTouvras/technology-delivery-field-card` | https://alextouvras.com/delivery-field-card/ |

Orbit also hosts **SDLC** (`/sdlc-field-card/`), **Credit Risk** (`/credit-risk-field-card/`), **Data & Visual Storytelling** (`/story-field-card/`), and **Bayesian optimisation** (`/bayes-field-card/`). Those are judged on Orbit in the 17:00 hosted pass (picker/jobs + stamp). They are not in this Apply-review loop. Bayes is a method card, not a Hub competency. Story is a Hub competency.

## For each open monthly PR (`chore/monthly-refresh-YYYY-MM`)

1. Fetch `index.html` on the PR head and on `main`.
2. Read the PR `## Summary` and `data/link-report.json` on the PR head if present.
3. Check the card-specific spine below. Never invent docs URLs.
4. Decide **approve** (publish) or **decline** (keep the live card).
5. Apply — do not merge with `gh pr merge`. Run:

```bash
gh workflow run "Apply review" --repo <repo> -f pr_number=<N> -f decision=approve -f note="<one laconic sentence: what changed or why no-change>"
# or decision=decline
```

6. **One Slack post per card** (never a multi-card dump). Prefer Orbit's FYI from Apply review. Only post yourself when Apply review failed or Orbit did not notify.

### Laconic #orbit FYI (identical shape for all three cards)

```
*<Card label>*
Review: published | kept previous | blocked
Considered: <short list or “none earned entry”>
Changed: <one line — what entered / stamp-only / why declined>
Online: yes · <detail>   OR   no · previous still live
[Check card]   ← button to live site URL (or Open PR when blocked)
```

Rules for that post:
- One card = one message. Same fields every time (always include Considered).
- Keep each line short. No bullet walls. No discovery stats dumps.
- `Considered` = what you weighed for the picker/table. `Changed` = what actually shipped (or why not).
- `Online: yes` only when the newest reviewed version is (or is about to be) the live site card.
- Button is a real Slack **actions** button labeled **Check card** (or **Open PR** when blocked).

If a card has no open monthly PR, **still ship the month**: create `chore/monthly-refresh-YYYY-MM` from `main`, bump the version stamp only (`Reviewed <month> · Next: <next month>`), write `## Summary` with `Decision: no-change`, then Apply review **approve**. Do not skip the 1st with a silent live card. Do not open `chore/weekly-refresh-*`.

## Publish when

- The proposed HTML is a real improvement: picker swap by constraint, docs URL fix, or a new *job* in the decision table.
- Or the HTML is unchanged aside from the monthly stamp, and the spine is intact (reviewed, no worse). **Stamp-only still publishes.**
- Missing `## Summary` on a stamp-only PR is not a decline — write the note in Apply review and publish.
- Picker is still ≤7 rows.
- Link check is clean on URLs this PR touched.
- Always-on strip, kill switch, and anti-patterns are still there.

## Keep the previous card when

- The PR is discovery noise that would make the public card worse (brochure language, extra picker rows, invented URLs).
- Link check failed on URLs the PR touched.
- You cannot tell what changed and the HTML is not a stamp-only bump.

When keeping previous, decline. Do not try to fix the HTML in this run.

## Spines (do not break)

- **AI:** H1 `Agentic AI is a loop, not a menu` (do not treat “loop” as a break or restore “stack”; analytics owns stack). RAG → AGENT → MCP → A2A, thin LLM floor, verb line, Always on strip. Not a vendor wall. CSS `.stack` is layout only.
- **Analytics:** ASK → GRAIN → TRUTH → USE. Not a Fabric/Power BI brochure.
- **Delivery:** INTENT → WINDOW → PROOF → CUTOVER. Not Scrum/SAFe/Azure DevOps brochure.
- **SDLC** (Orbit-hosted, monthly): H1 `Write the plan before the code`. Opening PLAN → SPEC → DESIGN → BUILD → TEST. Security is named in design (who can reach the data) and checked in test. Job table still judges a written plan, threat-in-design, smallest build, and tests before merge. Cutover stays on Delivery. Not a SAFe brochure.
- **Credit risk** (Orbit-hosted, monthly): ORIGINATE → MONITOR → STAGE → PROVISION. Not a vendor/scorecard brochure. Grain/gold stays on Analytics.
- **Data & visual storytelling** (Orbit-hosted, monthly): H1 `A reading order, not a dashboard`. ASK → CAST → SHOW → MOVE → CLOSE. Charts and themes are lanes. Essays stay prose. Grain stays on Analytics. Cutover stays on Delivery.
- **Bayesian optimisation** (Orbit-hosted method, not Hub): H1 `Bayesian optimisation is a budget of trials, not a search of space`. BOUND → MODEL → ACQ → STOP. Lede is the scarce-trial loop, not the layers/lanes clone. Inference is MODEL only. Not a BoTorch/Ax/AutoML brochure.

## Backup

If this agent misses, the fleet check on the first weekday on or after the 2nd posts a FYI in #orbit. Finish by re-running this agent (or Apply review). Slack is not the gate. There is no Monday weekly-refresh flag.

## Monthly hosted cards (SDLC, Credit Risk, Story, Bayesian optimisation)

Judged on Orbit at 17:00 on the 1st, not via source-repo Apply review.

Run `.cursor/automations/hosted-field-card-monthly-review.json`:

1. This is a discovery pass. Judge picker rows and job-table examples against the spine (SDLC: PLAN → SPEC → DESIGN → BUILD → TEST; Credit: ORIGINATE → MONITOR → STAGE → PROVISION; Story: ASK → CAST → SHOW → MOVE → CLOSE; Bayes: BOUND → MODEL → ACQ → STOP). Swap by constraint, not hype. Do not stamp-only skip the judgment.
2. Bump the footer stamp: `Reviewed <Month YYYY> · Next: <next month>`. Changed line stays “Monthly review — picker and jobs unchanged” unless the HTML actually changed.
3. Open `chore/monthly-field-cards-YYYY-MM` on Orbit. Do not touch the three source-repo cards in that run. Do not add a Hub competency tile for Bayesian optimisation.

Do not stamp these cards from the 18:00 Apply-review agent.
