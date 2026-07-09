# Orbit — Content & update guide

Everything you need to keep the site current without touching the codebase.
Read the section that matches what you want to change.

---

## Quick map: what lives where

| You want to change… | How | File / place |
| --- | --- | --- |
| **Articles (Writes)** | Add/edit MDX | `src/content/writes/*.mdx` |
| **Portfolio (workshop + GitHub)** | Studio scanner + auto | `/studio/projects`, GitHub username in profile |
| **CV / job history** | Edit structured data | `src/content/cv.ts` (shown on **Hub** home page) |
| **Hero name, tagline, socials** | Studio *or* code | `/studio` or `src/content/profile.ts` |
| **Workshop projects on Portfolio** | Studio scanner | `/studio/projects` |
| **Downloadable CV PDF** | Replace file | `public/resume.pdf` |
| **External news feed (Signals)** | Auto + optional config | `npm run news:fetch` + `src/lib/news/sources.ts` |
| **Competency cards on Hub** | Code only | `src/content/profile.ts` → `competencies` |
| **RSS sources** | Code only | `src/lib/news/sources.ts` |

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
| `title` | Yes | Shown on card and article header |
| `summary` | Yes | Card teaser + meta description |
| `date` | Yes | ISO date `"YYYY-MM-DD"` — controls sort order (newest first) |
| `category` | Yes | `Career` · `Data` · `AI` · `Delivery` · `Learning` |
| `tags` | Yes | Array of strings; used for search on `/writes` |
| `featured` | No | `true` to prefer in featured lists (defaults `false`) |

### Edit an existing article

Open the `.mdx` file under `src/content/writes/`, change frontmatter or body, save, refresh.

### Tips (from your content vision)

- **One question per post** — put it in the title or an early `## The question` section.
- **Document, don't perform** — write what you learned this week, not what you think sounds impressive.
- **Evergreen > hot takes** — tutorials and lessons age better than trend commentary.

---

## 2. Portfolio (workshop & GitHub)

**URL:** `/portfolio`

The portfolio shows **real work only**:

- **Workshop** — projects you publish from Studio (scanned from your machine).
- **GitHub** — live public repos, pulled from your `githubUsername`.

There are no placeholder case studies. To add workshop projects, see **§5** below.

GitHub repos update automatically from the API when `githubUsername` is set in profile or Studio.

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
| `competencies` | Three cards on Hub (code only, not in Studio) |

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

## 6. Signals (external news feed)

**URL:** `/radar` (labeled **Signals** in the nav)

### Refresh the feed locally

```powershell
npm run news:fetch
```

Writes `data/news-cache.json`. The page reads only from this cache.

### Add/remove RSS sources

Edit **`src/lib/news/sources.ts`** — each entry needs `name`, `url`, `category` (`AI`, `Data`, or `Delivery`).

### On a live server

News refreshes daily via systemd timer (see `DEPLOY.md`), or trigger manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://127.0.0.1:3000/api/cron/news
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
| Ship curated Studio data to server | `data/profile.seed.json`, `data/published-projects.seed.json` |

**Do not commit:** `.env.local`, `data/profile.json`, `data/published-projects.json`, `data/news-cache.json` (gitignored).

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
| `/studio/projects` | Scan, publish, and edit workshop projects |

**Required env vars** (in `.env.local` for dev, `.env.production` on server):

```
STUDIO_PASSWORD=...
STUDIO_SESSION_SECRET=...
CRON_SECRET=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GITHUB_TOKEN=...          # optional, higher GitHub API limits
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

### "Signals feed is empty"

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
/portfolio        Workshop projects + GitHub
/about            CV & full background
/radar            Signals — external RSS (nav label: Signals)
/studio           Private admin (profile)
/studio/projects  Private admin (workshop projects)
```

---

## Minimal habit to grow the site

1. **Weekly:** one Write — "What did I learn?" (even 300 words counts).
2. **When you ship something:** add or update a portfolio MDX or publish via Studio.
3. **Monthly:** skim About/CV for accuracy; refresh `resume.pdf`.
4. **Deploy when you have content worth sharing** — not before.

That's it. You never need to touch React components for normal updates — only MDX, `cv.ts`, `profile.ts`, Studio, and git.
