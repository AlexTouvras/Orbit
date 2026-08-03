# Field card Slack Approve (Orbit)

Same gate pattern as weekly Writes:

1. Field-card CI discovers candidates (no HTML judgment)
2. Cursor Automation updates `index.html` when earned (or records no-change) and runs notify
3. `Notify Slack approve` posts Block Kit to **#orbit**: summary · **Open card preview** · Approve / Skip
4. Preview: `/api/field-card/preview` serves PR-head `index.html` (signed `preview` token)
5. Approve/Skip: `/api/field-card/action` — **GET = confirm**, **POST = merge or close**
6. Slack gets a short Approved / Skipped follow-up

Signing secret must match on both repos (`WEEKLY_WRITE_SECRET` / `CRON_SECRET` / `FIELD_CARD_ACTION_SECRET`).
GitHub token on Orbit must be allowed to read + merge that PR (`FIELD_CARD_GITHUB_TOKEN` if the default token is Orbit-only).
