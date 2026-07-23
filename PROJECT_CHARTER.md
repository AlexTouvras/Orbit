# Project charter — Orbit (personal website)

## North star

Keep [alextouvras.com](https://alextouvras.com) shipping: Hub, Writes, Portfolio, Studio, architecture sync, and weekly-write Slack approve — without breaking build or arch pipeline.

## Operating model

- Steer Orbit from **Cursor IDE chat in this repo** using **rules + skills**.
- **JARVIS / ProjectHelm is retired** (2026-07-22). Do not start its CEO loop or cockpit for Orbit work. Portfolio entry for JARVIS is `archived`.
- Product UI for Orbit is **this Next.js site** — not a shared foreman app.

## Success checks

- [ ] `node scripts/jarvis_smoke.mjs` passes (filename is legacy; it is Orbit structure smoke only)
- [ ] `npm run lint` is clean (currently known-red hooks; fix when touching those files)
- [ ] Architecture validate/sync works for touched projects
- [ ] Weekly-write / Hub critical paths remain reachable after changes
- [ ] No secrets committed; env stays in `.env.local`
- [x] Portfolio + arch registry reflect JARVIS retirement (`archived` / RETIRED summaries)
