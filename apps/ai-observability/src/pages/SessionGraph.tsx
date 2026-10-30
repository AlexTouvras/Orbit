import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { FlowCanvas } from '../components/FlowCanvas'
import { LeafPanel } from '../components/LeafPanel'
import { StatusPill } from '../components/StatusPill'
import { getSession } from '../data/sessions'
import {
  findStep,
  findTurn,
  stepsToGraph,
  turnsToGraph,
} from '../lib/graph'
import { formatDuration, formatWhen, sessionDurationMs } from '../lib/format'
import type { BreadcrumbItem, GraphLevel, Step } from '../model/types'

export function SessionGraph() {
  const { sessionId = '' } = useParams()
  const session = getSession(sessionId)
  const [level, setLevel] = useState<GraphLevel>({ kind: 'session' })
  const [leafStep, setLeafStep] = useState<Step | null>(null)

  const turn =
    level.kind === 'turn' || level.kind === 'step'
      ? findTurn(session!, level.turnId)
      : undefined

  const crumbs: BreadcrumbItem[] = useMemo(() => {
    if (!session) return []
    const items: BreadcrumbItem[] = [
      { label: session.name, level: { kind: 'session' } },
    ]
    if (level.kind === 'turn' || level.kind === 'step') {
      const t = findTurn(session, level.turnId)
      if (t) {
        items.push({
          label: t.label ?? `Turn ${t.index}`,
          level: { kind: 'turn', turnId: t.id },
        })
      }
    }
    if (level.kind === 'step' && turn) {
      const s = findStep(turn, level.stepId)
      if (s) {
        items.push({
          label: s.name,
          level: { kind: 'step', turnId: turn.id, stepId: s.id },
        })
      }
    }
    return items
  }, [session, level, turn])

  if (!session) {
    return (
      <div className="ao-page">
        <p>Session not found.</p>
        <Link to="/">Back to sessions</Link>
      </div>
    )
  }

  const duration = sessionDurationMs(session.startedAt, session.endedAt)

  const { nodes, edges, levelKey } = (() => {
    if (level.kind === 'session') {
      const g = turnsToGraph(session, (t) => {
        setLeafStep(null)
        setLevel({ kind: 'turn', turnId: t.id })
      })
      return { ...g, levelKey: `session:${session.id}` }
    }
    if (level.kind === 'turn' && turn) {
      const g = stepsToGraph(turn.steps, (step) => {
        if (step.children && step.children.length > 0) {
          setLeafStep(null)
          setLevel({ kind: 'step', turnId: turn.id, stepId: step.id })
          return
        }
        setLeafStep(step)
        setLevel({ kind: 'step', turnId: turn.id, stepId: step.id })
      })
      return { ...g, levelKey: `turn:${turn.id}` }
    }
    if (level.kind === 'step' && turn) {
      const step = findStep(turn, level.stepId)
      if (step?.children && step.children.length > 0) {
        const g = stepsToGraph(step.children, (child) => {
          if (child.children && child.children.length > 0) {
            setLeafStep(null)
            setLevel({ kind: 'step', turnId: turn.id, stepId: child.id })
            return
          }
          setLeafStep(child)
        })
        return { ...g, levelKey: `step:${step.id}` }
      }
      // Leaf level: keep parent turn steps visible behind the panel
      const g = stepsToGraph(turn.steps, (s) => {
        setLeafStep(s)
        setLevel({ kind: 'step', turnId: turn.id, stepId: s.id })
      })
      return { ...g, levelKey: `leaf:${level.stepId}` }
    }
    return { nodes: [], edges: [], levelKey: 'empty' }
  })()

  return (
    <div className="ao-page ao-page--graph">
      <header className="ao-graph-bar">
        <div className="ao-graph-bar__top">
          <Link to="/" className="ao-back">
            ← Sessions
          </Link>
          <div className="ao-graph-bar__identity">
            <p className="ao-brand ao-brand--sm">AI Observability</p>
            <StatusPill status={session.status} />
            <span className="ao-muted">{formatDuration(duration)}</span>
            <span className="ao-muted">{formatWhen(session.startedAt)}</span>
          </div>
        </div>
        <Breadcrumbs
          items={crumbs}
          onNavigate={(item) => {
            setLeafStep(null)
            setLevel(item.level)
          }}
        />
      </header>

      <div className={`ao-graph-stage ${leafStep ? 'ao-graph-stage--panel' : ''}`}>
        <div className="ao-graph-stage__canvas" key={levelKey}>
          <FlowCanvas nodes={nodes} edges={edges} levelKey={levelKey} />
        </div>
        {leafStep ? (
          <LeafPanel
            step={leafStep}
            onClose={() => {
              setLeafStep(null)
              if (turn) setLevel({ kind: 'turn', turnId: turn.id })
              else setLevel({ kind: 'session' })
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
