import type { NodeStatus } from '../model/types'
import { statusLabel } from '../lib/format'

export function StatusPill({ status }: { status: NodeStatus }) {
  return <span className={`ao-status ao-status--${status}`}>{statusLabel(status)}</span>
}
