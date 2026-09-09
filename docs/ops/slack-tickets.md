# Slack tickets (Orbit)

On-demand Cursor Automation: a human posts a ticket in the **project channel**, the agent implements it, opens a PR, and replies in the thread with a review. Human merges. Not a fleet job — do not use `#ops-channel`.

## File a ticket

Post a **top-level** message in `#orbit` (not a thread, not `#ops-channel`):

```text
Ticket · orbit · <short title>

<body — what is wrong, what good looks like, URLs or screenshots>
```

`website` is an alias for `orbit`. The prefix **is** the assign action. Do not `@Cursor` on the same message unless you want a second ad-hoc agent.

Examples:

```text
Ticket · orbit · Hub eyebrow contrast is too weak on dark
```

```text
Ticket · website · Studio week fitness HUD truncates the fifth stat on mobile
```

Follow-ups stay in that thread (or `@Cursor` in the thread). A new top-level `Ticket ·` line starts a new run.

## Other projects

| Prefix | Channel | Repo | Automation |
|--------|---------|------|------------|
| `Ticket · orbit ·` / `Ticket · website ·` | `#orbit` | `AlexTouvras/Orbit` | https://cursor.com/automations/08773269-ac28-11f1-b532-320a589b8025 |
| `Ticket · fitness ·` | `#fitness` | `AlexTouvras/fitness-coach` | https://cursor.com/automations/ab550692-ac2a-11f1-b532-320a589b8025 |
| `Ticket · ravens ·` | `#ravens` | `AlexTouvras/ravens` | https://cursor.com/automations/ab316e69-ac2a-11f1-b532-320a589b8025 |
| `Ticket · careerops ·` | `#all-careerops` | `AlexTouvras/careerops-private` | https://cursor.com/automations/ab788c8f-ac2a-11f1-b532-320a589b8025 |

Do not bind a second project to this Orbit job. Command Center keywords (`cv`, `status`, …) are not tickets. Fitness `log:` / `intent:` / `goal:` are not tickets.

## Agent playbook (fail-closed)

You are **Slack tickets · Orbit**. Bound repo: `AlexTouvras/Orbit` @ `main`. Channel: `#orbit`.

Read `.state/AUTOMATION_CONTRACT.md` first. Do not use ProjectBrain MCP.

### Hard rules

- One triggering Slack message = one ticket. Do not pull in BACKLOG items or drive-by refactors.
- Do **not** merge, force-push `main`, deploy, or send email.
- Do **not** post in `#ops-channel`.
- Reply in the **trigger thread** only.
- Ignore Weekly Write Approve/Skip, field-card FYI, essay feedback, Fleet check, and any message that is not this ticket.
- If the prefix is not `orbit` / `website`, stop and say this job only handles Orbit.

### Identify the run

First Slack reply, before code:

```text
Ticket · orbit · <title>
Working on AlexTouvras/Orbit. Will open a PR and come back with a review.
```

Use that title in the branch name (`ticket/<short-slug>`), PR title, and every later Slack reply.

### Implement

1. Read `.state/CURRENT_TASK.md` and `.state/ARCHITECTURE.md` only for constraints that affect this ticket.
2. Implement the ticket on a branch from `main`.
3. Verify: `npx tsc --noEmit` must exit 0. If the ticket touched UI, also reason about the affected routes (Hub, Studio, Writes, field-card static pages, …).
4. Open a PR. PR body must include `## Summary` (what changed and why) and `## Review` (what the human should look at). Do not merge.

### Review in Slack (required — PR link is not enough)

Thread reply when the PR exists:

1. **Review** — what changed, files, risk, what to look at. Short. No dump.
2. **PR** — url.
3. **How it looks now** when the change is user-visible:
   - Vercel preview URL for the PR (wait for the preview comment if needed).
   - Screenshots or a short recording of the affected pages (computer use). Named targets, not a generic homepage shot if the ticket named a screen.
   - If there is no UI (copy-only, API, cron): say `Visual: n/a` and why.
4. Next human action: review the PR (and preview), then merge yourself.

### Done

The PR is open, verify passed, the thread has review + visual-or-n/a, and `main` was not merged by this run.
