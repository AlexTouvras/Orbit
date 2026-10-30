import { Handle, Position, type NodeProps } from '@xyflow/react'
import { type AoNode, type FlowNodeData } from '../lib/graph'
import { formatDuration, kindLabel } from '../lib/format'
import { StatusPill } from './StatusPill'

export type { AoNode, FlowNodeData }

export function AoFlowNode({ data }: NodeProps<AoNode>) {
  const kind = data.kind ?? 'turn'
  const kindText = kind === 'turn' ? 'turn' : kindLabel(kind)

  return (
    <button
      type="button"
      className={`ao-node ao-node--${data.status} ${data.drillable ? 'ao-node--drillable' : ''}`}
      onClick={data.onOpen}
      title={data.title}
    >
      <Handle type="target" position={Position.Top} className="ao-handle" />
      <div className="ao-node__top">
        <span className="ao-node__kind">{kindText}</span>
        <StatusPill status={data.status} />
      </div>
      <div className="ao-node__title">{data.title}</div>
      {data.subtitle ? <div className="ao-node__sub">{data.subtitle}</div> : null}
      <div className="ao-node__meta">
        <span>{formatDuration(data.durationMs)}</span>
        {data.drillable ? <span className="ao-node__chev" aria-hidden>↓</span> : null}
      </div>
      <Handle type="source" position={Position.Bottom} className="ao-handle" />
    </button>
  )
}
