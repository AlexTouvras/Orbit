# Automation contract — Orbit (website)

> Canonical workspace: `C:\Users\kater\.cursor\projects\website`

## Repository

| Field | Value |
|-------|-------|
| GitHub | `AlexTouvras/Orbit` |
| Production | Vercel → `alextouvras.com` |
| Default branch | `main` |

## Automations

| Name | Trigger | Output | Human gate |
|------|---------|--------|------------|
| Weekly Write | GHA `weekly-write.yml` + Cursor | `#orbit` Slack preview/approve | Human Approve in Slack |
| Weekly digest | GHA `newsletter.yml` Tue 07:15 UTC (primary) + Vercel `/api/cron/newsletter` Tue 08:00 UTC (backup) | email (test-to or audience) + Slack FYI | none (test-to until `RESEND_NEWSLETTER_TEST_TO` unset) |
| News refresh | GHA `news-refresh.yml` | commit to `data/news-cache.json` | none |
| Analytics field card judgment | Cursor `.cursor/automations/analytics-field-card-weekly-content-pass.json` | `#orbit` Approve | Human Approve |
| Delivery field card judgment | Cursor `.cursor/automations/delivery-field-card-weekly-content-pass.json` | `#orbit` Approve | Human Approve |
| Field-card Approve API | Orbit `/api/field-card/*` | sync HTML to `public/` | Slack Approve |
| Daily ops check | Cursor `.cursor/automations/daily-ops-check.json` | `#ops-channel` issues only | Propose-only; ✅ follow-up / ⏸️ snooze / ignore = later |

## Required secrets (production)

| Secret | Used by |
|--------|---------|
| `WEEKLY_WRITE_SECRET` | weekly Write + field-card tokens |
| `SLACK_ORBIT_WEBHOOK_URL` | essay feedback + weekly Write + digest FYI |
| `GITHUB_TOKEN` / `FIELD_CARD_GITHUB_TOKEN` | merge field-card PRs + sync; persist digest status |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs |
| `RESEND_API_KEY` | contact form + newsletter |
| `RESEND_NEWSLETTER_FROM` | digest from-address |
| `RESEND_NEWSLETTER_TEST_TO` | if set, digest mails only this inbox |
| `RESEND_NEWSLETTER_AUDIENCE_ID` | required only after test-to is unset |
| `RAVENS_GITHUB_TOKEN` | read `AlexTouvras/ravens` for digest findings (all domains) |

See portfolio `SECRETS_CHECKLIST.md` for cross-repo alignment.

## Ship checklist

```bash
npm run ship:check
```

Deploy-safe commits must use owner GitHub noreply identity (not generic `Cursor Agent` alias) — Vercel may block otherwise.

## Definition of done

- [ ] `npm run ship:check` passes locally
- [ ] Pushed to `main`
- [ ] Vercel deploy success (not blocked)
- [ ] One live URL smoke check
