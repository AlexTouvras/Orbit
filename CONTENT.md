# Orbit — Content & update guide

Everything you need to keep the site current without touching the codebase.
Read the section that matches what you want to change.

---

## Quick map: what lives where

| You want to change… | How | File / place |
| --- | --- | --- |
| **Articles (Writes)** | Add/edit MDX | `src/content/writes/*.mdx` |
| **Portfolio (workshop + GitHub)** | Studio scanner + auto | `/studio/projects`, GitHub username in profile |
| **Power BI reports on Portfolio** | Auto-sync from powerbi-portfolio | GitHub Action (6h + push notify) or `npm run powerbi:sync` |
| **CV / job history** | Edit structured data | `src/content/cv.ts` (shown on **Hub** home page) |
| **Hero name, tagline, socials** | Studio *or* code | `/studio` or `src/content/profile.ts` |
| **Workshop projects on Portfolio** | Studio scanner | `/studio/projects` |
| **Downloadable CV PDF** | Replace file | `public/resume.pdf` |
| **External news feed (Related articles)** | Auto + optional config | `npm run news:fetch` + `src/lib/news/sources.ts` |
| **Competency cards on Hub** | Code only | `src/content/profile.ts` → `competencies` |
| **RSS sources** | Code only | `src/lib/news/sources.ts` |
| **Weekly digest (newsletter)** | Auto-send Tuesday; test-to-self via `RESEND_NEWSLETTER_TEST_TO` | `/newsletter` + `/api/cron/newsletter` |

**Two ways to edit profile & workshop projects:**

1. **Studio** (`/studio`) — browser UI, saves to `data/profile.json` and `data/published-projects.json` (local, gitignored).
2. **Code** — edit `src/content/profile.ts` (defaults) or commit changes to git.

Studio overrides win over `profile.ts` when `data/profile.json` exists.

---

## Before you start (every time)

```powershell
cd C:\Users\kater\.cursor\projects\website
npm run dev
```

Open **http://localhost:3000**. Save a file → refresh the browser (dev hot-reloads most changes).

**Preview a production build** (optional, before pushing live):

```powershell
npm run build
npm run start
```

---

## 1. Adding or editing an article (Writes)

**URL:** `/writes` and `/writes/your-slug`

### Add a new article

1. Create a file: `src/content/writes/my-article-slug.mdx`
   - The **slug** = filename without `.mdx` (e.g. `my-article-slug` → `/writes/my-article-slug`).
2. Use this template:

```mdx
---
title: "Clear title — ideally the question you're answering"
summary: "One sentence: what the reader will learn."
date: "2026-04-15"
category: "Data"
featured: false
showcase: false
tags: ["Power BI", "Azure", "Tutorial"]
---

## The question

State the problem in one paragraph.

## What I did

Your main content. Use `##` and `###` headings — they render with the site styles.

- Bullet lists work
- **Bold** and `inline code` work

> Blockquotes work for callouts.

## Takeaway

One clear conclusion.
```

### Frontmatter reference

| Field | Required | Values / notes |
| --- | --- | --- |
| `title` | Yes | Shown on card and article header; also powers the per-post Open Graph image |
| `summary` | Yes | Card teaser + meta description |
| `date` | Yes | ISO date `"YYYY-MM-DD"` — controls sort order (newest first) and `datePublished` |
| `updated` | No | ISO date when you **revise** an existing essay. Drives sitemap `lastModified`, OG `modifiedTime`, and JSON-LD `dateModified`. Omit on first publish. |
| `category` | Yes | `Career` · `Data` · `AI` · `Delivery` · `Learning` |
| `tags` | Yes | Array of strings; used for search on `/writes` |
| `featured` | No | `true` → Home **From the blog** (article teasers; defaults `false`) |
| `showcase` | No | `true` → Home **Selected work** (system / project showcases; defaults `false`). Same blog MDX — only Home placement changes. Prefer one of `featured` or `showcase`, not both. |

### SEO is automatic (do not hand-author tags)

Dropping a valid Write MDX is enough. The site derives:

- Canonical URL, title, description, authors
- Per-slug Open Graph / Twitter image (`/writes/{slug}/opengraph-image`) from `title` + `category`
- `BlogPosting` + `BreadcrumbList` JSON-LD
- Sitemap entry + RSS item (`/feed.xml`)
- Heading `id`s on `##` / `###` for deep links

Weekly Write Approve and showcase essays use the same pipeline — no extra SEO step. On a substantive rewrite, set `updated: "YYYY-MM-DD"` (keep original `date`).

### Edit an existing article

Open the `.mdx` file under `src/content/writes/`, change frontmatter or body, save, refresh. If the change is a real rewrite (not a typo fix), bump `updated`.

### Tips (from your content vision)

- **One question per post** — put it in the title or an early `## The question` section.
- **Document, don't perform** — write what you learned this week, not what you think sounds impressive.
- **Evergreen > hot takes** — tutorials and lessons age better than trend commentary.
- **Weekly automation drafts essays, not digests** — one thesis inspired by a Signal (AI, analytics/PBI, delivery), in the same voice as your featured Writes.
- **Agent path** — Cursor uses `.cursor/rules/orbit-essays.mdc` + `docs/essay-voice.md`: weekly → skill `weekly-write-essay`; showcase/rewrite → personal skill `orbit-essay`.

---

## 2. Portfolio (workshop, GitHub, Power BI & live)

**URL:** `/portfolio`

The portfolio shows **real work only**:

- **Workshop** — projects you publish from Studio (scanned from your machine).
- **GitHub** — live public repos, pulled from your `githubUsername`.
- **Power BI** — report page screenshots (`#power-bi`), browsable with page arrows and click-to-enlarge.
- **Live dashboards** — Orbit-chrome one-pagers at `/portfolio/live` (`#live` teaser). Not Power BI. Snapshots: `npm run live:fetch` (FI power), `npm run live:fetch-eu` (EU spot), `npm run live:fetch-housing` (Stat.fi ashi), `npm run live:fetch-mix` (Europe generation mix). Do not ship empty desks or Energy-Charts FI/SE3/EE prices.

There are no placeholder case studies. To add workshop projects, see **§5** below. To add a Power BI report, see **§2.1**. Live desks: `src/content/live-desks.ts` + `data/live/*.json`.

GitHub repos update automatically from the API when `githubUsername` is set in profile or Studio.

### 2.1 Adding a Power BI report

Reports are **auto-discovered** from [`powerbi-portfolio`](https://github.com/AlexTouvras/powerbi-portfolio).

1. In that repo, add `NN-slug/screenshots/*.png` (kebab-case filenames matching page names).
2. Keep a `## Pages` table in that folder’s `README.md` (label + role) — Orbit uses it for captions. Skip hidden/drillthrough pages (role containing “Hidden”).
3. Orbit picks them up automatically:
   - **Push** screenshots/README on `powerbi-portfolio` `main` → notifies Orbit (needs `ORBIT_DISPATCH_TOKEN` secret there — see below), **or**
   - Orbit **re-syncs every 6 hours** even without that secret, **or**
   - Run locally from Orbit: `npm run powerbi:sync`

Sync copies PNGs into `public/portfolio/power-bi/{slug}/` and regenerates `src/content/power-bi-reports.ts`. After Orbit deploys, `/portfolio` shows the new report in the side list.

**One-time setup (instant sync on Power BI push):** in `powerbi-portfolio` → Settings → Secrets → Actions, add `ORBIT_DISPATCH_TOKEN`: a classic PAT or fine-grained token with **Contents: Read and write** on `AlexTouvras/Orbit`. Without it, the 6-hour Orbit cron still keeps the showcase current.

Optional: set `POWERBI_ROOT` for local sync if the repo isn’t at `../PowerBI`. Slug shorteners live in `power-bi-projects.json` (`slugAliases`).

---

## 3. Updating the About page (CV)

**URL:** `/about`

Structured CV data lives in **`src/content/cv.ts`** — experience, education, skills, languages, training.

- Edit the `cv` object (company names, bullets, degrees, skills).
- The **summary** on About comes from `cv.summary` (via the Background section).
- **Download CV** serves **`public/resume.pdf`** — replace that file to update the PDF.
- The Hub shows a short **Background in brief** teaser linking to `/about`.

---

## 4. Updating the Hub hero & identity

What visitors see first: name, pillars line, tagline, stats, social links.

### Option A — Studio (easiest, no code)

1. Ensure `.env.local` has:
   ```
   STUDIO_PASSWORD=your-password
   STUDIO_SESSION_SECRET=any-long-random-string
   ```
2. Run `npm run dev`, go to **http://localhost:3000/studio**
3. Log in → edit fields → **Save changes**

Saves to `data/profile.json` (overrides `profile.ts`).

### Option B — Code (defaults + git)

Edit **`src/content/profile.ts`**:

| Field | What it controls |
| --- | --- |
| `name` | H1 on Hub |
| `pillars` | Line under name (e.g. `Delivery · Data · AI automation`) |
| `tagline` | Paragraph under pillars |
| `summary` | "Background in brief" on Hub + About-adjacent copy |
| `role` | Browser tab / SEO title suffix |
| `githubUsername` | GitHub repo grid on Portfolio |
| `email`, `resumeUrl` | Contact + CV download |
| `socials` | Footer + mobile Hub icons |
| `competencies` | Five Hub cards (code only, not in Studio). Each links to a static field card under `public/` (`/field-card/`, `/analytics-field-card/`, `/delivery-field-card/`, `/sdlc-field-card/`, `/credit-risk-field-card/`). All five cards refresh **monthly**. |

After editing `profile.ts`, if Studio previously saved overrides, either update Studio too or delete `data/profile.json` to revert to code defaults.

---

## 5. Workshop projects ("From the workshop")

**URL:** `/portfolio` → workshop section

These are **real Cursor projects on your machine**, not MDX files.

1. Go to **http://localhost:3000/studio/projects**
2. Click **Rescan** — finds folders under your Cursor projects directory
3. Tick **Publish** on projects you want visible
4. Set **status** (Live, WIP, Shipped, etc.), description, tags, URLs
5. **Save**

Saves to `data/published-projects.json`.

**On a server:** the scanner does *not* run remotely. Curate locally, then either:
- Update `data/published-projects.seed.json` and redeploy, or
- `scp` `data/published-projects.json` to the server (see `DEPLOY.md`).

---

## 6. Related articles (external news feed)

**URL:** `/radar` (labeled **Related articles** in the nav)

### Refresh the feed locally

```powershell
npm run news:fetch
```

Writes `data/news-cache.json`. The page reads only from this cache.

### Add/remove RSS sources

Edit **`src/lib/news/sources.ts`** — each entry needs `name`, `url`, `category` (`AI`, `Data`, `Delivery`, `Analytics`, `Economics`, or `Credit`). Optional `maxItems` caps high-frequency feeds. The Related articles **All** view and weekly Write intake round-robin by category so daily AI posts do not drown the other lanes.

### On a live server

News refreshes daily via systemd timer (see `DEPLOY.md`), or trigger manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://127.0.0.1:3000/api/cron/news
```

---

## 6b. Weekly Write (Slack approve → publish)

Every Monday a draft Write is built from **Related articles** + **Studio workshop projects**, then posted to Slack **`#orbit`** (`SLACK_ORBIT_WEBHOOK_URL`; falls back to legacy `SLACK_WEBHOOK_URL` if unset).

### What you do

1. Open the Slack message in `#orbit`
2. Prefer **Open preview** (Slack button) to read the full essay on your phone — Approve/Skip sit in a **fixed bottom bar** on that page
3. Tap **Approve & publish** → confirm page → **Approve & publish** again (or **Skip**). Slack also has the same buttons above and below the in-channel draft.
4. After Vercel redeploys, the article is live at `/writes/…`

Links are signed and expire in 7 days. Approve/Skip are confirm-then-POST so Slack link previews cannot publish by accident.

### Secrets

| Env / secret | Where |
| --- | --- |
| `SLACK_ORBIT_WEBHOOK_URL` | `#orbit` Incoming Webhook (Vercel + GitHub Actions; prefer this) |
| `SLACK_WEBHOOK_URL` | Legacy fallback only |
| `SLACK_BOT_TOKEN` + `SLACK_CHANNEL_ID` (optional) | Attach full essay as `.md` in Slack (`files:write` bot scope — still free) |
| `CRON_SECRET` / optional `WEEKLY_WRITE_SECRET` | Signs Approve/Skip/Preview links |
| `GITHUB_TOKEN` | Already required for Studio; used to commit the MDX on Approve |
| `OPENAI_API_KEY` (optional) | Paid — not needed; prefer Ollama locally or Gemini free |
| `GEMINI_API_KEY` (optional) | Free at https://aistudio.google.com/apikey — useful on Vercel (no Ollama) |
| `NEXT_PUBLIC_SITE_URL` | Must be your live HTTPS origin so Slack links work |

Draft order: **Gemini** (when key works) → else **IDE brief** in this repo for Cursor to write the essay → then Slack Approve. Optional local fallback: `--allow-local-fallback` (Ollama/template).

When Gemini fails, open `data/weekly-write-ide-brief.md` and follow the project skill **`weekly-write-essay`** (`.cursor/skills/weekly-write-essay/`), or ask Cursor to generate the weekly Write. Save `data/weekly-write-draft.json`, then:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://alextouvras.com"   # required — Slack links must not point at localhost
$env:GITHUB_TOKEN = "..."                                # required — Vercel reads the gitignored draft from GitHub
npm run weekly:notify-draft
```

Confirm the CLI JSON includes `"slack": true`, `"githubSynced": true`, and that Approve/Preview URLs use your live domain (not `localhost`).

### Local dry-run

```powershell
npm run weekly:draft
# or force + Slack:
npm run weekly:notify
```

Manual cron (production):

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" "https://YOUR_SITE/api/cron/weekly-write?force=1"
```

---

## 6c. Weekly digest (newsletter)

A **roundup**, not a Write. **Primary send:** GitHub Actions `newsletter.yml` every Tuesday **07:15 UTC** (assembles and emails — no Slack). **Backup:** Vercel cron Tuesday **08:00 UTC** → `/api/cron/newsletter` (skips if that week is already marked sent in `data/newsletter-draft.json` on GitHub).

Contents: last week's Write, four Related-article signals, and **From the ravens** — **one highlight per domain that moved this week** (prefer a new inbox finding over a watch item or a durable note). Domains with nothing new that week are omitted. Email links go to the public canonical source, never the private ravens repo.

Needs `RAVENS_GITHUB_TOKEN` (Contents: Read on `AlexTouvras/ravens`), or a `GITHUB_TOKEN` that can already read that repo. If the token cannot read ravens, the digest still sends Writes + RSS and omits the ravens section.

**Live page:** [alextouvras.com/newsletter](https://alextouvras.com/newsletter)

### Validate on yourself first

Set `RESEND_NEWSLETTER_TEST_TO` to your address (e.g. `a.touvras@gmail.com`). While that is set:

- Every send goes **only** to that inbox (single Resend email, subject prefixed `[test]`)
- Public subscribe is closed
- Audience broadcasts do not run

Unset `RESEND_NEWSLETTER_TEST_TO` when you are ready for the Resend audience. Then you need a [verified domain](https://resend.com/domains) — `onboarding@resend.dev` cannot broadcast.

### First-time setup

1. [API keys](https://resend.com/api-keys) — `RESEND_API_KEY` (`re_…`). Same key as contact.
2. For the test period, `RESEND_NEWSLETTER_FROM` may be `onboarding@resend.dev` **if** `TEST_TO` is the email you used to sign up for Resend. For a real audience later: [verify domain](https://resend.com/docs/dashboard/domains/introduction), check DNS at [dns.email](https://dns.email/).
3. Vercel **Settings → Environment Variables** ([docs](https://vercel.com/docs/environment-variables)):

   | Variable | Test period | Go-live |
   | --- | --- | --- |
   | `RESEND_API_KEY` | required | required |
   | `RESEND_NEWSLETTER_FROM` | `onboarding@resend.dev` or verified | verified, e.g. `Orbit <hello@alextouvras.com>` |
   | `RESEND_NEWSLETTER_TEST_TO` | your inbox | **unset** |
   | `RESEND_NEWSLETTER_AUDIENCE_ID` | optional | [Audience](https://resend.com/audience) id |
   | `RAVENS_GITHUB_TOKEN` | Contents: Read on `AlexTouvras/ravens` | same |

4. Redeploy. Primary: GitHub Actions Tuesday 07:15 UTC. Backup: Vercel cron Tuesday 08:00 UTC → `/api/cron/newsletter`.
5. Smoke now: `npm run newsletter:notify` or GitHub **Actions → Weekly newsletter digest → Run workflow**.

### Local

```powershell
npm run newsletter:draft    # assemble only
npm run newsletter:notify   # send (test-to or audience); no Slack
```

Manual cron:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" "https://alextouvras.com/api/cron/newsletter?force=1"
```

---

## 7. Replacing your CV PDF

1. Export or copy your latest PDF
2. Save as **`public/resume.pdf`** (overwrite the old file)
3. Ensure profile has `resumeUrl: "/resume.pdf"` (default)

No rebuild logic needed beyond refresh — static file.

---

## 8. Publishing changes to the live site

When you're happy locally:

```powershell
cd C:\Users\kater\.cursor\projects\website
git add .
git status
git commit -m "Add article: my topic"
git push origin main
```

**What to commit:**

| Change type | Commit these |
| --- | --- |
| New article | `src/content/writes/*.mdx` |
| New workshop project | Studio → `/studio/projects`, or `data/published-projects.json` |
| CV update | `src/content/cv.ts`, optionally `public/resume.pdf` |
| Profile defaults | `src/content/profile.ts` |
| Power BI showcase | `npm run powerbi:sync` → `src/content/power-bi-reports.ts`, `public/portfolio/power-bi/**` |
| Ship curated Studio data to server | `data/profile.seed.json`, `data/published-projects.seed.json` |

**Do not commit:** `.env.local`, `data/profile.json`, `data/published-projects.json` (gitignored).
`data/news-cache.json` **is** committed — Related articles reads it on Vercel; GitHub Action / Vercel Cron refresh it daily.

### After push — update the server

SSH into your VM (when deployed):

```bash
cd /opt/orbit/website
sudo -u orbit ./deploy/update.sh
```

Or follow **`DEPLOY.md`** for first-time setup.

---

## 9. Studio reference

| URL | Purpose |
| --- | --- |
| `/studio` | Edit profile (name, tagline, socials, GitHub username, email, resume URL) |
| `/studio/week` | Private week log (fitness, meals, Ravens, Heimdall videos, newsletter, CareerOps) |
| `/studio/projects` | Scan, publish, and edit workshop projects |

**Required env vars** (in `.env.local` for dev, `.env.production` on server):

```
STUDIO_PASSWORD=...
STUDIO_SESSION_SECRET=...
CRON_SECRET=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GITHUB_TOKEN=...          # Studio save on Vercel (Orbit Contents: write)
OPS_GITHUB_TOKEN=...      # Week log: Contents: Read on fitness-coach, mealplan-private, careerops-private, ravens
RAVENS_GITHUB_TOKEN=...   # Newsletter + week log ravens (if not covered by OPS_)
```

Generate secrets: `openssl rand -hex 32` (on the VM) or any long random string locally.

**Production:** Studio login only works over **HTTPS** (secure cookie).

---

## 10. Common workflows (cheat sheet)

### "I wrote a new blog post"

1. Add `src/content/writes/my-post.mdx`
2. `npm run dev` → check `/writes/my-post`
3. `git add` → `commit` → `push`
4. On server: `./deploy/update.sh`

### "I changed jobs / CV bullet"

1. Edit `src/content/cv.ts`
2. Optionally replace `public/resume.pdf`
3. Commit & push (or Studio for hero copy only)

### "I want a new project on the workshop grid"

1. `/studio/projects` → Rescan → Publish → Save
2. To ship to server: update `data/published-projects.seed.json` or scp the live JSON

### "I tweaked my tagline"

1. `/studio` → edit → Save (fastest)
2. Or edit `src/content/profile.ts` for permanent defaults in git

### "Related articles feed is empty"

```powershell
npm run news:fetch
```

---

## 11. Troubleshooting

| Problem | Fix |
| --- | --- |
| Article doesn't appear | Check filename ends in `.mdx`, frontmatter has `---` delimiters, required fields set |
| Old hero text after editing `profile.ts` | Studio override in `data/profile.json` — update Studio or delete that file |
| Workshop project missing after Rescan | Project needs `package.json`, `README`, or `.git` in its folder; must be under Cursor projects path |
| Studio won't log in | Check `STUDIO_PASSWORD` in `.env.local`; restart `npm run dev` |
| GitHub repos empty on Portfolio | Set `githubUsername` in Studio/profile; optional `GITHUB_TOKEN` if rate-limited |
| Build fails on MDX | Avoid raw `<` in text (write "Under 5 min" not `<5 min`); check YAML quoting |

---

## 12. Site map (for reference)

```
/                 Hub — hero, latest writes, competencies, about teaser
/writes           Your articles (owned content)
/writes/[slug]    Single article
/portfolio        Workshop + GitHub + Power BI (#power-bi) + live teaser (#live)
/portfolio/live   Live dashboard gallery
/portfolio/live/[slug]  Desk (nordic-equity, power, eu-spot)
/about            CV & full background
/radar            Related articles — external RSS (nav label: Related articles)
/newsletter       Weekly digest (test-to-self until go-live)
/studio           Private admin (profile)
/studio/week      Private week log (ops outputs + Heimdall videos)
/studio/projects  Private admin (workshop projects)
```

---

## Minimal habit to grow the site

1. **Weekly:** one Write — automated draft → Slack `#orbit` Approve (or write MDX by hand). Tuesday: digest emails (test-to-self until you unset `RESEND_NEWSLETTER_TEST_TO`).
2. **When you ship something:** add or update a portfolio MDX or publish via Studio.
3. **Monthly:** skim About/CV for accuracy; refresh `resume.pdf`.
4. **Deploy when you have content worth sharing** — not before.

That's it. You never need to touch React components for normal updates — only MDX, `cv.ts`, `profile.ts`, Studio, and git.
