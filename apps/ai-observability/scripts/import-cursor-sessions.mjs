#!/usr/bin/env node
/**
 * Safe read-only importer: Cursor IDE state.vscdb → Session Explorer JSON.
 *
 * Never writes to state.vscdb / WAL / SHM. Opens with ?mode=ro, or copies the
 * DB (+ WAL) to a temp dir first (--strategy=copy) then reads the copy.
 *
 * Requires Node 22+ (uses node:sqlite).
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(__dirname, '..')
const DEFAULT_OUT = join(APP_ROOT, 'src', 'data', 'imported')
const DEFAULT_DB = join(
  process.env.APPDATA || '',
  'Cursor',
  'User',
  'globalStorage',
  'state.vscdb',
)

const YEAR_MS = 365 * 24 * 60 * 60 * 1000

function usage() {
  console.log(`Usage: node scripts/import-cursor-sessions.mjs [options]

Options:
  --db <path>           Path to state.vscdb (default: %APPDATA%/Cursor/.../state.vscdb)
  --out <dir>           Output directory for session JSON (default: src/data/imported)
  --limit <n>           Import N most recent non-draft composers (default: 5)
  --composer <id>       Import this composerId (repeatable / comma-separated). Ignores --limit.
  --strategy <mode>     ro (default) | copy
                        ro   = open source with SQLite ?mode=ro (no writes)
                        copy = copy DB+WAL to temp, then read the copy (safer consistency;
                               ~17GB+ — slow / large disk)
  --list                List recent composers and exit (respects --limit)
  --include-subagents   Include isSubagent=1 rows when selecting by --limit
  --include-drafts      Include draft-* composers when selecting by --limit
  --help                Show this help

Safety:
  - Never writes, vacuums, or migrates state.vscdb / WAL / SHM
  - Redacts secret:// and obvious token-looking strings in exported JSON
  - Skips opaque toolCallBinary blobs
`)
}

function parseArgs(argv) {
  const opts = {
    db: DEFAULT_DB,
    out: DEFAULT_OUT,
    limit: 5,
    composers: [],
    strategy: 'ro',
    list: false,
    includeSubagents: false,
    includeDrafts: false,
    help: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => {
      const v = argv[++i]
      if (v == null) throw new Error(`Missing value after ${a}`)
      return v
    }
    switch (a) {
      case '--db':
        opts.db = resolve(next())
        break
      case '--out':
        opts.out = resolve(next())
        break
      case '--limit':
        opts.limit = Math.max(0, Number(next()))
        break
      case '--composer':
        opts.composers.push(
          ...next()
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        )
        break
      case '--strategy': {
        const s = next()
        if (s !== 'ro' && s !== 'copy') {
          throw new Error(`--strategy must be ro|copy, got ${s}`)
        }
        opts.strategy = s
        break
      }
      case '--list':
        opts.list = true
        break
      case '--include-subagents':
        opts.includeSubagents = true
        break
      case '--include-drafts':
        opts.includeDrafts = true
        break
      case '--help':
      case '-h':
        opts.help = true
        break
      default:
        throw new Error(`Unknown argument: ${a}`)
    }
  }
  return opts
}

/** Redact secret:// URIs and obvious token-looking strings. */
function redactValue(value, keyHint = '') {
  if (value == null) return value
  if (typeof value === 'string') {
    if (value.startsWith('secret://')) return '[REDACTED_SECRET_URI]'
    if (/blobEncryptionKey|encryptionKey|api[_-]?key|access[_-]?token|refresh[_-]?token|clientSecret/i.test(keyHint)) {
      return '[REDACTED]'
    }
    let s = value.replace(/secret:\/\/[^\s"']+/g, '[REDACTED_SECRET_URI]')
    s = s.replace(
      /\b(sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|Bearer\s+[A-Za-z0-9._~+/=-]{20,})\b/g,
      '[REDACTED_TOKEN]',
    )
    return s
  }
  if (Array.isArray(value)) {
    return value.map((v) => redactValue(v, keyHint))
  }
  if (typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      if (/blobEncryptionKey|speculativeSummarizationEncryptionKey|toolCallBinary/i.test(k)) {
        out[k] = '[OMITTED]'
        continue
      }
      out[k] = redactValue(v, k)
    }
    return out
  }
  return value
}

function tryParseJson(raw) {
  if (raw == null) return null
  if (typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return null
    try {
      return JSON.parse(t)
    } catch {
      return raw
    }
  }
  if (Buffer.isBuffer(raw) || raw instanceof Uint8Array) {
    return tryParseJson(Buffer.from(raw).toString('utf8'))
  }
  return raw
}

function parseMaybeJsonField(raw) {
  const v = tryParseJson(raw)
  return redactValue(v)
}

function msToIso(ms) {
  if (ms == null || !Number.isFinite(Number(ms))) return undefined
  const n = Number(ms)
  // Cursor sometimes stores "unix + ~1y" for header/composerData clocks.
  // Prefer values that land in a sane 2000–2100 window after optional correction.
  const candidates = [n, n - YEAR_MS]
  for (const c of candidates) {
    const d = new Date(c)
    const y = d.getUTCFullYear()
    if (y >= 2000 && y <= 2100) return d.toISOString()
  }
  return new Date(n).toISOString()
}

function pickIso(...candidates) {
  for (const c of candidates) {
    if (typeof c === 'string' && c.includes('T')) return c
    if (typeof c === 'number') {
      const iso = msToIso(c)
      if (iso) return iso
    }
  }
  return undefined
}

function mapToolStatus(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'error' || s === 'failed') return 'error'
  if (s === 'cancelled' || s === 'canceled' || s === 'aborted') return 'aborted'
  if (s === 'running' || s === 'pending' || s === 'in_progress') return 'running'
  if (s === 'completed' || s === 'success' || s === 'ok' || s === '') return 'ok'
  return 'ok'
}

function mapSessionStatus(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'aborted' || s === 'cancelled' || s === 'canceled') return 'aborted'
  if (s === 'error' || s === 'failed') return 'error'
  if (s === 'generating' || s === 'running' || s === 'in_progress') return 'running'
  return 'ok'
}

function durationMs(start, end) {
  if (start == null || end == null) return undefined
  const a = Number(start)
  const b = Number(end)
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return undefined
  return b - a
}

function workspaceLabel(workspaceIdentifier, workspaceId) {
  const uri = workspaceIdentifier?.uri
  const fsPath = uri?.fsPath || uri?.path || workspaceIdentifier?.id
  if (typeof fsPath === 'string' && fsPath.length) {
    const parts = fsPath.replace(/\\/g, '/').split('/').filter(Boolean)
    return parts[parts.length - 1] || fsPath
  }
  return workspaceId || undefined
}

function openReadonlyDb(dbPath) {
  const uri = `file:${dbPath.replace(/\\/g, '/')}?mode=ro`
  return new DatabaseSync(uri, { open: true })
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KiB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MiB`
  return `${(n / 1024 ** 3).toFixed(2)} GiB`
}

function copyDbToTemp(dbPath) {
  const size = statSync(dbPath).size
  console.error(
    `Copying ${formatBytes(size)} DB to temp (plus WAL if present). This may take a while…`,
  )
  const dir = mkdtempSync(join(tmpdir(), 'ao-vscdb-'))
  const dest = join(dir, 'state.vscdb')
  const started = Date.now()
  copyFileSync(dbPath, dest)
  for (const suffix of ['-wal', '-shm']) {
    const side = `${dbPath}${suffix}`
    if (existsSync(side)) {
      copyFileSync(side, `${dest}${suffix}`)
      console.error(`  copied ${basename(side)} (${formatBytes(statSync(side).size)})`)
    }
  }
  console.error(`Copy done in ${((Date.now() - started) / 1000).toFixed(1)}s → ${dir}`)
  return { dir, dbPath: dest }
}

function assertNoWriteIntent(dbPath) {
  // Soft check: file should remain readable; we never open without mode=ro or copy.
  if (!existsSync(dbPath)) {
    throw new Error(`DB not found: ${dbPath}`)
  }
}

function listComposerCandidates(db, opts) {
  const rows = db
    .prepare(
      `SELECT composerId, workspaceId, createdAt, lastUpdatedAt, isArchived, isSubagent,
              value, subagentTypeName
       FROM composerHeaders
       ORDER BY lastUpdatedAt DESC`,
    )
    .all()

  const out = []
  for (const row of rows) {
    const id = row.composerId
    if (!opts.includeDrafts && String(id).startsWith('draft-')) continue
    if (!opts.includeSubagents && Number(row.isSubagent) === 1) continue
    let head = {}
    try {
      head = JSON.parse(row.value) || {}
    } catch {
      head = {}
    }
    out.push({
      composerId: id,
      workspaceId: row.workspaceId,
      createdAt: row.createdAt,
      lastUpdatedAt: row.lastUpdatedAt,
      isArchived: row.isArchived,
      isSubagent: row.isSubagent,
      subagentTypeName: row.subagentTypeName,
      name: head.name || head.subtitle || '(untitled)',
      subtitle: head.subtitle,
    })
    if (opts.composers.length === 0 && out.length >= opts.limit) break
  }
  return out
}

function loadComposerData(db, composerId) {
  const row = db
    .prepare('SELECT value FROM cursorDiskKV WHERE key = ?')
    .get(`composerData:${composerId}`)
  if (!row) return null
  return tryParseJson(row.value)
}

function parseBubbleKey(composerId, key) {
  const prefix = `bubbleId:${composerId}:`
  if (!key.startsWith(prefix)) return null
  const suffix = key.slice(prefix.length)
  // Tool keys may embed a newline before an fc_* suffix; normalize for UI paths.
  const bubblePath = suffix.replace(/\r?\n/g, '⏎')
  const toolMatch = suffix.match(/^([^/]+)\/t:(.+)$/s)
  if (toolMatch) {
    return {
      turnRootId: toolMatch[1],
      kind: 'tool',
      toolKey: toolMatch[2].replace(/\r?\n/g, '⏎'),
      bubblePath,
    }
  }
  const stepMatch = suffix.match(/^([^/]+)\/s:(\d+)$/)
  if (stepMatch) {
    return {
      turnRootId: stepMatch[1],
      kind: 'step',
      stepIndex: Number(stepMatch[2]),
      bubblePath,
    }
  }
  if (!suffix.includes('/')) {
    return { turnRootId: suffix, kind: 'root', bubblePath }
  }
  return { turnRootId: suffix.split('/')[0], kind: 'other', bubblePath }
}

function stepSortKey(step) {
  const t = step._sortMs ?? 0
  const path = step.bubblePath || ''
  const sMatch = path.match(/\/s:(\d+)$/)
  const sIdx = sMatch ? Number(sMatch[1]) : 1e9
  return [t, sIdx, path]
}

function buildStepFromBubble(parsed, bubble) {
  const startedAt = pickIso(bubble.createdAt, bubble.startedAtMs)
  const endedAt = pickIso(bubble.completedAtMs)
  const dur = durationMs(bubble.startedAtMs, bubble.completedAtMs)

  if (parsed.kind === 'tool' || bubble.toolFormerData || bubble.capabilityType === 15) {
    const tfd = bubble.toolFormerData || {}
    const status = mapToolStatus(tfd.status)
    const name = tfd.name || 'tool'
    const errMsg =
      tfd.clientVisibleErrorMessage ||
      tfd.modelVisibleErrorMessage ||
      (status === 'error' ? 'Tool error' : undefined)
    const toolArgs = parseMaybeJsonField(tfd.rawArgs ?? tfd.params)
    const toolResult = parseMaybeJsonField(tfd.result)
    return {
      id: `step-${parsed.bubblePath}`,
      bubblePath: parsed.bubblePath,
      kind: status === 'error' ? 'error' : 'tool',
      name,
      status,
      startedAt,
      endedAt,
      durationMs: dur,
      leaf: redactValue({
        toolName: name,
        toolArgs,
        toolResult,
        error: errMsg
          ? {
              message: String(errMsg),
              detail: [
                tfd.clientVisibleErrorMessage &&
                  `clientVisibleErrorMessage: ${tfd.clientVisibleErrorMessage}`,
                tfd.modelVisibleErrorMessage &&
                  `modelVisibleErrorMessage: ${tfd.modelVisibleErrorMessage}`,
              ]
                .filter(Boolean)
                .join('\n'),
            }
          : undefined,
        attrs: {
          toolCallId: tfd.toolCallId || parsed.toolKey,
          status: tfd.status,
          toolIndex: tfd.toolIndex,
          modelCallId: tfd.modelCallId,
        },
      }),
      _sortMs: Number(bubble.startedAtMs ?? (Date.parse(startedAt || '') || 0)),
    }
  }

  const thinkingText =
    typeof bubble.thinking === 'string'
      ? bubble.thinking
      : bubble.thinking?.text
  const isThinking = bubble.capabilityType === 30 || Boolean(thinkingText)
  const text = typeof bubble.text === 'string' ? bubble.text : ''
  const kind = isThinking ? 'thinking' : text ? 'model' : 'other'
  const name = isThinking
    ? truncateLabel(thinkingText || 'Thinking', 72)
    : truncateLabel(text || `step ${parsed.stepIndex ?? ''}`.trim(), 72)

  return {
    id: `step-${parsed.bubblePath}`,
    bubblePath: parsed.bubblePath,
    kind,
    name: name || (isThinking ? 'Thinking' : 'Assistant'),
    status: 'ok',
    startedAt,
    endedAt,
    durationMs: dur ?? (bubble.thinkingDurationMs != null ? Number(bubble.thinkingDurationMs) : undefined),
    leaf: redactValue({
      thinking: isThinking ? thinkingText || undefined : undefined,
      completion: !isThinking && text ? text : undefined,
      attrs: {
        capabilityType: bubble.capabilityType ?? null,
        thinkingDurationMs: bubble.thinkingDurationMs,
        requestId: bubble.requestId,
        tokenCount: bubble.tokenCount,
      },
    }),
    _sortMs: Number(bubble.startedAtMs ?? (Date.parse(startedAt || '') || 0)),
  }
}

function truncateLabel(text, n) {
  const t = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (t.length <= n) return t
  return `${t.slice(0, n - 1)}…`
}

function importComposer(db, headerRow, composerData) {
  const composerId = headerRow.composerId
  const prefix = `bubbleId:${composerId}:%`
  const rows = db
    .prepare('SELECT key, value FROM cursorDiskKV WHERE key LIKE ?')
    .all(prefix)

  /** @type {Map<string, { root?: any, steps: any[] }>} */
  const turns = new Map()

  for (const row of rows) {
    const parsed = parseBubbleKey(composerId, row.key)
    if (!parsed) continue
    const bubble = tryParseJson(row.value)
    if (!bubble || typeof bubble !== 'object') continue

    if (!turns.has(parsed.turnRootId)) {
      turns.set(parsed.turnRootId, { root: undefined, steps: [] })
    }
    const bucket = turns.get(parsed.turnRootId)

    if (parsed.kind === 'root' || bubble.type === 1) {
      // Prefer type=1 user roots; ignore accidental overwrite with non-roots.
      if (!bucket.root || bubble.type === 1) bucket.root = bubble
      continue
    }

    if (parsed.kind === 'step' || parsed.kind === 'tool' || parsed.kind === 'other') {
      bucket.steps.push(buildStepFromBubble(parsed, bubble))
    }
  }

  const turnList = [...turns.entries()]
    .map(([turnRootId, bucket], index) => {
      const root = bucket.root || {}
      const steps = bucket.steps
        .sort((a, b) => {
          const ka = stepSortKey(a)
          const kb = stepSortKey(b)
          for (let i = 0; i < ka.length; i++) {
            if (ka[i] < kb[i]) return -1
            if (ka[i] > kb[i]) return 1
          }
          return 0
        })
        .map(({ _sortMs, ...rest }) => rest)

      const hasError = steps.some((s) => s.status === 'error')
      const startedAt = pickIso(
        root.createdAt,
        steps[0]?.startedAt,
        headerRow.createdAt,
      )
      const endedCandidates = steps
        .map((s) => s.endedAt || s.startedAt)
        .filter(Boolean)
      const endedAt =
        endedCandidates.length > 0
          ? endedCandidates[endedCandidates.length - 1]
          : startedAt
      const userText =
        typeof root.text === 'string' && root.text.trim()
          ? root.text
          : undefined

      return {
        id: turnRootId,
        index: index + 1,
        label: truncateLabel(userText || `Turn ${index + 1}`, 80),
        userText,
        status: hasError ? 'error' : 'ok',
        startedAt: startedAt || new Date(0).toISOString(),
        endedAt,
        durationMs:
          startedAt && endedAt
            ? Math.max(0, Date.parse(endedAt) - Date.parse(startedAt))
            : undefined,
        steps,
        _sortMs: Date.parse(startedAt || '') || 0,
      }
    })
    .sort((a, b) => a._sortMs - b._sortMs)
    .map(({ _sortMs, ...rest }, i) => ({ ...rest, index: i + 1 }))

  const name =
    composerData?.name ||
    headerRow.name ||
    '(untitled)'
  const subtitle = composerData?.subtitle || headerRow.subtitle
  const startedAt =
    pickIso(
      turnList[0]?.startedAt,
      composerData?.createdAt,
      headerRow.createdAt,
    ) || new Date(0).toISOString()
  const endedAt = pickIso(
    turnList[turnList.length - 1]?.endedAt,
    composerData?.lastUpdatedAt,
    headerRow.lastUpdatedAt,
  )
  const sessionStatus = turnList.some((t) => t.status === 'error')
    ? 'error'
    : mapSessionStatus(composerData?.status)

  /** @type {import('../src/model/types.ts').Session} */
  const session = redactValue({
    id: composerId,
    name,
    subtitle,
    startedAt,
    endedAt,
    status: sessionStatus,
    source: 'cursor-ide',
    modelName: composerData?.modelConfig?.modelName || 'default',
    workspaceLabel: workspaceLabel(
      composerData?.workspaceIdentifier,
      headerRow.workspaceId,
    ),
    turns: turnList,
  })

  return {
    session,
    bubbleCount: rows.length,
    turnCount: turnList.length,
    stepCount: turnList.reduce((n, t) => n + t.steps.length, 0),
  }
}

function slugify(name) {
  return String(name || 'session')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'session'
}

function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.help) {
    usage()
    process.exit(0)
  }

  assertNoWriteIntent(opts.db)
  console.error(`DB: ${opts.db}`)
  console.error(`Strategy: ${opts.strategy} (read-only; no writes to Cursor DB)`)

  let tempCopy = null
  let dbPath = opts.db
  try {
    if (opts.strategy === 'copy') {
      tempCopy = copyDbToTemp(opts.db)
      dbPath = tempCopy.dbPath
    }

    const db = openReadonlyDb(dbPath)

    let selected
    if (opts.composers.length > 0) {
      selected = opts.composers.map((id) => {
        const row = db
          .prepare(
            `SELECT composerId, workspaceId, createdAt, lastUpdatedAt, isArchived, isSubagent,
                    value, subagentTypeName
             FROM composerHeaders WHERE composerId = ?`,
          )
          .get(id)
        if (!row) throw new Error(`composerId not found in composerHeaders: ${id}`)
        let head = {}
        try {
          head = JSON.parse(row.value) || {}
        } catch {
          /* ignore */
        }
        return {
          composerId: row.composerId,
          workspaceId: row.workspaceId,
          createdAt: row.createdAt,
          lastUpdatedAt: row.lastUpdatedAt,
          isArchived: row.isArchived,
          isSubagent: row.isSubagent,
          subagentTypeName: row.subagentTypeName,
          name: head.name || '(untitled)',
          subtitle: head.subtitle,
        }
      })
    } else {
      selected = listComposerCandidates(db, opts)
    }

    if (opts.list) {
      console.log(
        JSON.stringify(
          selected.map((s) => ({
            composerId: s.composerId,
            name: s.name,
            subtitle: s.subtitle,
            isSubagent: Boolean(s.isSubagent),
            lastUpdatedAt: s.lastUpdatedAt,
            lastUpdatedAtIso: msToIso(s.lastUpdatedAt),
          })),
          null,
          2,
        ),
      )
      db.close()
      return
    }

    if (selected.length === 0) {
      console.error('No composers matched. Try --include-drafts / --include-subagents / --composer.')
      db.close()
      process.exit(1)
    }

    mkdirSync(opts.out, { recursive: true })
    const manifest = []

    for (const header of selected) {
      const composerData = loadComposerData(db, header.composerId)
      const { session, bubbleCount, turnCount, stepCount } = importComposer(
        db,
        header,
        composerData,
      )
      const fileBase = `session-${slugify(session.name)}-${session.id.slice(0, 8)}.json`
      const outPath = join(opts.out, fileBase)
      writeFileSync(outPath, `${JSON.stringify(session, null, 2)}\n`, 'utf8')
      console.error(
        `Wrote ${fileBase}  turns=${turnCount} steps=${stepCount} bubbles=${bubbleCount}`,
      )
      manifest.push({
        id: session.id,
        name: session.name,
        file: fileBase,
        turns: turnCount,
        steps: stepCount,
        bubbles: bubbleCount,
      })
    }

    writeFileSync(
      join(opts.out, 'manifest.json'),
      `${JSON.stringify({ importedAt: new Date().toISOString(), sessions: manifest }, null, 2)}\n`,
      'utf8',
    )
    console.error(`Manifest: ${join(opts.out, 'manifest.json')}`)
    console.error('Done. Cursor DB was not written.')

    db.close()
  } finally {
    if (tempCopy?.dir) {
      try {
        rmSync(tempCopy.dir, { recursive: true, force: true })
        console.error(`Removed temp copy ${tempCopy.dir}`)
      } catch (err) {
        console.error(`Warning: could not remove temp copy: ${err}`)
      }
    }
  }
}

try {
  main()
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}
