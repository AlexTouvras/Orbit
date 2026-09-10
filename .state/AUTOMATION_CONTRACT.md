# Automation contract

> Orbit hosts automation JSON backups; some automations bind to other repos.
> IDE agents use the same `.state/` files plus optional ProjectBrain MCP.

**Last updated:** 2026-09-10

## Runtime (this workspace)

| Field | Value |
|-------|-------|
| Repo | `AlexTouvras/Orbit` |
| Branch | `main` |
| Playbooks | `.cursor/automations/*.json`, `docs/ops/daily-check.md` |

## Automations managed from Orbit

| Name | Binds to | Trigger | Backup JSON |
|------|----------|---------|-------------|
| Daily ops check | `AlexTouvras/Orbit` | Daily 08:00 Helsinki | `.cursor/automations/daily-ops-check.json` | *(not in Cursor account — create or restore)* |
| Delivery field card weekly | `AlexTouvras/technology-delivery-field-card` | Fri 17:00 EEST | `.cursor/automations/delivery-field-card-weekly-content-pass.json` | https://cursor.com/automations/c85fb72e-970e-11f1-ba66-0e7d0216e441 |
| Analytics field card weekly | `AlexTouvras/data-analytics-field-card` | Fri 17:00 EEST | `.cursor/automations/analytics-field-card-weekly-content-pass.json` | https://cursor.com/automations/dd4bad7c-9558-11f1-ba66-0e7d0216e441 |
| Agentic AI field card weekly | `AlexTouvras/agentic-ai-field-card` | Fri 17:00 EEST | `.cursor/automations/agentic-field-card-weekly-content-pass.json` | https://cursor.com/automations/c0138489-8c1c-11f1-b532-320a589b8025 |
| Field card review | `AlexTouvras/Orbit` (gates all three) | Fri 18:00 EEST | `.cursor/automations/field-card-review.json` | https://cursor.com/automations/a1c0b46b-9a09-11f1-ba66-0e7d0216e441 |

Live URL (delivery): https://cursor.com/automations/c85fb72e-970e-11f1-ba66-0e7d0216e441

## Primary verify

| Automation | Verify |
|------------|--------|
| Daily ops | Propose-only run complete; `#ops-channel` silent when green |
| Field card weekly | `node scripts/check-links.mjs` clean if HTML changed; PR `## Summary` has update/no-change decision |

## Scope (one run = one item)

One automation invocation → one judgment pass (ops digest, or one field-card weekly PR).

## Read order (before acting)

1. `.state/AUTOMATION_CONTRACT.md` (this file)
2. Matching `.cursor/automations/<name>.json`
3. Target repo playbook (`docs/ops/daily-check.md`, `docs/weekly-refresh-prompt.md`, …)
4. `.state/CURRENT_TASK.md`

Do **not** depend on ProjectBrain MCP. Cloud cannot see `~/.cursor/`.

## Write order (before exit)

| Automation | Writes |
|------------|--------|
| Daily ops | Slack `#ops-channel` only when issues; memories update |
| Field card weekly | PR on target repo; stop for 18:00 review. Do not Slack-Approve from 17:00. |

## Out of scope

- Daily ops: no commit/push/merge from the agent
- Field card: no merge without human Slack Approve

## IDE coexistence

IDE sessions may use ProjectBrain MCP. Automations use playbooks + target repo state only.
