# Orbit — Personal Site, Portfolio Bank & News Radar

A production-ready personal website with a cyber/space aesthetic, built as a single
full-stack Next.js app:

- **Hub** — hero, latest writes, competencies, and case study teasers.
- **Writes** — evergreen articles you own (MDX, build in public).
- **Portfolio** — case studies, workshop projects, and live GitHub repos.
- **About** — CV, experience, education, and skills.
- **Signals** — curated external RSS feed (AI, Data, Delivery), cached for speed.

> **Updating content?** See **[CONTENT.md](./CONTENT.md)** — full guide for articles, portfolio, CV, Studio, and publishing.

## Tech stack

| Layer        | Choice                                                        |
| ------------ | ------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router) + React 19 + TypeScript              |
| Styling      | Tailwind CSS                                                  |
| Animation    | Framer Motion                                                |
| Background   | tsParticles (perf-tuned starfield, reduced-motion aware)     |
| Content      | MDX (`next-mdx-remote`) + `gray-matter` for projects          |
| News backend | Route Handlers + `rss-parser`, `node-cron`, on-disk JSON cache |

## Getting started

```bash
npm install
npm run news:fetch   # seed the news cache (optional but recommended)
npm run dev          # http://localhost:3000
```

Copy `.env.example` to `.env.local` and adjust values as needed.

## Project structure

```
src/app/                 # routes
src/components/          # UI
src/content/writes/      # essays (MDX)
src/content/profile.ts   # profile defaults
src/lib/news/            # RSS sources, fetcher, cache
data/                    # Studio JSON and news cache
docs/product/            # product truth — start at PRODUCT.md
```

Writes are MDX files in `src/content/writes/`. Portfolio projects and the live profile are edited in Studio (`/studio`) and stored as JSON under `data/`. Steps for both are in [CONTENT.md](./CONTENT.md). Product intent is in [PRODUCT.md](./PRODUCT.md).

Images for older project art still live under `public/projects/`.

## The news radar

### Configure feeds

Edit `src/lib/news/sources.ts` — add a `{ name, url, category }` entry. Categories in that file are `AI`, `Data`, `Delivery`, `Analytics`, `Economics`, and `Credit`. The file is the source list.

The fetcher parses `title`, `link`, `pubDate`, and `contentSnippet`, dedupes by link,
sorts newest-first, and writes `data/news-cache.json`. The frontend reads **only** from
this cache — no external network calls on page load.

### Run the fetcher

```bash
npm run news:fetch   # one-shot
npm run news:watch   # runs now, then daily (node-cron)
```

### Scheduling in production

- **Vercel:** `vercel.json` already registers a Cron that hits `/api/cron/news` every
  daily at 06:00 UTC. Set `CRON_SECRET` in your project env; the endpoint authorizes the
  `Authorization: Bearer <CRON_SECRET>` header Vercel sends.
- **Self-hosted:** run `npm run news:watch` as a long-lived process (pm2/systemd), or
  use the OS scheduler to call `npm run news:fetch`.

Manual trigger:

```bash
curl -X POST "http://localhost:3000/api/cron/news?secret=YOUR_SECRET"
```

## Scripts

| Command              | Description                                   |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Start the dev server                          |
| `npm run build`      | Production build                              |
| `npm run start`      | Serve the production build                     |
| `npm run lint`       | Lint with ESLint                              |
| `npm run news:fetch` | Fetch feeds once and write the cache          |
| `npm run news:watch` | Fetch now, then daily                         |

## Customizing

- **Identity:** Studio, or the defaults in `src/content/profile.ts`. A `data/profile.json` override wins.
- **Theme:** tweak colors/animation in `tailwind.config.ts` and `src/app/globals.css`.
- **Background:** adjust particle density/speed in
  `src/components/layout/ParticleBackground.tsx`.
