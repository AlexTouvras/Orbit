# Field card Slack Approve (Orbit)

Same gate pattern as weekly Writes:

1. Field-card CI / Cursor opens a weekly PR on `AlexTouvras/agentic-ai-field-card`
2. `Notify Slack approve` workflow posts Block Kit to **#orbit** via `SLACK_ORBIT_WEBHOOK_URL`
3. Links hit `/api/field-card/action` — **GET = confirm page**, **POST = merge or close**
4. Slack gets a short Approved / Skipped follow-up

Signing secret must match on both repos (`WEEKLY_WRITE_SECRET` / `CRON_SECRET` / `FIELD_CARD_ACTION_SECRET`).
GitHub token on Orbit must be allowed to merge that PR (`FIELD_CARD_GITHUB_TOKEN` if the default token is Orbit-only).
