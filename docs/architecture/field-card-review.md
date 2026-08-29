# Field card review (Orbit)

A second Cursor agent is the weekly gate. It does not write the card. It compares the proposed `index.html` to the live one, then **publishes** or **keeps the previous card**.

Friday 17:00 local drafts the PR. This agent runs Friday 18:00 local (`0 15 * * 5` UTC).

## Cards

| Card | Repo | Live |
|---|---|---|
| Agentic AI | `AlexTouvras/agentic-ai-field-card` | https://alextouvras.com/field-card/ |
| Data Analytics | `AlexTouvras/data-analytics-field-card` | https://alextouvras.com/analytics-field-card/ |
| Technology Delivery | `AlexTouvras/technology-delivery-field-card` | https://alextouvras.com/delivery-field-card/ |

## For each open weekly PR (`chore/weekly-refresh-*`)

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
- One card = one message. Same fields every time.
- Keep each line short. No bullet walls. No discovery stats dumps.
- `Considered` = what you weighed for the picker/table. `Changed` = what actually shipped (or why not).
- `Online: yes` only when the newest reviewed version is (or is about to be) the live site card.
- Button label is **Check card** when a live URL exists; **Open PR** only when blocked.

If a card has no open weekly PR, skip it. Do not open a new PR. Do not edit HTML.

## Publish when

- The proposed HTML is a real improvement: picker swap by constraint, docs URL fix, or a new *job* in the decision table.
- Or the HTML is unchanged aside from the weekly stamp, and the spine is intact (reviewed, no worse).
- Picker is still ≤7 rows.
- Link check is clean on URLs this PR touched.
- Always-on strip, kill switch, and anti-patterns are still there.

## Keep the previous card when

- The PR is discovery noise that would make the public card worse (brochure language, extra picker rows, invented URLs).
- The author pass never wrote a `## Summary` and the HTML is not a clear fix.
- Link check failed on URLs the PR touched.
- You cannot tell what changed.

When keeping previous, decline. Do not try to fix the HTML in this run.

## Spines (do not break)

- **AI:** RAG → AGENT → MCP → A2A, thin LLM floor, verb line, Always on strip. Not a vendor wall.
- **Analytics:** ASK → GRAIN → TRUTH → USE. Not a Fabric/Power BI brochure.
- **Delivery:** INTENT → WINDOW → PROOF → CUTOVER. Not Scrum/SAFe/Azure DevOps brochure.

## Backup

If this agent misses, Saturday/Monday watchdog can still post Open / Approve / Decline in Slack so a person can finish the week.
