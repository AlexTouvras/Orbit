# AI Observability — Session Explorer

Standalone MVP for drilling into Cursor IDE chats as:

**Session → Turn → Step → Leaf**

This app lives next to the Orbit Next.js site and does **not** wire into Hub, Studio, or live desks. Data comes from hand fixtures and an optional **read-only** import from the local Cursor `state.vscdb`.

## Install & run

From the Orbit repo root:

```bash
cd apps/ai-observability
npm install
npm run dev
```

Open the URL Vite prints (default [http://localhost:5173](http://localhost:5173)).

Other scripts:

```bash
npm run build    # typecheck + production bundle
npm run preview  # serve the production build
```

## What you get

1. **Session list** — fixtures plus any imported chats (filter: All / Imported / Fixtures)  
2. **Turn flowchart** — React Flow boxes + sequence arrows  
3. **Drill** — turn → steps; leaf steps open a detail panel (prompt / tool I/O / errors)  
4. **Breadcrumbs** — Session › Turn › Step with click-up  

## Import from Cursor IDE (`state.vscdb`)

### Safety (hard rules)

- The importer **never writes** to `state.vscdb`, its WAL, or SHM.
- Default strategy opens the DB with SQLite URI `?mode=ro`.
- Optional `--strategy=copy` copies the DB (+ WAL if present) to a temp directory, reads the **copy**, then deletes the temp files. A full copy of a ~17 GB live DB is **slow and disk-heavy** — prefer `--composer` / `--limit` so you only materialize a few sessions.
- Exported JSON redacts `secret://…` and obvious token-looking strings; omits `toolCallBinary` / encryption key fields.
- No vacuum, migrate, or exclusive locks on Cursor’s files.

### Windows (PowerShell)

Canonical DB path on this machine:

```text
%APPDATA%\Cursor\User\globalStorage\state.vscdb
```

Requires **Node 22+** (`node:sqlite`).

```powershell
cd apps\ai-observability

# List recent non-draft, non-subagent composers
npm run import:cursor:list -- --limit 10

# Import one known session (recommended)
npm run import:cursor -- --composer c3d83492-71a0-4ee1-8a5f-68e21cb31f20

# Import the 3 most recent eligible composers
npm run import:cursor -- --limit 3

# Safer consistency snapshot (copies ~17GB — expect minutes + free disk)
npm run import:cursor -- --strategy=copy --composer <id>

# Custom DB / output
npm run import:cursor -- --db "C:\path\to\state.vscdb" --out ".\src\data\imported" --limit 2
```

JSON lands in `src/data/imported/session-*.json` plus `manifest.json`. Restart or refresh `npm run dev` so Vite picks up new files. The session list merges fixtures and imports automatically.

### Flags

| Flag | Meaning |
| --- | --- |
| `--db <path>` | Path to `state.vscdb` (default: `%APPDATA%/Cursor/User/globalStorage/state.vscdb`) |
| `--out <dir>` | Output directory (default: `src/data/imported`) |
| `--limit <n>` | Import N most recent eligible composers (default: `5`). Ignored when `--composer` is set. |
| `--composer <id>` | Import this id (repeatable or comma-separated) |
| `--strategy ro\|copy` | `ro` (default) or `copy` then read |
| `--list` | Print recent composers as JSON and exit |
| `--include-subagents` | Include `isSubagent=1` when selecting by `--limit` |
| `--include-drafts` | Include `draft-*` composers when selecting by `--limit` |

Do **not** bulk-import all ~500+ composers by default — always pass a sensible `--limit` or explicit `--composer` ids.

## Fixture / import schema (summary)

| Level | Fields |
| --- | --- |
| `Session` | `id`, `name`, `subtitle?`, `startedAt`, `endedAt?`, `status`, `source: "cursor-ide"`, `modelName?`, `workspaceLabel?`, `turns[]` |
| `Turn` | `id`, `index`, `label?`, `userText?`, `status`, timings, `steps[]` |
| `Step` | `id`, `bubblePath?`, `kind` (`model` \| `tool` \| `decision` \| `error` \| `thinking` \| `other`), `name`, `status`, timings, `children?`, `leaf?` |
| `Leaf` | `prompt?`, `completion?`, `thinking?`, `toolName?`, `toolArgs?`, `toolResult?`, `error?`, `attrs?`, `raw?` |

`bubblePath` mirrors Cursor IDE key suffixes (`{turnRoot}/s:n`, `{turnRoot}/t:{toolCallId}`).

Fixtures: `src/data/fixtures/*.json`.  
Imports: `src/data/imported/session-*.json`.
