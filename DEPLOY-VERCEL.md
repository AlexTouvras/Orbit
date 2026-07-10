# Deploy Orbit on Vercel (free)

Push to `main` → Vercel builds and deploys automatically.

## One-time setup

1. Push this repo to GitHub (`AlexTouvras/Orbit`).
2. Go to [vercel.com/new](https://vercel.com/new) → **Import** the repo.
3. Framework: **Next.js** (auto-detected). Root: `.` — leave defaults.
4. Add **Environment variables** (Production + Preview):

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` (update after first deploy) |
| `STUDIO_PASSWORD` | strong password |
| `STUDIO_SESSION_SECRET` | `openssl rand -hex 32` |
| `CRON_SECRET` | `openssl rand -hex 32` |
| `RESEND_API_KEY` | optional — contact form |
| `CONTACT_TO_EMAIL` | your email |
| `GITHUB_TOKEN` | optional — portfolio rate limits |

5. Click **Deploy**. First build runs `npm run news:fetch` then `npm run build`.

6. After deploy: set `NEXT_PUBLIC_SITE_URL` to your real Vercel URL → **Redeploy**.

## Custom domain (optional)

Vercel project → **Settings → Domains** → add `yourname.duckdns.org` (CNAME to `cname.vercel-dns.com`).

## Daily news refresh

Vercel serverless has **no persistent disk**, so a scheduled **GitHub Action**
(`.github/workflows/news-refresh.yml`) runs daily at **06:00 UTC**:

1. Fetches RSS feeds (`npm run news:fetch`)
2. Commits `data/news-cache.json`
3. Pushes to `main` → Vercel auto-redeploys with fresh Signals

**Enable it:** GitHub repo → **Actions** → allow workflows if prompted.

**Test now:** Actions → **Refresh news cache** → **Run workflow**.

Optional backup: [cron-job.org](https://cron-job.org) → daily `GET`:
`https://YOUR_SITE/api/cron/news?secret=YOUR_CRON_SECRET` (does not persist on
Vercel without extra storage — GitHub Action is the primary path).

## Contact form (Resend)

1. Sign up at [resend.com](https://resend.com) (Gmail is fine).
2. **API Keys** → **Create API Key** → copy `re_...`.
3. Add to Vercel (Production):

```bash
npx vercel env add RESEND_API_KEY production --value "re_YOUR_KEY" --yes
```

4. **Redeploy** (Deployments → … → Redeploy).

For testing, `CONTACT_FROM_EMAIL` can stay `Orbit Contact <onboarding@resend.dev>`
— Resend only delivers to your verified email until you add a custom domain.

## Studio on Vercel

Studio **edits files on disk** — that does not persist on Vercel serverless.

**Workflow:** edit locally (`npm run dev` → `/studio`) → commit `data/*.seed.json` or MDX → push.

## CLI deploy (optional)

```bash
npx vercel login
npx vercel          # preview
npx vercel --prod   # production
```
