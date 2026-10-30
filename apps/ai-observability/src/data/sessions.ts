import type { Session } from '../model/types'
import refactorAuth from './fixtures/session-refactor-auth.json'
import failedShell from './fixtures/session-failed-shell.json'
import shallowAsk from './fixtures/session-shallow-ask.json'

const fixtures: Session[] = [
  refactorAuth as Session,
  failedShell as Session,
  shallowAsk as Session,
]

/** Eagerly load any JSON sessions produced by `npm run import:cursor`. */
const importedModules = import.meta.glob('./imported/session-*.json', {
  eager: true,
}) as Record<string, { default: Session }>

function loadImported(): Session[] {
  return Object.values(importedModules)
    .map((mod) => mod.default)
    .filter((s): s is Session => Boolean(s?.id && Array.isArray(s.turns)))
}

export type SessionOrigin = 'fixture' | 'imported'

export interface SessionListItem extends Session {
  origin: SessionOrigin
}

function withOrigin(sessions: Session[], origin: SessionOrigin): SessionListItem[] {
  return sessions.map((s) => ({ ...s, origin }))
}

/** Fixtures first in sort by date; imported sessions merge into the same list. */
export function listSessions(opts?: {
  includeFixtures?: boolean
  includeImported?: boolean
}): SessionListItem[] {
  const includeFixtures = opts?.includeFixtures !== false
  const includeImported = opts?.includeImported !== false
  const items: SessionListItem[] = []
  if (includeFixtures) items.push(...withOrigin(fixtures, 'fixture'))
  if (includeImported) items.push(...withOrigin(loadImported(), 'imported'))

  // Prefer imported over fixture when ids collide.
  const byId = new Map<string, SessionListItem>()
  for (const s of items) {
    const prev = byId.get(s.id)
    if (!prev || (prev.origin === 'fixture' && s.origin === 'imported')) {
      byId.set(s.id, s)
    }
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )
}

export function getSession(id: string): SessionListItem | undefined {
  return listSessions().find((s) => s.id === id)
}

export function countByOrigin(): { fixture: number; imported: number } {
  const all = listSessions()
  return {
    fixture: all.filter((s) => s.origin === 'fixture').length,
    imported: all.filter((s) => s.origin === 'imported').length,
  }
}
