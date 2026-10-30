import type { Edge, Node } from '@xyflow/react'
import type { NodeStatus, Session, Step, StepKind, Turn } from '../model/types'

export type FlowNodeData = {
  title: string
  subtitle?: string
  status: NodeStatus
  kind?: StepKind | 'turn'
  durationMs?: number
  drillable: boolean
  onOpen: () => void
}

export type AoNode = Node<FlowNodeData, 'aoNode'>

const X = 0
const Y_GAP = 120

export function layoutSequence(
  items: Array<{
    id: string
    title: string
    subtitle?: string
    status: NodeStatus
    kind?: StepKind | 'turn'
    durationMs?: number
    drillable: boolean
    onOpen: () => void
  }>,
): { nodes: AoNode[]; edges: Edge[] } {
  const nodes: AoNode[] = items.map((item, i) => ({
    id: item.id,
    type: 'aoNode' as const,
    position: { x: X, y: i * Y_GAP },
    data: {
      title: item.title,
      subtitle: item.subtitle,
      status: item.status,
      kind: item.kind,
      durationMs: item.durationMs,
      drillable: item.drillable,
      onOpen: item.onOpen,
    },
  }))

  const edges: Edge[] = []
  for (let i = 0; i < items.length - 1; i += 1) {
    edges.push({
      id: `e-${items[i].id}-${items[i + 1].id}`,
      source: items[i].id,
      target: items[i + 1].id,
      type: 'smoothstep',
      animated: items[i].status === 'running',
      style: { stroke: 'var(--ao-edge)', strokeWidth: 1.5 },
    })
  }

  return { nodes, edges }
}

export function turnsToGraph(
  session: Session,
  onOpenTurn: (turn: Turn) => void,
): { nodes: AoNode[]; edges: Edge[] } {
  return layoutSequence(
    session.turns.map((turn) => ({
      id: turn.id,
      title: turn.label ?? `Turn ${turn.index}`,
      subtitle: turn.userText
        ? turn.userText.length > 72
          ? `${turn.userText.slice(0, 72)}…`
          : turn.userText
        : `${turn.steps.length} steps`,
      status: turn.status,
      kind: 'turn',
      durationMs: turn.durationMs,
      drillable: turn.steps.length > 0,
      onOpen: () => onOpenTurn(turn),
    })),
  )
}

export function stepsToGraph(
  steps: Step[],
  onOpenStep: (step: Step) => void,
): { nodes: AoNode[]; edges: Edge[] } {
  return layoutSequence(
    steps.map((step) => ({
      id: step.id,
      title: step.name,
      subtitle: step.kind,
      status: step.status,
      kind: step.kind,
      durationMs: step.durationMs,
      drillable: Boolean(step.children?.length) || Boolean(step.leaf),
      onOpen: () => onOpenStep(step),
    })),
  )
}

export function findTurn(session: Session, turnId: string): Turn | undefined {
  return session.turns.find((t) => t.id === turnId)
}

export function findStep(turn: Turn, stepId: string): Step | undefined {
  return turn.steps.find((s) => s.id === stepId)
}
