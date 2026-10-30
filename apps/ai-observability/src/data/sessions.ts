import type { Session } from '../model/types'
import refactorAuth from './fixtures/session-refactor-auth.json'
import failedShell from './fixtures/session-failed-shell.json'
import shallowAsk from './fixtures/session-shallow-ask.json'

const sessions: Session[] = [
  refactorAuth as Session,
  failedShell as Session,
  shallowAsk as Session,
]

export function listSessions(): Session[] {
  return [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )
}

export function getSession(id: string): Session | undefined {
  return sessions.find((s) => s.id === id)
}
