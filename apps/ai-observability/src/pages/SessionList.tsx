import { Link } from 'react-router-dom'
import { listSessions } from '../data/sessions'
import { formatDuration, formatWhen, sessionDurationMs } from '../lib/format'
import { StatusPill } from '../components/StatusPill'

export function SessionList() {
  const sessions = listSessions()

  return (
    <div className="ao-page ao-page--list">
      <header className="ao-hero">
        <p className="ao-brand">AI Observability</p>
        <h1>Session Explorer</h1>
        <p className="ao-lede">
          Pick a Cursor IDE chat, then drill Session → Turn → Step → Leaf.
        </p>
      </header>

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

      <p className="ao-footnote">
        Fixture-backed MVP. Live <code>state.vscdb</code> ingest comes later.
      </p>
    </div>
  )
}
