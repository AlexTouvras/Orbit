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
| News refresh | GHA `news-refresh.yml` | commit to `data/news-cache.json` | none |
| Analytics field card judgment | Cursor `.cursor/automations/analytics-field-card-weekly-content-pass.json` | `#orbit` Approve | Human Approve |
| Field-card Approve API | Orbit `/api/field-card/*` | sync HTML to `public/` | Slack Approve |

## Required secrets (production)

| Secret | Used by |
|--------|---------|
| `WEEKLY_WRITE_SECRET` | weekly Write + field-card tokens |
| `SLACK_ORBIT_WEBHOOK_URL` | essay feedback + weekly Write notifications |
| `GITHUB_TOKEN` / `FIELD_CARD_GITHUB_TOKEN` | merge field-card PRs + sync |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs |

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
