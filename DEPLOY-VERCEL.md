# Deploy Orbit on Vercel (free)

Push to `main` → Vercel builds and deploys automatically.

## One-time setup

1. Push this repo to GitHub (`AlexTouvras/Orbit`).
2. Go to [vercel.com/new](https://vercel.com/new) → **Import** the repo.
3. Framework: **Next.js** (auto-detected). Root: `.` — leave defaults.
4. Add **Environment variables** (Production + Preview):

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://alextouvras.com` |
| `STUDIO_PASSWORD` | strong password |
| `STUDIO_SESSION_SECRET` | `openssl rand -hex 32` |
| `CRON_SECRET` | `openssl rand -hex 32` |
| `RESEND_API_KEY` | contact form, appointment mail, newsletter — from [resend.com](https://resend.com) |
| `CONTACT_TO_EMAIL` | inbox for contact messages and appointment notices. Falls back to the profile email |
| `CONTACT_FROM_EMAIL` | optional. A verified address such as `Orbit <hello@alextouvras.com>`. If this is empty or still `onboarding@resend.dev`, mail uses `RESEND_NEWSLETTER_FROM` |
| `RESEND_NEWSLETTER_FROM` | verified sender, `Orbit <hello@alextouvras.com>`. Contact mail uses this when `CONTACT_FROM_EMAIL` is not a verified address |
| `GITHUB_TOKEN` | **required for Studio save** — fine-grained PAT, repo **Contents: Read and write** |
| `GITHUB_REPO` | `AlexTouvras/Orbit` (optional; default) |

5. Click **Deploy**. Build runs `npm run build` (news cache is committed in `data/news-cache.json`).

6. After deploy: set `NEXT_PUBLIC_SITE_URL` to `https://alextouvras.com` → **Redeploy**.

## Custom domain

Vercel project → **Settings → Domains** → add `alextouvras.com` (and optionally `www.alextouvras.com`).
Point DNS at Vercel (nameservers or the A/CNAME records Vercel shows). Keep the old `*.vercel.app` URL as a redirect if you want.

## Daily news refresh

Signals read from `data/news-cache.json` on GitHub at **request time** (no redeploy
needed). They refresh **daily at 06:00 UTC** via **Vercel Cron** →
`GET /api/cron/news`:

1. Fetches RSS feeds
2. Commits `data/news-cache.json` to GitHub (`GITHUB_TOKEN` required)
3. Related articles pick up the new cache on the next page load
4. `ignoreCommand` (`scripts/vercel-ignore.mjs`) skips the Vercel rebuild for
   that commit so Hobby Deployment Storage does not grow every morning.
   A merge is compared with its first parent. If git cannot see a parent, the build runs.

Requires env: `CRON_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO` (same as Studio).

**Backup:** GitHub Action `.github/workflows/news-refresh.yml` is **manual only**
(Actions → **Refresh news cache** → **Run workflow**). Do not re-add a schedule
— it doubled production deploys.

**Test now:**

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://YOUR_SITE/api/cron/news"
```

Optional external ping: [cron-job.org](https://cron-job.org) with the same URL.

## Contact form and appointments (Resend)

Contact messages and appointment notices send From a verified address on `alextouvras.com`. `onboarding@resend.dev` is refused: inboxes file that shared test sender as spam. The domain already has Resend DKIM (`resend._domainkey`) and SPF on `send.alextouvras.com`.

1. Sign up at [resend.com](https://resend.com) and verify `alextouvras.com`.
2. **API Keys** → **Create API Key** → copy `re_...`.
3. On Vercel (Production), set `RESEND_API_KEY` and `RESEND_NEWSLETTER_FROM` to `Orbit <hello@alextouvras.com>`.
4. Optional: `CONTACT_FROM_EMAIL` with that same sender, and `CONTACT_TO_EMAIL` for the inbox that should receive messages. If `CONTACT_TO_EMAIL` is empty, mail goes to the profile email.
5. Add a DNS TXT record at `_dmarc.alextouvras.com`:

```text
v=DMARC1; p=none; rua=mailto:hello@alextouvras.com
```

6. **Redeploy** after the env change. A booking only updates `data/appointments.json` and does not need a rebuild.

The public contact page lists open slots inside the window saved in Studio. That window does not see Google Calendar.

## Weekly digest (newsletter)

No Slack Approve. **Primary:** GitHub Actions every Tuesday 07:15 UTC. **Backup:** Vercel cron Tuesday 08:00 UTC (skips if already sent). While `RESEND_NEWSLETTER_TEST_TO` is set, only that inbox gets mail.

1. [API keys](https://resend.com/api-keys) — reuse `RESEND_API_KEY`.
2. Vercel env: `RESEND_NEWSLETTER_FROM`, `RESEND_NEWSLETTER_TEST_TO` (your address). Redeploy.
3. Smoke: `npm run newsletter:notify` or GitHub **Actions → Weekly newsletter digest**.
4. For Ravens findings in the email: add `RAVENS_GITHUB_TOKEN` (fine-grained PAT, **Contents: Read** on `AlexTouvras/ravens`). Every domain is included — no topic filter. Falls back to `GITHUB_TOKEN` if that PAT can already read ravens.
5. When happy: unset `TEST_TO`, [verify domain](https://resend.com/domains), set `RESEND_NEWSLETTER_AUDIENCE_ID` from [Audience](https://resend.com/audience).

## Studio week log

Private board at `/studio/week` (Studio password). It reads this week’s files from GitHub.

Add `OPS_GITHUB_TOKEN` on Vercel (and `.env.local`): a fine-grained PAT with **Contents: Read** on `fitness-coach`, `mealplan-private`, `careerops-private`, and `ravens`. If `RAVENS_GITHUB_TOKEN` already covers those repos, you can skip a second token — the page tries `OPS_GITHUB_TOKEN`, then `RAVENS_GITHUB_TOKEN`, then `GITHUB_TOKEN`.

`GITHUB_TOKEN` for Studio save can stay Orbit-only. Do not widen it unless you want one PAT for both write (Orbit) and read (ops repos).

Full click-path: `CONTENT.md` section 6c. Cron: [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs).

## Studio on Vercel

Vercel has **no writable disk**. Studio saves by **committing to GitHub**:

1. GitHub → **Settings → Developer settings → Fine-grained tokens** → **Generate**.
2. Repository access: **Only `Orbit`**.
3. Permissions → **Contents: Read and write**.
4. Copy the token → add to Vercel:

```bash
npx vercel env add GITHUB_TOKEN production --value "github_pat_..." --yes
```

5. **Redeploy**.

When you click **Save** in Studio, changes commit to `data/profile.json` (or
`published-projects.json`) on `main`. Vercel redeploys in ~2 minutes and the
live site updates.

**Local dev** still writes to `data/` on disk (no `GITHUB_TOKEN` needed locally).

## CLI deploy (optional)

```bash
npx vercel login
npx vercel          # preview
npx vercel --prod   # production
```
