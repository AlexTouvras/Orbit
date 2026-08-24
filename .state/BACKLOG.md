# Backlog

> Tracked in git. Upcoming work and hard scope boundaries.

## Now

- [x] Prepare and Slack-notify the 2026-08-24 pending weekly Write
- [x] Re-notify 2026-08-03 weekly Write with full essay in Slack + draft synced to default branch
- [x] Merge weekly Write Slack full-access fix (`fix/weekly-write-slack-full-access`)
- [x] Refresh weekly Write intake for 2026-08-03 / prepare pending IDE draft
- [x] Ship home AI competency → `/field-card/index.html` + static field card page
- [x] Field-card fail-closed: discovery Slack ping + judgment watchdog + Approve requires `## Summary` (agentic-ai-field-card PR #3)
- [x] W32 field card PR #2 merged (2026-08-11); Slack Approve/Skip flow verified
- [x] Scaffold Data Analytics Field Card repo + Orbit home link (`/analytics-field-card/`) + shared Approve registry
- [x] Scaffold Technology Delivery Field Card + Orbit home link (`/delivery-field-card/`) + registry entry
- [x] Bind Friday Cursor judgment for analytics field card (GH Action → Cloud Agents API)
- [x] Deploy analytics field card Orbit wiring to prod (main)
- [x] Human review first analytics field card (stack + tool picker) on home / print PDF — skipped 2026-08-13
- [x] Fix Aug 10 weekly Write preview (`invalid signature` + draft not on default branch)
- [x] Notify the 2026-07-27 weekly Write in Slack (`#orbit` catch-up; essay already live)
- [x] Refresh weekly Write intake and prepare the 2026-07-27 pending IDE draft
- [x] Prepare 2026-08-10 pending IDE draft + restore working Slack preview
- [x] Case study links for Orbit + Nordic Equity Heatmap
- [x] Rewrite `from-risk-to-delivery.mdx` with orbit-essay + anti-ai-slop
- [x] Rebalance Related articles RSS (Data / Analytics / Delivery vs AI flood)
- [x] Human review of new feed mix (shipped)
- [x] Human review of SEO + Vercel Analytics (deployed)
- [x] Human review of Hub/essay/project voice pass (2026-07-26)

## Next

- [x] Orbit weekly digest auto-send + test-to-self (`RESEND_NEWSLETTER_TEST_TO`)
- [x] Digest Ravens = one highlight per domain this week (not a vault dump)
- [x] Resend key + test-to env on Vercel/GitHub; local W34 test send to `a.touvras@gmail.com`
- [x] `RAVENS_GITHUB_TOKEN` on Vercel + GitHub Actions
- [ ] Owner: after happy with the shorter test mail, verify domain + unset `RESEND_NEWSLETTER_TEST_TO` for audience go-live
- [ ] Owner: review `/studio/week`; set `OPS_GITHUB_TOKEN` (Contents: Read on fitness-coach, mealplan-private, careerops-private, ravens) on Vercel + `.env.local`
- [x] Pixel avatar beside name on Hub + About (`/avatar-pixel-64.png`)
- [x] Human review: Hub + About avatar placement — skipped 2026-08-13
- [x] Brand orbit accents on prod: hexagon + Why the name + signature cyan (`eabb4a0`)
- [x] Home Case study / Read: static cyan (orbit not on one sibling only)
- [x] Home section eyebrows all static; About unboxed
- [x] MissionHero totals orbit; About prose unboxed like home
- [x] Section eyebrows all orbit; cycle stays in phase across pages
- [x] Human review: fitness coach Write rewrite (why / science / weekly gen / life) + portfolio card
- [x] Commit/push fitness coach Write + portfolio seed when owner asks
- [x] Optional browser check: `/portfolio` Case study links + `/writes/nordic-equity-heatmap` — skipped 2026-08-13
- [x] Persist essay feedback by slug and notify `#orbit` on new notes
- [x] Route weekly Write Slack draft/approve/skip to `#orbit`
- [x] Pressable education cards → master's theses (JYX + Theseus)
- [x] Capture thesis writing fingerprint in `docs/essay-voice.md` (improve essays, not academicize them)
- [x] Draft Delivery essay: AI acceleration + prioritization (Cohn + MobAI)
- [x] Publish `when-ai-accelerates-work-prioritization-becomes-the-job` to prod (main)
- [x] Remove Ultimate Reel Maker Write (out of domain)
- [x] SEO foundations + site analytics
- [x] Drop ProjectHelm Write; archived card → `/architecture/jarvis`
- [x] Voice pass: Hub copy, useful-work-per-dollar, Webb pair, building-orbit, project blurbs + Ledger

## Later

- [x] Optional: Google Search Console sitemap submit
- [x] Optional: Vercel Speed Insights — skipped 2026-08-13

## Out of scope (strict)

- Garmin workout embeds / hobby sync this phase

## Definition of done (current item)

- [x] Heatmap Write exists under `src/content/writes/nordic-equity-heatmap.mdx`
- [x] Orbit + Heatmap have `caseStudyUrl` in published projects JSON (+ seed)
- [x] Sources favor Data / Analytics / Delivery; AI capped
- [x] All view + weekly intake interleaved by category
- [x] `npm run news:fetch` succeeds with new feeds
- [x] Owner OK with the mix (add/drop any source)
- [x] `/sitemap.xml` + `/robots.txt` + `/feed.xml` in production build
- [x] `@vercel/analytics` in root layout; JSON-LD + article OG/canonicals
- [x] Owner review / deploy
