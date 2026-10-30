import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { countByOrigin, listSessions } from '../data/sessions'
import { formatDuration, formatWhen, sessionDurationMs } from '../lib/format'
import { StatusPill } from '../components/StatusPill'

type Filter = 'all' | 'imported' | 'fixtures'

export function SessionList() {
  const [filter, setFilter] = useState<Filter>('all')
  const counts = countByOrigin()

  const sessions = useMemo(() => {
    if (filter === 'imported') {
      return listSessions({ includeFixtures: false, includeImported: true })
    }
    if (filter === 'fixtures') {
      return listSessions({ includeFixtures: true, includeImported: false })
    }
    return listSessions()
  }, [filter])

  return (
    <div className="ao-page ao-page--list">
      <header className="ao-hero">
        <p className="ao-brand">AI Observability</p>
        <h1>Session Explorer</h1>
        <p className="ao-lede">
          Pick a Cursor IDE chat, then drill Session → Turn → Step → Leaf.
        </p>
      </header>

      <div className="ao-filter" role="group" aria-label="Session source">
        {(
          [
            ['all', `All (${counts.fixture + counts.imported})`],
            ['imported', `Imported (${counts.imported})`],
            ['fixtures', `Fixtures (${counts.fixture})`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={
              filter === value ? 'ao-chip ao-chip--active' : 'ao-chip'
            }
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {sessions.length === 0 ? (
        <p className="ao-empty">
          No sessions in this filter.
          {filter === 'imported' ? (
            <>
              {' '}
              Run <code>npm run import:cursor -- --composer &lt;id&gt;</code> to
              load from <code>state.vscdb</code>.
            </>
          ) : null}
        </p>
      ) : (
        <ul className="ao-session-list">
          {sessions.map((session, i) => {
            const duration = sessionDurationMs(session.startedAt, session.endedAt)
            return (
              <li
                key={session.id}
                className="ao-session-row"
                style={{ animationDelay: `${80 + i * 70}ms` }}
              >
                <Link to={`/sessions/${session.id}`} className="ao-session-link">
                  <div className="ao-session-link__main">
                    <div className="ao-session-link__title-row">
                      <h2>{session.name}</h2>
                      <StatusPill status={session.status} />
                      <span
                        className={
                          session.origin === 'imported'
                            ? 'ao-origin ao-origin--imported'
                            : 'ao-origin'
                        }
                      >
                        {session.origin}
                      </span>
                    </div>
                    {session.subtitle ? (
                      <p className="ao-session-link__sub">{session.subtitle}</p>
                    ) : null}
                  </div>
                  <dl className="ao-session-meta">
                    <div>
                      <dt>Started</dt>
                      <dd>{formatWhen(session.startedAt)}</dd>
                    </div>
                    <div>
                      <dt>Duration</dt>
                      <dd>{formatDuration(duration)}</dd>
                    </div>
                    <div>
                      <dt>Turns</dt>
                      <dd>{session.turns.length}</dd>
                    </div>
                    <div>
                      <dt>Source</dt>
                      <dd>{session.source}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <p className="ao-footnote">
        Fixtures always ship with the app. Imported sessions come from a
        read-only <code>state.vscdb</code> copy/open via{' '}
        <code>npm run import:cursor</code> — the Cursor DB is never written.
      </p>
    </div>
  )
}
