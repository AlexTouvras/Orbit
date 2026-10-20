import type { ReactNode } from "react";
import type { HandbookFigure, HandbookMark } from "@/content/handbooks";
import { LoopPlate, PyramidPlate, RecoveryPlate, ScenePlate } from "@/components/handbooks/HandbookPlates";
import { IconPaths } from "@/components/handbooks/icon-paths";

export { IconPaths } from "@/components/handbooks/icon-paths";


export function HandbookFigureView({ figure, warm = false }: { figure: HandbookFigure; warm?: boolean }) {
  if (figure.kind === "pyramid") return <Framed figure={figure}><PyramidPlate figure={figure} /></Framed>;
  if (figure.kind === "loop") return <Framed figure={figure}><LoopPlate figure={figure} /></Framed>;
  if (figure.kind === "recovery") return <Framed figure={figure}><RecoveryPlate figure={figure} /></Framed>;
  if (figure.kind === "scene") return <Framed figure={figure}><ScenePlate figure={figure} /></Framed>;
  if (figure.kind === "signals") return <SignalsFigure figure={figure} />;
  if (figure.kind === "compare") return <CompareFigure figure={figure} />;
  if (figure.kind === "curve") return <CurveFigure figure={figure} />;
  if (figure.kind === "reading") return <ReadingFigure figure={figure} warm={warm} />;
  if (figure.kind === "uses") return <UsesFigure figure={figure} warm={warm} />;
  if (figure.kind === "sheet") return <SheetFigure figure={figure} warm={warm} />;
  if (figure.plain) return <PathFigure figure={figure} warm={warm} />;
  return <FlowFigure figure={figure} />;
}

function Framed({ figure, children }: { figure: HandbookFigure; children: ReactNode }) {
  return (
    <figure>
      <Plate>
        {children}
        <Caption>{figure.caption}</Caption>
      </Plate>
    </figure>
  );
}

function Plate({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#070d18] shadow-[0_0_36px_-18px_rgba(34,211,238,0.65)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 8% 20%, rgba(255,255,255,0.55), transparent), radial-gradient(1px 1px at 80% 30%, rgba(103,232,249,0.7), transparent), radial-gradient(90% 80% at 50% 120%, rgba(34,211,238,0.12), transparent 60%)",
        }}
      />
      <div className="relative p-4 sm:p-6">{children}</div>
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <figcaption className="mt-4 text-sm leading-relaxed text-slate-400">{children}</figcaption>;
}

function MarkGlyph({ name, tone = "cyan" }: { name?: HandbookMark; tone?: "cyan" | "red" | "ok" | "pass" | "ink" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <IconPaths name={name} tone={tone} />
    </svg>
  );
}

function Node({
  index,
  mark,
  tone = "cyan",
}: {
  index: number;
  mark?: HandbookMark;
  tone?: "cyan" | "red" | "ok";
}) {
  const ring =
    tone === "red"
      ? "border-rose-300/80 shadow-[0_0_18px_rgba(251,113,133,0.55)]"
      : tone === "ok"
        ? "border-teal-200/80 shadow-[0_0_18px_rgba(94,234,212,0.45)]"
        : "border-cyan-200/80 shadow-[0_0_18px_rgba(34,211,238,0.5)]";
  return (
    <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-[#07111c] ${ring}`}>
      {mark ? <MarkGlyph name={mark} tone={tone} /> : <span className="font-mono text-sm text-white">{index + 1}</span>}
      {mark ? (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-[#050814] font-mono text-[0.6rem] text-white">
          {index + 1}
        </span>
      ) : null}
    </span>
  );
}

function SignalsFigure({ figure }: { figure: HandbookFigure }) {
  return (
    <figure>
      <Plate>
        <ul className="list-none divide-y divide-white/10">
          {figure.steps.map((step) => (
            <li key={step.term} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-200/50 bg-[#07111c] shadow-[0_0_16px_rgba(34,211,238,0.35)]">
                <MarkGlyph name={step.mark} />
              </span>
              <span>
                <span className="block text-sm font-medium text-white">{step.term}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-300">{step.detail}</span>
              </span>
            </li>
          ))}
        </ul>
        <Caption>{figure.caption}</Caption>
      </Plate>
    </figure>
  );
}

/** Fowler's shape: pain stays low, then rises. No ticks and no amounts. */
const PAIN_CURVE = (() => {
  const left = 34;
  const right = 276;
  const top = 16;
  const bottom = 96;
  const k = 3.15;
  const steps = 40;
  const span = Math.exp(k) - 1;
  let d = "";
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = left + (right - left) * t;
    const y = bottom - ((Math.exp(k * t) - 1) / span) * (bottom - top);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
})();

function CurveFigure({ figure }: { figure: HandbookFigure }) {
  const yLabel = figure.axes?.y ?? "Pain";
  const xLabel = figure.axes?.x ?? "Time between integrations";
  return (
    <figure>
      <div className="mt-1 overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#070d18]">
        <div className="px-3 pt-2 pb-3">
          <div className="relative">
            <p className="absolute top-0 left-7 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cyan-200">{yLabel}</p>
            <svg viewBox="0 0 320 118" className="mx-auto block h-auto w-full max-w-md" aria-hidden>
              <defs>
                <marker id="pain-axis-arrow" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="8" refY="5" orient="auto">
                  <path d="M0 0 L10 5 L0 10 Z" fill="#a5f3fc" />
                </marker>
              </defs>
              <line x1="16" y1="104" x2="16" y2="8" stroke="#a5f3fc" strokeOpacity="0.8" strokeWidth="1.5" markerEnd="url(#pain-axis-arrow)" />
              <line x1="16" y1="104" x2="304" y2="104" stroke="#a5f3fc" strokeOpacity="0.8" strokeWidth="1.5" markerEnd="url(#pain-axis-arrow)" />
              <path d={PAIN_CURVE} fill="none" stroke="#e2e8f0" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-1 text-center font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cyan-200">{xLabel}</p>
          <figcaption className="mt-2 text-sm leading-relaxed text-slate-400">{figure.caption}</figcaption>
        </div>
      </div>
    </figure>
  );
}

function CompareFigure({ figure }: { figure: HandbookFigure }) {
  const columns = figure.columns ?? [];
  return (
    <figure>
      <Plate>
        <div className="grid gap-3 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.term} className="rounded-xl border border-cyan-200/25 bg-[#050814]/80 p-3">
              <h3 className="font-display text-base font-semibold text-white">{column.term}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">{column.detail}</p>
              <ul className="mt-3 space-y-2">
                {column.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-slate-200">
                    <MarkGlyph name="check" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Caption>{figure.caption}</Caption>
      </Plate>
    </figure>
  );
}

function toneOf(warm: boolean) {
  return warm ? "text-amber-200" : "text-cyan-200";
}

function ruleOf(warm: boolean) {
  return warm ? "border-amber-200/25" : "border-white/10";
}

export function UseRow({
  label,
  cells,
  head,
  warm,
  first,
}: {
  label: string;
  cells: string[];
  head: string[];
  warm: boolean;
  first: boolean;
}) {
  return (
    <div className={`border-b py-2 ${ruleOf(warm)} ${first ? "border-t" : ""}`}>
      <p className={`font-mono text-[0.65rem] uppercase tracking-[0.14em] ${toneOf(warm)}`}>{label}</p>
      {cells.map((cell, index) => (
        <p key={`${label}-${index}`} className="mt-1 text-sm leading-snug text-slate-200">
          <span className="text-slate-500">{head[index + 1]}. </span>
          {cell}
        </p>
      ))}
    </div>
  );
}

export function SheetRow({
  term,
  detail,
  warm,
  first,
}: {
  term: string;
  detail: string;
  warm: boolean;
  first: boolean;
}) {
  return (
    <div
      className={`grid gap-0.5 border-b py-2 sm:grid-cols-[10.5rem_1fr] sm:items-baseline sm:gap-4 ${ruleOf(warm)} ${first ? "border-t" : ""}`}
    >
      <p className={`font-mono text-[0.65rem] uppercase tracking-[0.14em] ${toneOf(warm)}`}>{term}</p>
      <p className="text-sm leading-snug text-slate-200">{detail}</p>
    </div>
  );
}

function SheetFigure({ figure, warm }: { figure: HandbookFigure; warm: boolean }) {
  return (
    <figure>
      {figure.steps.map((step, index) => (
        <SheetRow key={step.term} term={step.term} detail={step.detail} warm={warm} first={index === 0} />
      ))}
      <figcaption className="mt-2 text-sm leading-relaxed text-slate-400">{figure.caption}</figcaption>
    </figure>
  );
}

function PathFigure({ figure, warm }: { figure: HandbookFigure; warm: boolean }) {
  const rule = ruleOf(warm);
  return (
    <figure>
      <ol className={`list-none border-y ${rule}`}>
        {figure.steps.map((step, index) => (
          <li key={step.term} className={`grid grid-cols-[1.25rem_1fr] gap-3 border-b py-2 last:border-b-0 ${rule}`}>
            <span className={`font-mono text-sm tabular-nums ${toneOf(warm)}`}>{index + 1}</span>
            <span className="min-w-0">
              <span className={`block font-mono text-[0.65rem] uppercase tracking-[0.14em] ${toneOf(warm)}`}>{step.term}</span>
              <span className="mt-0.5 block text-sm leading-snug text-slate-200">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="mt-2 text-sm leading-relaxed text-slate-400">{figure.caption}</figcaption>
    </figure>
  );
}

function ReadingFigure({ figure, warm }: { figure: HandbookFigure; warm: boolean }) {
  const tone = toneOf(warm);
  const rule = ruleOf(warm);
  const head = figure.head ?? [];
  const rows = figure.rows ?? [];
  return (
    <figure>
      {figure.note ? <p className="pb-2 text-sm leading-relaxed text-slate-400">{figure.note}</p> : null}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className={`border-b ${rule}`}>
            {head.map((cell, index) => (
              <th
                key={`${cell}-${index}`}
                scope="col"
                className={`py-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] ${tone} ${index === 0 ? "pr-3 text-left" : "pl-2 text-right"}`}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={`border-b ${rule}`}>
              <th scope="row" className="py-2 pr-3 text-left font-medium text-white">
                {row.label}
              </th>
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.label}-${index}`}
                  className={`py-2 pl-2 text-right whitespace-nowrap tabular-nums ${index === row.cells.length - 1 ? tone : "text-slate-200"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="mt-2 text-sm leading-relaxed text-slate-400">{figure.caption}</figcaption>
    </figure>
  );
}

function UsesFigure({ figure, warm }: { figure: HandbookFigure; warm: boolean }) {
  const tone = toneOf(warm);
  const rule = ruleOf(warm);
  const head = figure.head ?? [];
  const rows = figure.rows ?? [];
  return (
    <figure>
      <div className="sm:hidden">
        <ul className={`list-none divide-y border-y ${rule}`}>
          {rows.map((row) => (
            <li key={row.label} className="py-2">
              <p className={`font-mono text-[0.65rem] uppercase tracking-[0.14em] ${tone}`}>{row.label}</p>
              {row.cells.map((cell, index) => (
                <p key={`${row.label}-${index}`} className="mt-1 text-sm leading-snug text-slate-200">
                  <span className="text-slate-500">{head[index + 1]}. </span>
                  {cell}
                </p>
              ))}
            </li>
          ))}
        </ul>
      </div>
      <table className="hidden w-full border-collapse text-left text-sm sm:table">
        <thead>
          <tr className={`border-b ${rule}`}>
            {head.map((cell) => (
              <th key={cell} scope="col" className={`py-2 pr-3 align-bottom font-mono text-[0.65rem] uppercase tracking-[0.14em] ${tone}`}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={`border-b ${rule}`}>
              <th scope="row" className={`py-2 pr-3 align-top font-mono text-[0.65rem] uppercase tracking-[0.14em] ${tone}`}>
                {row.label}
              </th>
              {row.cells.map((cell, index) => (
                <td key={`${row.label}-${index}`} className="py-2 pr-3 align-top text-sm leading-snug text-slate-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="mt-2 text-sm leading-relaxed text-slate-400">{figure.caption}</figcaption>
    </figure>
  );
}

function FlowFigure({ figure }: { figure: HandbookFigure }) {
  return (
    <figure>
      <Plate>
        <ul className="list-none">
          {figure.steps.map((step, index) => {
            const last = index === figure.steps.length - 1;
            return (
              <li key={step.term} className="relative flex gap-4 pb-5 last:pb-0">
                {last ? null : (
                  <span aria-hidden className="absolute top-12 bottom-0 left-6 w-px -translate-x-1/2 bg-cyan-200/45" />
                )}
                <Node index={index} mark={step.mark} />
                <span className="min-w-0 pt-1">
                  <span className="block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cyan-200">{step.term}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-200">{step.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <Caption>{figure.caption}</Caption>
      </Plate>
    </figure>
  );
}

