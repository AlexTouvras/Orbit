import type { NodeStatus, StepKind } from '../model/types'

export function formatDuration(ms?: number): string {
  if (ms == null || Number.isNaN(ms)) return '—'
  if (ms < 1000) return `${Math.round(ms)} ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`
  const mins = Math.floor(ms / 60_000)
  const secs = Math.round((ms % 60_000) / 1000)
  return `${mins}m ${secs}s`
}

export function formatWhen(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function sessionDurationMs(startedAt: string, endedAt?: string): number | undefined {
  if (!endedAt) return undefined
  const a = new Date(startedAt).getTime()
  const b = new Date(endedAt).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return undefined
  return Math.max(0, b - a)
}

export function statusLabel(status: NodeStatus): string {
  switch (status) {
    case 'ok':
      return 'ok'
    case 'error':
      return 'error'
    case 'aborted':
      return 'aborted'
    case 'running':
      return 'running'
  }
}

export function kindLabel(kind: StepKind): string {
  switch (kind) {
    case 'model':
      return 'model'
    case 'tool':
      return 'tool'
    case 'decision':
      return 'decision'
    case 'error':
      return 'error'
    case 'thinking':
      return 'thinking'
    case 'other':
      return 'other'
  }
}

export function prettyJson(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
