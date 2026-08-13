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
| Essay feedback | `data/essay-feedback.json` | Keyed by essay slug → `{ title, entries[] }` with `rating`, optional `note`, and ISO `at` |

## Design patterns

- Category round-robin (`src/lib/news/balance.ts`) for Related articles **All** and weekly intake so high-frequency AI feeds do not dominate quieter Data/Analytics/Delivery lanes.
- SEO: App Router `sitemap.ts` / `robots.ts`; site URL from `getSiteUrl()` (`NEXT_PUBLIC_SITE_URL`); JSON-LD Person/WebSite in layout + Article on Writes; blog RSS at `/feed.xml`.
- Portfolio cards: Case study link from `caseStudyUrl`, or from `liveUrl` when it is already a `/writes/` path
- Showcase essays for featured workshop projects (Ledger, Power BI, Orbit, Heatmap)
- Personal-ops projects (mealplan, fitness coach) stay non-featured; Write or `/architecture/` case study, not Home Selected work
- Essay footer feedback is anonymous, rate-limited, persisted to JSON, and still uses `localStorage` only as a one-browser re-submit gate.
- Essay pages read their own feedback entries server-side and render a newest-first note list below the feedback CTA.
- Essay feedback Slack notifications prefer `SLACK_ORBIT_WEBHOOK_URL` (for `#orbit`) and fall back to `SLACK_WEBHOOK_URL`.
- Weekly Write Slack draft / publish / skip notifications prefer `SLACK_ORBIT_WEBHOOK_URL` (`#orbit`) and fall back to `SLACK_WEBHOOK_URL`.
- Brand accent orbit: `--orbit-l/c/h` on `html` cycles cyan → sky → azure → purple (~16s) and drives `--accent-cyan` / `neon-cyan` / `.orbit-accent*` via live `oklch(var(--orbit-l)…)` (not a cached `--orbit-accent` color token). Hub `OrbitSignature` cyan uses `.orbit-accent-muted` (ring) + `.orbit-accent` (dot). Header mark uses `text-neon-cyan`. Topic AI uses fixed `--accent-ai` / `neon-ai` (tone `ai`). `--accent-violet` and `--accent-blue` stay fixed. Status tones (green/amber/neutral) stay fixed.
- Related articles topic tones live in `src/lib/news/category-tone.ts` and drive both `NewsCard` badges and `FilterChip` active states (`All` = brand cyan orbit; `AI` = fixed ai).

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
public/field-card/index.html            # Agentic AI Field Card (home AI competency)
public/analytics-field-card/index.html  # Data Analytics Field Card (home Data competency)
src/lib/field-card/registry.ts          # Multi-card Approve sync map (repo → Orbit path)
src/app/api/field-card/{preview,action}/ # Shared Slack preview / Approve for all registered cards
.state/
```

## Key decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-11 | Fitness coach systems Write + non-featured portfolio card | Ops loop (git/Slack/Automations/Intervals), not training diary; same personal-ops lane as mealplan |
| 2026-08-11 | Data Analytics Field Card + shared Orbit field-card registry | Same weekly discovery → Cursor judgment → #orbit Approve process as AI card; stack is ASK/GRAIN/TRUTH/USE (not a Fabric brochure) |
| 2026-08-03 | Weekly Write Slack posts full essay in-channel (chunked sections); `githubSynced` required for preview/Approve | Teaser + browser preview 404'd when Cloud Automation left the pending draft on a feature branch only |
| 2026-07-26 | Orbit `caseStudyUrl` → `/writes/building-orbit` | Essay existed; card lacked Case study link |
| 2026-07-26 | Heatmap case study Write + `caseStudyUrl` | Featured live board had no write-up |
| 2026-07-26 | Dropped ProjectHelm Write; JARVIS `/architecture/jarvis` remains historical-only backlink | Essay was present-tense under a retired banner; Hub voice pass preferred removing it over rewriting |
| 2026-07-26 | Vercel Analytics over Plausible/GA; link-out Garmin skipped | Hosted on Vercel; zero-config traffic; no hobby surface this phase |
| 2026-07-27 | Essay feedback persists to `data/essay-feedback.json` by slug, with Slack ping on submit | Keeps feedback close to the essay corpus and easy to surface later in Studio without adding a DB |
| 2026-07-27 | Weekly Write Slack target → `#orbit` via `SLACK_ORBIT_WEBHOOK_URL` | Keep essay drafts with Orbit feedback in one channel instead of `#career-ops` |
| 2026-07-24 | Optional `thesisUrl` / `thesisTitle` on `CvEducation`; About education cards link out when set (ProjectCard-style) | Surface theses without Portfolio clutter; Bachelor stays static |
| 2026-07-24 | Trim AI to OpenAI + Simon `entries` (max 8 each); drop InfoQ DevOps + TDS + Personal Kanban; add Databricks/DuckDB/MotherDuck/Dagster + RADACAD/Data Mozart + Scrum.org | Chronological feed and weekly essays read as AI-only despite balanced cache counts |
| 2026-07-30 | Agentic field card hosted as static `public/field-card/`; home AI competency links there | Keep standalone HTML (print/LinkedIn) outside Orbit chrome; competency is the discovery path |
| 2026-08-03 | Slack Approve syncs field-card `index.html` → Orbit `public/field-card/` | Pages updated on merge; site copy was stale until this lockstep commit + Vercel redeploy |
| 2026-08-10 | Vercel `WEEKLY_WRITE_SECRET` must match Cloud Automation / local signing secret (preferred over bare `CRON_SECRET`) | Preview/Approve tokens failed with `invalid signature` when Vercel `CRON_SECRET` drifted from the automation signer; draft must also live on GitHub default branch |
| 2026-08-11 | Field-card pipeline fail-closed: discovery Slack ping + Sat/Mon judgment watchdog + Approve notify requires `## Summary` | W32 stalled silently when Friday Cursor Automation missed; silence meant “nothing happened” |
| 2026-08-11 | Field-card repo must carry the same `WEEKLY_WRITE_SECRET` as Orbit/Vercel (not only stale `CRON_SECRET`) | Preview/Approve tokens signed in field-card CI failed with `invalid signature` on production |
| 2026-08-12 | Public "Why Orbit" brand copy on Hub, About, and `building-orbit.mdx` | Name/metaphor was internal-only; visitors need the center-of-gravity story without reading maintainer docs |
| 2026-08-12 | Canonical local clone is `website/` only | Removed stale `Orbit/` duplicate and Cursor shadow folders pointing at the same repo |
| 2026-08-12 | Pixel avatar beside name on Hub + About (`profile.avatarUrl`, `PixelAvatar`) | Stylized identity mark without weakening typography-first heroes; JSON-LD Person `image` when set |
