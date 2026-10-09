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
- Agentic AI practice hits (engineering feeds and web searches in that repo's discovery report) may earn a decision-table row or an anti-pattern. They do not earn a picker row. More than two new decision rows in one month is noise — decline.
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
- **SDLC** (Orbit-hosted, monthly): H1 `Build software that stays in use`. Hook `A check that cannot fail is not a gate.` Pillars Plan & design → Build & verify → Release & deploy → Maintain & improve. Read `public/sdlc-field-card/PLAYBOOK.md`. The opening picture is one change on a pipeline: a dark stage, a lime rail, the change walks the four pillars, the gates can stop it, and the return rail under the track is the next change. The station drawings move on that same walk: the page is written, a wrong test fails and the change steps back, the last version stays beside the one people run, and use lights the return. Not a loop. Each pillar names its handoff. Security is named in design (who can reach the data). Verify includes those security checks; they have to fail the build. The previous version stays deployable. Keep: the plan fits on a page a person will review; a spec file is not shared understanding; a person drops tests that do not fail for the right reason. Do not put the job table back in front of that picture. Calendars, proof, and cutover stay on Delivery. This card owns release, deploy, maintain, and improve of the software. Not a SAFe brochure. Not an AI-native brochure. The month judges that picture. See “Scene pattern” and “Monthly hosted cards”.
- **Credit risk** (Orbit-hosted, monthly): H1 `Credit risk is for a lifetime. Act early.` Spine ORIGINATE → MONITOR → STAGE → PROVISION. Read `public/credit-risk-field-card/PLAYBOOK.md`. The opening picture is one account (engine, watch while paying, stage the increase, 12-month ECL in stage 1, lifetime ECL from stage 2, including a credit-impaired stage 3). Do not put the job table back in front of that picture. Not a vendor/scorecard brochure. Grain/gold stays on Analytics. The month judges that picture. See “Scene pattern” and “Monthly hosted cards”.
- **Data & visual storytelling** (Orbit-hosted, monthly): H1 `Turn evidence into a decision`. Operating chain Question → Evidence → Tension → Narrative → Experience → Decision (Representation as form-choice). Craft inside: DWELL → CLAIM → SKETCH → LEAD → OPEN. Story spec + quality gates + kill criteria. The card’s signal field evolves on scroll. Essays stay prose. Grain stays on Analytics. Cutover stays on Delivery.
- **Bayesian optimisation** (Orbit-hosted method, not Hub): H1 `Bayesian optimisation is a budget of trials, not a search of space`. BOUND → MODEL → ACQ → STOP. Lede is the scarce-trial loop, not the layers/lanes clone. Inference is MODEL only. Not a BoTorch/Ax/AutoML brochure.

## Scene pattern

Credit is the reference scene. The next agent copies the behavior onto one Hub card at a time. Bayes stays a schematic. A monthly run does not convert a card.

What transferred from the pilot:

- The hire value is one case moving through the locked spine. The sentences on that picture are the job.
- H1, the verb line, and the boundary with the neighboring card stay. A second opinion may correct a term or add one sentence. It does not add a section, a fifth column, a proof strip, or an unpublished rate.
- Motion is one loop. `prefers-reduced-motion` and print show the end state. Under 640px each move is its own row. The arc may hide on a phone when a sentence carries the return. No scroll-jack.
- The robot is already on the Hub sheets. Six lines, last line the tuck line, printable ASCII, each line at most 64 characters. A press that moves drags it; a short tap tucks it. That gesture already lives in `public/field-card-robot.mjs`. The Agentic AI sheet inlines its own script, so an AI scene copies the gesture there. Do not mount a second Rive file as the illustration.
- The warm sheet and the particle sphere belong to the credit picture. The next card keeps its own accent and draws its own subject.

Where the HTML lives:

- SDLC and Story are edited on Orbit. Credit is already the scene.
- Agentic AI, Analytics, and Delivery are edited in their source repos. Apply review copies the HTML into Orbit. An edit that exists only under `public/` on Orbit is replaced the next time that repo publishes.

One picture per card:

| Card | Picture | Locked spine | Leave with the neighbor |
|---|---|---|---|
| SDLC | One change on a pipeline, from the plan through use, then the learning returns as the next change. Gates can stop it. Not a loop | Plan & design → Build & verify → Release & deploy → Maintain & improve, plus the three lines in `public/sdlc-field-card/PLAYBOOK.md` | Calendars, proof, and cutover stay on Delivery |
| Story | One claim, from the question to a decision, with the doubt still visible | Question → Evidence → Tension → Narrative → Experience → Decision. Craft strip DWELL → CLAIM → SKETCH → LEAD → OPEN | Essays stay prose. Grain stays on Analytics |
| Analytics | One number, from the question to a grain someone can use | ASK → GRAIN → TRUTH → USE | The stage stays on Credit. Cutover stays on Delivery |
| Delivery | One cutover, from the named outcome through the calendars to the cut | INTENT → WINDOW → PROOF → CUTOVER | Release, deploy, maintain, and improve stay on SDLC |
| Agentic AI | One job, through the thinnest layer that solves it | H1 `Agentic AI is a loop, not a menu`. RAG → AGENT → MCP → A2A | Stack and grain stay on Analytics |

Order: SDLC is the pipeline scene. Story is next, then one source-repo card at a time. Each conversion is its own change. When a card becomes a scene, rewrite that card’s monthly judgment so the picture is the job. Until that rewrite is on `main`, the month keeps judging that card’s picker and job table.

## Backup

If this agent misses, the fleet check on the first weekday on or after the 2nd posts a FYI in #orbit. Finish by re-running this agent (or Apply review). Slack is not the gate. There is no Monday weekly-refresh flag.

## Monthly hosted cards (SDLC, Credit Risk, Story, Bayesian optimisation)

Judged on Orbit at 17:00 on the 1st, not via source-repo Apply review.

Run `.cursor/automations/hosted-field-card-monthly-review.json`. This section is the procedure. If the stored Cursor prompt is shorter, follow this section.

1. SDLC research is required before any SDLC edit or no-change decision. Follow `public/sdlc-field-card/PLAYBOOK.md` section “Monthly research”: open the seven named-practice links and sources on the life cycle, then assess the pipeline picture. A month with no opened URLs is not a finished SDLC judgment. The picture is the job. A gate that cannot fail, a missing previous version, or a loop in place of the return is an update. Restoring a problem/use/example table in front of the picture is not an update.
2. Credit: read `public/credit-risk-field-card/PLAYBOOK.md` and open the links under Inside the fence. Judge the four moves. Stage 1 is 12-month ECL. Lifetime ECL starts at stage 2, including a credit-impaired stage 3. A dead link, or a sentence that teaches the wrong allowance, is an update. Restoring a problem/use/example table, a picker, or a ladder is not an update. Story and Bayes: read `PLAYBOOK.md` and judge the picker and the jobs against the spine. Story stays Question → Evidence → Tension → Narrative → Experience → Decision, with craft DWELL → CLAIM → SKETCH → LEAD → OPEN. Bayes stays BOUND → MODEL → ACQ → STOP. Do not convert Story, Bayes, or a source-repo card into a scene in this run. Swap by constraint, not hype. Do not invent docs URLs.
3. Bump each footer stamp: `Reviewed <Month YYYY> · Next: <next month>`. Credit’s Changed line is `Monthly review — the account picture unchanged` unless that picture’s HTML changed. SDLC’s Changed line is `Monthly review — the pipeline picture unchanged` unless that picture’s HTML changed. On Story and Bayes the Changed line stays `Monthly review — picker and jobs unchanged` unless that card’s HTML actually changed.
4. Open `chore/monthly-field-cards-YYYY-MM` on Orbit. `## Summary` has `Decision: update` or `Decision: no-change` per card. SDLC also lists the URLs opened and one sentence of assessment. Credit also lists the Inside the fence links that were opened. A credit month that did not open them is not finished. Do not touch the three source-repo cards in that run. Do not add a Hub competency tile for Bayesian optimisation.

Do not stamp these cards from the 18:00 Apply-review agent.
