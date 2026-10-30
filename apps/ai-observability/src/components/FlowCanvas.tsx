import { useCallback, useEffect, useMemo } from 'react'
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AoFlowNode } from './AoFlowNode'
import type { AoNode } from '../lib/graph'

const nodeTypes = { aoNode: AoFlowNode }

type Props = {
  nodes: AoNode[]
  edges: Edge[]
  levelKey: string
}

function FitViewOnLevel({ levelKey }: { levelKey: string }) {
  const { fitView } = useReactFlow()
  useEffect(() => {
    const t = window.setTimeout(() => {
      fitView({ padding: 0.28, duration: 280 })
    }, 40)
    return () => window.clearTimeout(t)
  }, [fitView, levelKey])
  return null
}

function CanvasInner({ nodes, edges, levelKey }: Props) {
  const memoNodes = useMemo(() => nodes, [nodes])
  const memoEdges = useMemo(() => edges, [edges])

  const onNodeClick = useCallback<NodeMouseHandler<AoNode>>((_, node) => {
    node.data.onOpen()
  }, [])

  return (
    <ReactFlow
      nodes={memoNodes}
      edges={memoEdges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      zoomOnScroll
      minZoom={0.35}
      maxZoom={1.6}
      proOptions={{ hideAttribution: true }}
      className="ao-flow"
    >
      <Background gap={22} size={1} color="var(--ao-grid)" />
      <Controls showInteractive={false} />
      <FitViewOnLevel levelKey={levelKey} />
    </ReactFlow>
  )
}

export function FlowCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}
