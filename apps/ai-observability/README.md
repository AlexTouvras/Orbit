# AI Observability — Session Explorer

Standalone fixture-backed MVP for drilling into Cursor IDE chats as:

**Session → Turn → Step → Leaf**

This app lives next to the Orbit Next.js site and does **not** wire into Hub, Studio, or live desks. Future private publish to Orbit Studio is possible later; `state.vscdb` ingest is a separate task.

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

1. **Session list** — three fixture chats with varied status/length  
2. **Turn flowchart** — React Flow boxes + sequence arrows  
3. **Drill** — turn → steps; leaf steps open a detail panel (prompt / tool I/O / errors)  
4. **Breadcrumbs** — Session › Turn › Step with click-up  

## Fixture schema (summary)

| Level | Fields |
| --- | --- |
| `Session` | `id`, `name`, `subtitle?`, `startedAt`, `endedAt?`, `status`, `source: "cursor-ide"`, `modelName?`, `workspaceLabel?`, `turns[]` |
| `Turn` | `id`, `index`, `label?`, `userText?`, `status`, timings, `steps[]` |
| `Step` | `id`, `bubblePath?`, `kind` (`model` \| `tool` \| `decision` \| `error` \| `thinking` \| `other`), `name`, `status`, timings, `children?`, `leaf?` |
| `Leaf` | `prompt?`, `completion?`, `thinking?`, `toolName?`, `toolArgs?`, `toolResult?`, `error?`, `attrs?`, `raw?` |

`bubblePath` mirrors Cursor IDE key suffixes (`{turnRoot}/s:n`, `{turnRoot}/t:{toolCallId}`) so a later `state.vscdb` importer can land on the same shape.

Fixtures: `src/data/fixtures/*.json`.
