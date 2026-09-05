# Field card weekly gate (Orbit)

The review agent is the gate. You do not Approve in Slack unless that agent misses.

## Normal week

1. Thursday ~15:00 — CI opens a discovery PR (no Slack ping). Skips if this ISO week already shipped or already has `## Summary`.
2. Friday 17:00 — content agent may edit the card; leaves the PR open. If CI missed, it creates the weekly branch from `main`.
3. Friday 18:00 — **review agent** publishes (including stamp-only no-change). Keeps the previous card only when the PR would make the live card worse.
4. Slack gets **one laconic FYI per card** (same shape for all three): Review / Considered / Changed / Online + **Check card** button.

## Backup

If the review agent misses, Monday watchdog can still post **Open the new card / Approve / Decline**. Saturday is not scheduled.

## Cards

| Card | Content repo | Orbit path | Soft URL |
|---|---|---|---|
| Agentic AI | AlexTouvras/agentic-ai-field-card | public/field-card/index.html | /field-card/ |
| Data Analytics | AlexTouvras/data-analytics-field-card | public/analytics-field-card/index.html | /analytics-field-card/ |
| Technology Delivery | AlexTouvras/technology-delivery-field-card | public/delivery-field-card/index.html | /delivery-field-card/ |

```mermaid
flowchart LR
  CI[Thursday discover] --> Author[Fri 17:00 content]
  Author --> Review[Fri 18:00 review]
  Review -->|publish including stamp-only| Live[Site copy + Vercel]
  Review -->|PR worse than live| Stay[Live card unchanged]
  Review --> Slack["#orbit FYI · one post per card"]
```

Signing secret must match across content repos + Orbit (`WEEKLY_WRITE_SECRET` / `CRON_SECRET` / `FIELD_CARD_ACTION_SECRET`).
GitHub token on Orbit must be allowed to read + merge PRs on **all registered** field-card repos (`FIELD_CARD_GITHUB_TOKEN` if the default token is Orbit-only).
