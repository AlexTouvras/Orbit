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
| `RESEND_API_KEY` | contact form — from [resend.com](https://resend.com) |
| `CONTACT_TO_EMAIL` | must match your **Resend account email** until you verify a domain |
| `CONTACT_FROM_EMAIL` | `onboarding@resend.dev` (Resend test sender) |
| `GITHUB_TOKEN` | **required for Studio save** — fine-grained PAT, repo **Contents: Read and write** |
| `GITHUB_REPO` | `AlexTouvras/Orbit` (optional; default) |

5. Click **Deploy**. Build runs `npm run build` (news cache is committed in `data/news-cache.json`).

6. After deploy: set `NEXT_PUBLIC_SITE_URL` to your real Vercel URL → **Redeploy**.

## Custom domain (optional)

Vercel project → **Settings → Domains** → add `yourname.duckdns.org` (CNAME to `cname.vercel-dns.com`).

## Daily news refresh

Signals read from committed `data/news-cache.json`. They refresh **daily at
06:00 UTC** via **Vercel Cron** → `GET /api/cron/news`:

1. Fetches RSS feeds
2. Commits `data/news-cache.json` to GitHub (`GITHUB_TOKEN` required)
3. Vercel redeploys with fresh Signals

Requires env: `CRON_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO` (same as Studio).

**Backup:** GitHub Action `.github/workflows/news-refresh.yml` also runs daily
(and can be triggered manually: Actions → **Refresh news cache** → **Run
workflow**).

**Test now:**

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://YOUR_SITE/api/cron/news"
```

Optional external ping: [cron-job.org](https://cron-job.org) with the same URL.

## Contact form (Resend)

1. Sign up at [resend.com](https://resend.com) (Gmail is fine).
2. **API Keys** → **Create API Key** → copy `re_...`.
3. Add to Vercel (Production):

```bash
npx vercel env add RESEND_API_KEY production --value "re_YOUR_KEY" --yes
```

4. Set on Vercel:

```bash
npx vercel env add RESEND_API_KEY production --value "re_YOUR_KEY" --yes
npx vercel env add CONTACT_TO_EMAIL production --value "YOUR_RESEND_SIGNUP_EMAIL" --yes
npx vercel env add CONTACT_FROM_EMAIL production --value "onboarding@resend.dev" --yes
```

5. **Redeploy**.

**Important:** On Resend's free/test mode, email is only delivered to the address
you used to sign up for Resend. `CONTACT_TO_EMAIL` must be that address (not
necessarily the address shown on your site).

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
