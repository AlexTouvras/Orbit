# Architecture (working log)

> Tracked in git. Living decisions for this repo — not a substitute for `docs/architecture/`.

## Overview

Orbit is a Next.js personal HQ: Blog (MDX Writes), Portfolio (workshop + GitHub + Power BI), Related articles RSS cache, Studio, architecture sync. Public discovery via `sitemap.xml` / `robots.txt` / blog `feed.xml`, plus Vercel Analytics.

## Data shapes

| Name | Shape / location | Notes |
|------|------------------|-------|
| FeedSource | `src/lib/news/sources.ts` | `name`, `url`, `category`, optional `maxItems` |
| NewsCache | `data/news-cache.json` | Fetched via `npm run news:fetch` |
| Published workshop projects | `data/published-projects.json` (+ `.seed.json`) | `liveUrl` = demo; `caseStudyUrl` = `/writes/...` |
| Writes | `src/content/writes/*.mdx` | `showcase: true` → Home Selected work |

## Design patterns

- Category round-robin (`src/lib/news/balance.ts`) for Related articles **All** and weekly intake so high-frequency AI feeds do not dominate quieter Data/Analytics/Delivery lanes.
- SEO: App Router `sitemap.ts` / `robots.ts`; site URL from `getSiteUrl()` (`NEXT_PUBLIC_SITE_URL`); JSON-LD Person/WebSite in layout + Article on Writes; blog RSS at `/feed.xml`.
- Portfolio cards: Case study link from `caseStudyUrl`, or from `liveUrl` when it is already a `/writes/` path
- Showcase essays for featured workshop projects (Ledger, Power BI, Orbit, Heatmap)

## Dependencies

| Dependency | Why introduced | Date |
|------------|----------------|------|
| `@vercel/analytics` | Privacy-light page analytics on Vercel | 2026-07-26 |

## File structure

```text
src/lib/news/
├── sources.ts      # RSS registry
├── balance.ts      # interleaveByCategory
├── fetcher.ts
└── cache*.ts
src/lib/site.ts                 # getSiteUrl()
src/app/sitemap.ts
src/app/robots.ts
src/app/feed.xml/route.ts
src/components/seo/
├── JsonLd.tsx
└── ArticleJsonLd.tsx
data/published-projects.json
src/content/writes/
.state/
```

## Key decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-26 | Orbit `caseStudyUrl` → `/writes/building-orbit` | Essay existed; card lacked Case study link |
| 2026-07-26 | Heatmap case study Write + `caseStudyUrl` | Featured live board had no write-up |
| 2026-07-26 | Dropped ProjectHelm Write; JARVIS `/architecture/jarvis` remains historical-only backlink | Essay was present-tense under a retired banner; Hub voice pass preferred removing it over rewriting |
| 2026-07-26 | Vercel Analytics over Plausible/GA; link-out Garmin skipped | Hosted on Vercel; zero-config traffic; no hobby surface this phase |
| 2026-07-24 | Thesis voice → `docs/essay-voice.md` fingerprint + explicit “do not import” academic habits; essay skills/router must open it | Improve Orbit essays with owner’s reasoning (counter-case, named metrics) without thesis cosplay |
| 2026-07-24 | Optional `thesisUrl` / `thesisTitle` on `CvEducation`; About education cards link out when set (ProjectCard-style) | Surface theses without Portfolio clutter; Bachelor stays static |
| 2026-07-24 | Trim AI to OpenAI + Simon `entries` (max 8 each); drop InfoQ DevOps + TDS + Personal Kanban; add Databricks/DuckDB/MotherDuck/Dagster + RADACAD/Data Mozart + Scrum.org | Chronological feed and weekly essays read as AI-only despite balanced cache counts |
