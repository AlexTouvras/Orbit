/** Session → Turn → Step → Leaf — fixture contract compatible with future state.vscdb ingest. */

export type NodeStatus = 'ok' | 'error' | 'aborted' | 'running'

export type StepKind = 'model' | 'tool' | 'decision' | 'error' | 'thinking' | 'other'

export interface LeafDetail {
  prompt?: string
  completion?: string
  thinking?: string
  toolName?: string
  toolArgs?: unknown
  toolResult?: unknown
  error?: {
    message: string
    detail?: string
  }
  attrs?: Record<string, unknown>
  raw?: unknown
}

export interface Step {
  id: string
  /** Bubble path suffix when known, e.g. `{turnRoot}/s:3` or `{turnRoot}/t:{toolCallId}` */
  bubblePath?: string
  kind: StepKind
  name: string
  status: NodeStatus
  startedAt?: string
  endedAt?: string
  durationMs?: number
  /** Nested children if ingest ever emits them; MVP fixtures usually omit. */
  children?: Step[]
  leaf?: LeafDetail
}

export interface Turn {
  id: string
  index: number
  label?: string
  /** User message text (turn root type=1 in Cursor bubbles). */
  userText?: string
  status: NodeStatus
  startedAt?: string
  endedAt?: string
  durationMs?: number
  steps: Step[]
}

export interface Session {
  id: string
  name: string
  subtitle?: string
  startedAt: string
  endedAt?: string
  status: NodeStatus
  source: 'cursor-ide'
  modelName?: string
  workspaceLabel?: string
  turns: Turn[]
}

export type GraphLevel =
  | { kind: 'session' }
  | { kind: 'turn'; turnId: string }
  | { kind: 'step'; turnId: string; stepId: string }

export interface BreadcrumbItem {
  label: string
  level: GraphLevel
}
