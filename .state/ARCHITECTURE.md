# Architecture (working log)

> Tracked in git. Living decisions for this repo — not a substitute for `docs/architecture/`.

## Overview

Orbit is a Next.js personal HQ: Blog (MDX Writes), Portfolio (workshop + GitHub + Power BI screenshots + live desks at `/portfolio/live`), Related articles RSS cache, Studio (profile + week log), architecture sync, weekly digest (Resend auto-send; test-to-self until go-live). Public discovery via `sitemap.xml` / `robots.txt` / blog `feed.xml`, plus Vercel Analytics.

## Data shapes

| Name | Shape / location | Notes |
|------|------------------|-------|
| FeedSource | `src/lib/news/sources.ts` | `name`, `url`, `category`, optional `maxItems` |
| NewsCache | `data/news-cache.json` | Fetched via `npm run news:fetch` |
| Live EU Spot | `data/live/eu-spot.json` | `npm run live:fetch-eu` (A44) + `npm run live:fetch-eu-pulse`. Map category layers + per-zone desk (Finland-style pulse + mix nowcast for every zone). Power Pulse is not a separate Portfolio desk — `/portfolio/live/power` redirects here. |
| Live Helsinki Housing | `data/live/housing.json` | `npm run live:fetch-housing`. Stat.fi `ashi` monthly 15iq + quarterly 13mv (Helsinki history + HKI 1–4). CC BY 4.0. Capital-region choropleth (`HousingMap`) paints ~150 postal codes from yearly ashi 13mu €/m² (sales-weighted flats + terraced) via `housing-postal-paths.ts` (Paavo pno, CC BY 4.0) — Asuntomaatti-style grain. |
| Live Europe Power Mix | `data/live/power-mix.json` | `npm run live:fetch-mix`. Energy-Charts `public_power` last 24h → country 100% stacked shares (fossil/nuclear/wind/hydro/solar/biomass/other), sorted clean→fossil. |
| Live Europe Economy Pulse | `data/live/economy.json` | `npm run live:fetch-economy`. Eurostat HICP (`prc_hicp_manr` history merged with early `teicp000`) / unemployment / consumer confidence / GDP + ECB deposit facility + ECB press/statistics RSS (EA21) + Google News economy wires per spotlight country/EU (incl. DK, NO). Desk defaults to euro area (EA21); spotlight selector filters KPIs and headlines. |
| Published workshop projects | `data/published-projects.json` (+ `.seed.json`) | `liveUrl` = demo; `caseStudyUrl` = `/writes/...` |
| Writes | `src/content/writes/*.mdx` | `showcase: true` → Home Selected work |
| Essay feedback | `data/essay-feedback.json` | Keyed by essay slug → `{ title, entries[] }` with `rating`, optional `note`, and ISO `at` |
| Newsletter digest draft | `data/newsletter-draft.json` | Titles/links only. Gitignored locally; persist send status via GitHub |
| Newsletter subscribers | Resend Audience, or `RESEND_NEWSLETTER_TEST_TO` | Emails never in git. Test-to skips the audience entirely |
| Ravens findings | GitHub Contents on `AlexTouvras/ravens` | Weekly highlights: one item per domain that moved (inbox first). `RAVENS_GITHUB_TOKEN` |
| Week log | `/studio/week` (+ `/2026-W36/fitness` etc. for other ISO weeks; legacy `?week=` redirects) via `src/lib/week-log/` | ISO week hub. Fitness lane renders `ArcStatusCard` from plan `narrative` + `daily_quest` (fitness-coach repo). `narrative.health`: max = 100 + VIT, fill = Body Battery share. Heimdall embeds inline (Technique on lifts, Watch on Ravens parenting). Auth: GitHub allowlist + 90d sliding session; password fallback; `STUDIO_DEV_OPEN` locally |
| Fleet registry | `docs/ops/fleet.yaml` | Daily unattended-job checks for `#ops-channel`; cloud evidence is GitHub + Slack only |

## Design patterns

- Portfolio live tiles (`LiveDeskTile`) carry a sneak peek: EU Spot paints the live baseload SVG; Nordic Equity paints a treemap from `heatmap-web` `board.json` (not an iframe of the board page); Helsinki Housing paints a monthly €/m² sparkline; Europe Power Mix paints mini 100% stacked country bars; Europe Economy Pulse paints euro-area HICP. Portfolio `#live` and `/portfolio/live` use `LiveDeskCarousel` (horizontal snap row + chevrons), not a wrapping grid.
- SEO: App Router `sitemap.ts` / `robots.ts`; site URL from `getSiteUrl()` (`NEXT_PUBLIC_SITE_URL`); JSON-LD Person/WebSite/Blog in layout + BlogPosting/BreadcrumbList on Writes; per-Write OG via `writes/[slug]/opengraph-image.tsx` (shared `src/lib/seo/og-card.tsx`); optional Write frontmatter `updated` for freshness; blog RSS at `/feed.xml`; `public/llms.txt`; app `icon.tsx`. New MDX Writes inherit SEO automatically from frontmatter — no per-post meta authoring.
- Field-card static HTML in `public/*-field-card/` should keep `canonical` + `og:url` + `og:image` (points at site `/opengraph-image`). Source field-card repos own the HTML and may overwrite on sync — preserve those meta tags when refreshing cards.
- Portfolio cards: Case study link from `caseStudyUrl`, or from `liveUrl` when it is already a `/writes/` path
- Showcase essays for featured workshop projects (Ledger, Power BI, Orbit, Heatmap)
- Personal-ops projects (mealplan, fitness coach) stay non-featured; Write + `/architecture/` case study, not Home Selected work
- Essay footer feedback is anonymous, rate-limited, persisted to JSON, and still uses `localStorage` only as a one-browser re-submit gate.
- Essay pages read their own feedback entries server-side and render a newest-first note list below the feedback CTA.
- Essay feedback Slack notifications prefer `SLACK_ORBIT_WEBHOOK_URL` (for `#orbit`) and fall back to `SLACK_WEBHOOK_URL`.
- Weekly Write Slack draft / publish / skip notifications prefer `SLACK_ORBIT_WEBHOOK_URL` (`#orbit`) and fall back to `SLACK_WEBHOOK_URL`.
- Weekly digest: **GitHub Actions Tuesday 07:15 UTC is primary** (Vercel Hobby cron went silent after 2026-08-18). Vercel `/api/cron/newsletter` Tue 08:00 UTC is backup; `already_sent_this_week` via `data/newsletter-draft.json` on GitHub prevents doubles. `RESEND_NEWSLETTER_TEST_TO` mails only that inbox; unset it to broadcast. **No Slack** for digest content — email only. Public subscribe stays closed while test-to is set. Ravens section is **one highlight per domain that moved this week**, not a vault dump.
- Daily ops check is a separate Cursor Automation on `Orbit`/`main` at 08:00 GMT+3 posting only exceptions to `#ops-channel`. It is propose-only and must not infer local state from `~/.cursor`; registry and playbook must exist on GitHub `main`.
- Studio week log is owner-only (`STUDIO_PASSWORD` emergency + GitHub OAuth allowlist + `noindex`). Token chain: `OPS_GITHUB_TOKEN` → `RAVENS_GITHUB_TOKEN` → `GITHUB_TOKEN`. Do not put the week log in public nav. Heimdall embeds inline with `youtube-nocookie` (Technique on fitness lifts; parenting Watch on Ravens); falls back to the watch URL.
- Fitness course strip on `/studio/week/fitness` writes sibling `fitness-coach` via `coach-course` locally. On Vercel, Apply dispatches `studio-apply-course` on fitness-coach (GitHub Action regenerates the week and commits). Needs `OPS_GITHUB_TOKEN` Contents: Read and write on fitness-coach. Skin (Arc) is not a weekly slicer. Past race dates expire out of taper.
- Brand accent orbit: hex keyframes on unlayered `.orbit-accent` (direct `color` animation) + `@property --orbit-accent` `<color>` for bg/border/mix. Tailwind `neon-cyan` is a **fixed** rest-state cyan (`--accent-cyan`); body links (Case study, Read, nav CTAs) do not ride the loop. Section eyebrows and hero totals do, via `.orbit-accent`. `--orbit-fg-delay` is applied after hydrate (`OrbitSync` layout effect, not a `Date.now()` SSR script) so new mounts join mid-cycle without a hydration mismatch. Avoid `oklch()` in animated tokens (LightningCSS → lab/@supports; Chromium can blank `color: var(...)`). Never animate OKLCH channels via `@property <number>`. Topic AI uses fixed `--accent-ai` / `neon-ai`. Violet/blue stay fixed.
- Studio profile save: local always writes `data/profile.json`; Vercel requires `GITHUB_TOKEN` and commits for redeploy. UI must show the real server message (not a blanket "Live site updated").
- Vercel `ignoreCommand` (`scripts/vercel-ignore.mjs`) skips rebuilds when a commit only touches runtime-read GitHub JSON (news cache, essay feedback, newsletter/weekly-write drafts). Profile, published projects, Writes, field cards, and Power BI screenshots still build. Fail-open: if git cannot list files, Vercel builds.
- ProjectBrain showcase (2026-09-02): essay `when-the-portfolio-needs-a-memory.mdx` (`featured` + `showcase`); portfolio card + `/architecture/projectbrain` synced from `Memory/docs/architecture/`.
- Public Writes are stranger-first (`docs/essay-voice.md`): gloss workshop nicknames; category follows the decision rule (rotate Delivery/Learning/Career/general data; do not default Power BI). Active clone for Writes is this `website/` repo; `Documents/Orbit` can lag.

## Dependencies

| Dependency | Why introduced | Date |
|------------|----------------|------|
| `@vercel/analytics` | Privacy-light page analytics on Vercel | 2026-07-26 |
| `uqr` | Encode on-screen QR for `/qr-code` → `/card` | 2026-09-09 |

## File structure

```text
src/lib/news/
├── sources.ts      # RSS registry
├── balance.ts      # interleaveByCategory
├── fetcher.ts
└── cache*.ts
src/lib/site.ts                 # getSiteUrl()
src/lib/seo/
├── writes.ts       # modified date + absolute Write/OG URLs
└── og-card.tsx     # shared ImageResponse layouts (site + Write)
src/app/icon.tsx
src/app/writes/[slug]/opengraph-image.tsx
public/llms.txt
src/content/live-desks.ts
src/content/live/eu-zone-paths.ts
src/content/live/housing-map-paths.ts  # municipality outlines (legacy)
src/content/live/housing-postal-paths.ts  # Paavo postal SVG paths for HousingMap choropleth
scripts/live/build-housing-postal-paths.mjs
src/lib/live/
src/lib/live/housing-map-fill.ts
src/components/live/
src/components/live/HousingMap.tsx
src/app/portfolio/live/
data/live/power.json
data/live/eu-spot.json
data/live/housing.json
src/scripts/fetch-live-power.ts
src/scripts/fetch-live-eu-spot.ts
src/scripts/fetch-live-housing.ts
scripts/live/build-eu-zone-paths.mjs
src/app/robots.ts
src/app/feed.xml/route.ts
src/components/seo/
├── JsonLd.tsx
└── ArticleJsonLd.tsx
data/published-projects.json
src/content/writes/
public/field-card/index.html            # Agentic AI Field Card (home AI competency)
public/analytics-field-card/index.html  # Data Analytics Field Card (home Data competency)
public/delivery-field-card/index.html   # Technology Delivery Field Card (home Delivery competency)
src/lib/field-card/registry.ts          # Multi-card Apply review sync map (repo → Orbit path)
src/lib/field-card/slack.ts             # Laconic one-post-per-card #orbit FYI (Review/Considered/Changed/Online + Check card)
src/app/card/page.tsx                   # Public identity HUD (chrome-light)
src/app/qr-code/page.tsx                # On-screen QR to /card
src/components/card/                    # IdentityHud + CardQr
src/components/layout/AppChrome.tsx     # Hides header/footer/particles on /card and /qr-code
src/app/api/field-card/{preview,action}/ # Shared preview / Apply review for all registered cards
src/lib/newsletter/
├── digest.ts
├── ravens.ts       # all domains from AlexTouvras/ravens (no allowlist)
├── deliver.ts      # test-to or Resend Broadcast (no Approve)
├── run.ts
└── tokens.ts
src/app/newsletter/page.tsx
src/app/api/cron/newsletter/
src/lib/week-log/            # Studio /studio/week loaders + Heimdall matcher
src/app/studio/week/         # Hub + topic pages
src/components/studio/week/  # Topic panels + HeimdallEmbed
canvases/                    # Cursor IDE only; gitignored + tsconfig exclude
.state/
```

## Key decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-29 | Newsletter is email-only — no Slack digest FYI | Owner: do not post newsletter contents to Slack |
| 2026-08-29 | Newsletter primary = GHA Tue 07:15 UTC; Vercel cron Tue 08:00 backup | Vercel-only path produced zero Resend sends after 2026-08-18; GHA catch-up worked |
| 2026-08-31 | Fleet ops field-card check: skip open `chore/weekly-refresh-*` when same repo already merged that ISO week | Delivery W35 had PR #3 live + orphaned discovery PR #4; daily check kept paging #ops-channel |
| 2026-08-29 | Weekly Write Approve: hard-gate Slack notify until draft verified on GitHub default branch + NEXT_PUBLIC_SITE_URL set; link origin never defaults to localhost | Preview/Approve opened dead hosts or "Draft not found" — gitignored draft is not on Vercel FS; Slack links signed as localhost when notify ran locally |
| 2026-08-17 | Digest Ravens = one highlight per domain this week | Test email was a vault dump; owner asked for weekly highlights only |
| 2026-08-17 | Private week log at `/studio/week` behind Studio session, not a secret URL | Reuse existing password + noindex; lanes read git artifacts including CareerOps daily-digest / weekly-scan |
| 2026-08-17 | Digest auto-sends; `RESEND_NEWSLETTER_TEST_TO` for solo validation | Owner will judge the email in-inbox, not via Slack Approve |
| 2026-08-11 | Fitness coach systems Write + non-featured portfolio card | Ops loop (git/Slack/Automations/Intervals), not training diary; same personal-ops lane as mealplan |
| 2026-08-11 | Data Analytics Field Card + shared Orbit field-card registry | Same weekly discovery → Cursor judgment → #orbit Approve process as AI card; stack is ASK/GRAIN/TRUTH/USE (not a Fabric brochure) |
| 2026-08-13 | Technology Delivery Field Card + Hub competency href | Same weekly discovery → Cursor judgment → #orbit Approve as AI/analytics; stack is INTENT/WINDOW/PROOF/CUTOVER (not a Scrum/SAFe brochure) |
| 2026-08-13 | Field cards: verb lede + Always-on strip; AI gets LLM floor | Family pattern from poster comparison; MCP stays tool reach, not orchestration |
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
| 2026-09-05 | Field-card judgment watchdog: drop Saturday cron; keep Friday pass + Monday escalate | Saturday after Friday is redundant; owner asked to keep Friday only |
| 2026-09-05 | Field-card week always ships (stamp-only counts); discovery CI moves to Thursday and skips if the week already merged | Late Friday GHA opened duplicate PRs after review; agentic/analytics never published W36 |
| 2026-08-11 | Field-card pipeline fail-closed: discovery Slack ping + Sat/Mon judgment watchdog + Approve notify requires `## Summary` | W32 stalled silently when Friday Cursor Automation missed; silence meant “nothing happened” |
| 2026-08-11 | Field-card repo must carry the same `WEEKLY_WRITE_SECRET` as Orbit/Vercel (not only stale `CRON_SECRET`) | Preview/Approve tokens signed in field-card CI failed with `invalid signature` on production |
| 2026-08-12 | Public "Why Orbit" brand copy on Hub, About, and `building-orbit.mdx` | Name/metaphor was internal-only; visitors need the center-of-gravity story without reading maintainer docs |
| 2026-08-12 | Canonical local clone is `website/` only | Removed stale `Orbit/` duplicate and Cursor shadow folders pointing at the same repo |
| 2026-08-12 | Pixel avatar beside name on Hub + About (`profile.avatarUrl`, `PixelAvatar`) | Stylized identity mark without weakening typography-first heroes; JSON-LD Person `image` when set |
| 2026-08-13 | Brand foreground accents: unlayered `.orbit-accent` + hex `color` keyframes; `--orbit-accent` `<color>` (hex) for bg/border only | Channel `@property` + `oklch(var(--orbit-l)…)` and even `color: var(--orbit-accent)` went white on prod Chromium after LightningCSS; owner confirmed hex fg animation |
| 2026-08-13 | Hub accent targets = “Why the name”, header hexagon, cyan OrbitSignature, MissionHero stats, **all** `SectionHeading` eyebrows | Owner: labels like Core competencies should orbit together, not only one |
| 2026-08-13 | About CV role titles use `.orbit-accent` | Same cyan→purple loop as section eyebrows; were static `text-neon-cyan` |
| 2026-08-13 | Home About is a plain section (no GlassCard); About page Background / Why Orbit prose unboxed too | Boxed blurb sat next to unboxed section headings |
| 2026-08-13 | `neon-cyan` is static; only `.orbit-accent` / `--orbit-accent` bg-border utilities orbit | Home Case study / Read: inherited animated `text-neon-cyan` painted on one sibling only; all-or-none → none |
| 2026-08-13 | `SLACK_ORBIT_WEBHOOK_URL` on Vercel + GH Actions (Orbit + field-card repos); weekly CI prefers `#orbit` | P1-02; legacy `SLACK_WEBHOOK_URL` remains fallback only |
| 2026-09-05 | Fitness course strip on Studio week fitness: event date + stance + lift intent/density as Sunday input | Owner evaluates on localhost; past race dates must not stick in taper |
| 2026-09-05 | Cursor `canvases/` stay local (gitignore + tsconfig exclude) | First committed `.canvas.tsx` failed ship-check: Next cannot resolve `cursor/canvas` |
| 2026-09-05 | Studio Apply on Vercel = `repository_dispatch` → fitness-coach GHA | Vercel has no fitness `.venv`; `OPS_GITHUB_TOKEN` must be Contents write on fitness-coach |
| 2026-09-09 | Arc remaining HP: max = 100 + VIT, fill = Body Battery share | VIT formula unchanged; bar not in the gate letter |
| 2026-09-09 | Public identity HUD at `/card`; on-screen QR at `/qr-code`; About avatar opens the HUD | Calling card for IRL scans. No extra About hero button. QR encodes current origin so localhost/LAN works. `/qr-code` is noindex. |
| 2026-09-09 | HUD lane hints use field-card thesis (`hudTitle` / `hudVerbs` / `hudDescription`); Home keeps skill blurbs | Phone scan should show stack-not-dashboard / sequence-not-ticket, not the Hub competency paragraph |
| 2026-09-11 | EU Spot map uses real bidding-zone polygons (entsoe-py GeoJSON → SVG), not country choropleth | Owner asked for actual map; MIT-licensed zone shapes |
| 2026-09-11 | EU Spot prices from ENTSO-E A44 when `ENTSOE_SECURITY_TOKEN` set; Energy-Charts fallback | Owner generated API token; clears localhost-only license gate |
| 2026-09-11 | Finland Power Pulse folded into EU Spot; mix nowcast on every zone | Owner: remove Pulse from Portfolio; press-a-zone desk is the same reading order for FI as for every other bidding zone. Nowcast is hourly OLS on ENTSO-E mix, not Energy-Charts 15-min FI. |
| 2026-09-11 | EU Spot mix peek: dock under the map on small screens; float inset-clamped on `md+` | Phone tap clipped the overlay (`overflow-hidden` + `w-72` at the finger). In-flow card shows the full window. |
| 2026-09-11 | Write SEO is frontmatter-driven and automatic | Per-slug OG + BlogPosting/Breadcrumbs + sitemap freshness from `date`/`updated`; authors never hand-write meta for new posts |
| 2026-09-11 | Helsinki Housing Pulse live desk from Stat.fi `ashi` (monthly 15iq + quarterly 13mv) | Next queued desk after EU Spot; CC BY 4.0; refuse empty snapshot; flats-only grain matches liquid Helsinki market |
