import type { ReactNode } from 'react'
import type { Step } from '../model/types'
import { formatDuration, formatWhen, kindLabel, prettyJson } from '../lib/format'
import { StatusPill } from './StatusPill'

type Props = {
  step: Step
  onClose: () => void
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  if (!children) return null
  return (
    <section className="ao-leaf__block">
      <h3>{label}</h3>
      {children}
    </section>
  )
}

export function LeafPanel({ step, onClose }: Props) {
  const leaf = step.leaf

  return (
    <aside className="ao-leaf" aria-label="Leaf detail">
      <header className="ao-leaf__head">
        <div>
          <p className="ao-leaf__eyebrow">{kindLabel(step.kind)} · leaf</p>
          <h2>{step.name}</h2>
        </div>
        <button type="button" className="ao-btn ao-btn--ghost" onClick={onClose}>
          Close
        </button>
      </header>

      <div className="ao-leaf__row">
        <StatusPill status={step.status} />
        <span>{formatDuration(step.durationMs)}</span>
        <span>{formatWhen(step.startedAt)}</span>
      </div>

      {step.bubblePath ? (
        <p className="ao-leaf__path">
          <code>{step.bubblePath}</code>
        </p>
      ) : null}

      <Block label="Prompt">
        {leaf?.prompt ? <pre className="ao-pre">{leaf.prompt}</pre> : null}
      </Block>
      <Block label="Thinking">
        {leaf?.thinking ? <pre className="ao-pre">{leaf.thinking}</pre> : null}
      </Block>
      <Block label="Completion">
        {leaf?.completion ? <pre className="ao-pre">{leaf.completion}</pre> : null}
      </Block>
      <Block label="Tool args">
        {leaf?.toolArgs != null ? (
          <pre className="ao-pre">{prettyJson(leaf.toolArgs)}</pre>
        ) : null}
      </Block>
      <Block label="Tool result">
        {leaf?.toolResult != null ? (
          <pre className="ao-pre">{prettyJson(leaf.toolResult)}</pre>
        ) : null}
      </Block>
      <Block label="Error">
        {leaf?.error ? (
          <pre className="ao-pre ao-pre--error">
            {leaf.error.message}
            {leaf.error.detail ? `\n\n${leaf.error.detail}` : ''}
          </pre>
        ) : null}
      </Block>
      <Block label="Attributes">
        {leaf?.attrs ? <pre className="ao-pre">{prettyJson(leaf.attrs)}</pre> : null}
      </Block>
    </aside>
  )
}
