# Daily fleet check (playbook)

Standing instructions for the **Daily ops check** Cursor Automation. Bound repo: `AlexTouvras/Orbit` @ `main`. Channel: `#ops-channel`.

Read [`fleet.yaml`](./fleet.yaml) first. Follow it literally.

## Hard rules

- Propose-only. Do **not** commit, push, open a PR, merge, send email, or re-run another automation.
- Do **not** post in `#ops-channel` when every in-scope job is green (or snoozed).
- Do **not** invent Cursor automation run history. Cursor has no API here — infer from GitHub and Slack.
- Cloud cannot see `~/.cursor`. Missing local paths are not failures.
- Ignore bot loops: do not reply to your own `#ops-channel` digest as if it were a project job.
- Skip jobs whose `check` day has not arrived (e.g. `monday` jobs on Tuesday are in scope; `tuesday` jobs on Monday are not).
- Weekday SLA only: do not call a weekend-idle Approve "stale" until Monday 08:00.
- Snooze: if Memories say an issue is snoozed until a date that is still in the future, skip it.

## What to gather

1. `git pull` on this Orbit checkout. Read `docs/ops/fleet.yaml`.
2. Date and weekday in `Europe/Helsinki`.
3. For each in-scope job, collect **one** primary evidence source:

### GitHub Actions

```bash
gh run list --repo <repo> --workflow "<workflow>" --limit 3
```

Success = latest completed run `success` within `gh_run_success_within_hours`.

### GitHub commits (fitness)

```bash
gh api "repos/AlexTouvras/fitness-coach/commits?sha=master&per_page=10"
```

Look at commit messages and dates. Daily sync may legitimately have no commit on a quiet day; only fail if last matching commit is older than `stale_hours` **or** `#fitness` has a failure line today.

### Slack

Read the job's channel for the relevant window (today, or since the scheduled weekday). Search for `expect.pattern` / `expect.slack_pattern`. Also skim `#orbit` for Approve/Skip that is still waiting.

If `#career-ops` is empty, try `#all-careerops`.

### Field cards

```bash
gh pr list --repo <repo> --state open --limit 20
gh pr list --repo <repo> --state merged --search "chore/weekly-refresh-" --limit 5
```

Flag open heads matching `chore/weekly-refresh-*` on Monday. That means the Friday 18:00 review agent did not apply.

**Exception:** if the same repo already merged a `chore/weekly-refresh-<ISO-week>` PR this ISO week, any other open PR on the same head is an orphaned discovery duplicate — status `ok`, and note that it can be closed (do not call it `bad_output`).

## Verdict

For each in-scope job, set one status: `ok` | `missed_run` | `bad_output` | `stale_gate` | `snoozed` | `skipped`.

`bad_output` = the job ran but Slack/GitHub shows an error, empty body, or a known stale marker (e.g. fitness "STALE cloud snapshot").

## Slack in `#ops-channel` (issues only)

One top-level message:

- First line: `Fleet check YYYY-MM-DD — N issue(s).`
- Bullet per issue: **job name**, status, one-line evidence (run id, message link, or commit sha).

Then a thread reply per issue:

- What should have happened vs what you observed.
- Proposed fix from `fleet.yaml` (do not expand scope).
- `React ✅ to do this in a follow-up. React ⏸️ to snooze until next weekday. Ignore = leave for later. This run will not apply the fix.`

Keep it short. No tables. No headers. Bold the job name and the action.

If GitHub `gh` is unauthorized for a private repo, say `UNAVAILABLE: <repo>` and skip that job — do not guess it failed.

## Memories

Write:

- `last_check: YYYY-MM-DD`
- `green: true|false`
- snoozed issue ids and until-dates
- do not store secrets, holdings, or email

## Done

A Helsinki date was checked against the registry, every in-scope job has a status, `#ops-channel` is either silent or carries evidence + a proposed fix, and no repo was changed.
