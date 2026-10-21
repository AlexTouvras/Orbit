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

export function SheetGate({ term, detail, warm }: { term: string; detail: string; warm: boolean }) {
  return (
    <div className={`mt-1 border-y-2 py-1.5 ${warm ? "border-amber-200/55" : "border-white/25"}`}>
      <p className={`font-mono text-[0.65rem] uppercase tracking-[0.14em] ${toneOf(warm)}`}>{term}</p>
      <p className="mt-1 text-sm leading-snug text-white">{detail}</p>
    </div>
  );
}

function SheetFigure({ figure, warm }: { figure: HandbookFigure; warm: boolean }) {
  const rule = ruleOf(warm);
  const tone = toneOf(warm);
  const fields = figure.steps.filter((step) => !step.gate);
  const gate = figure.steps.find((step) => step.gate);
  const label = `w-[6.75rem] py-1 pr-3 align-baseline text-left font-mono text-[0.65rem] uppercase tracking-[0.12em] sm:w-40 sm:py-1.5 ${tone}`;
  return (
    <figure>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {fields.map((step, index) => {
            const next = fields[index + 1];
            const previous = fields[index - 1];
            const pairStart = Boolean(step.pair && next?.pair);
            const pairEnd = Boolean(step.pair && previous?.pair);
            const edge = step.emphasis
              ? `border-y-2 ${warm ? "border-amber-200/55" : "border-white/30"}`
              : pairStart
                ? `border-t-2 border-b ${warm ? "border-t-amber-200/45 border-b-white/10" : "border-t-white/30 border-b-white/10"}`
                : pairEnd
                  ? `border-b-2 ${warm ? "border-amber-200/45" : "border-white/30"}`
                  : `border-b ${rule} ${index === 0 ? "border-t" : ""}`;
            return (
              <tr key={step.term} className={edge}>
                <th scope="row" className={label}>
                  {step.term}
                </th>
                <td className={`py-1 align-baseline leading-snug sm:py-1.5 ${step.emphasis ? "text-white" : "text-slate-200"}`}>
                  {step.detail}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {gate ? <SheetGate term={gate.term} detail={gate.detail} warm={warm} /> : null}
      {figure.caption ? <figcaption className="mt-2 text-sm leading-relaxed text-slate-400">{figure.caption}</figcaption> : null}
    </figure>
  );
}

function PathFigure({ figure, warm }: { figure: HandbookFigure; warm: boolean }) {
  const tone = toneOf(warm);
  const line = warm ? "bg-amber-200/50" : "bg-white/30";
  const node = warm ? "border-amber-200 bg-amber-200" : "border-white/70 bg-white/70";
  return (
    <figure>
      <ol className="m-0 list-none lg:grid lg:grid-cols-5">
        {figure.steps.map((step, index) => {
          const last = index === figure.steps.length - 1;
          return (
            <li key={step.term} className="relative flex gap-3 pb-3 last:pb-0 lg:block lg:pr-3 lg:pb-0 lg:last:pr-0">
              <span className="flex w-3 shrink-0 flex-col items-center lg:hidden" aria-hidden="true">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${node}`} />
                {last ? null : <span className={`mt-1 w-px flex-1 ${line}`} />}
              </span>
              <span className="relative mb-2 hidden h-2 w-full items-center lg:flex" aria-hidden="true">
                <span className={`relative z-10 h-1.5 w-1.5 shrink-0 rounded-full ${node}`} />
                {last ? null : <span className={`absolute top-1 left-1.5 -right-3 h-px ${line}`} />}
              </span>
              <div className="min-w-0 lg:pr-2">
                <p className={`font-mono text-[0.65rem] uppercase leading-snug tracking-[0.08em] lg:text-[0.6rem] lg:tracking-[0.05em] ${tone}`}>
                  {step.term}
                </p>
                {step.detail ? <p className="mt-1 text-sm leading-snug text-slate-200">{step.detail}</p> : null}
              </div>
            </li>
          );
        })}
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

const usesTable = "m-0 w-full table-fixed border-collapse text-left text-sm";

function UsesColumns() {
  return (
    <colgroup>
      <col style={{ width: "7.25rem" }} />
      <col />
      <col />
    </colgroup>
  );
}

function usesHeadClass(warm: boolean) {
  return `py-1.5 pr-2 text-left align-bottom font-mono text-[0.56rem] uppercase leading-snug tracking-[0.03em] whitespace-nowrap sm:whitespace-normal sm:py-2 sm:pr-3 sm:text-[0.65rem] sm:tracking-[0.12em] ${toneOf(warm)}`;
}

function usesLabelClass(warm: boolean) {
  return `py-1.5 pr-2 text-left align-top font-mono text-[0.62rem] uppercase leading-snug tracking-[0.08em] sm:py-2 sm:pr-3 sm:text-[0.65rem] sm:tracking-[0.12em] ${toneOf(warm)}`;
}

const usesCellClass = "py-1.5 pr-2 align-top text-sm leading-snug text-slate-200 sm:py-2 sm:pr-3";

export function UsesHead({ figure, warm }: { figure: HandbookFigure; warm: boolean }) {
  const head = figure.head ?? [];
  return (
    <table className={usesTable}>
      <UsesColumns />
      <thead>
        <tr className={`border-b ${ruleOf(warm)}`}>
          {head.map((cell) => (
            <th key={cell} scope="col" className={usesHeadClass(warm)}>
              {cell}
            </th>
          ))}
        </tr>
      </thead>
    </table>
  );
}

export function UsesRow({
  row,
  warm,
}: {
  row: { label: string; cells: string[] };
  warm: boolean;
}) {
  return (
    <table className={usesTable}>
      <UsesColumns />
      <tbody>
        <tr className={`border-b ${ruleOf(warm)}`}>
          <th scope="row" className={usesLabelClass(warm)}>
            {row.label}
          </th>
          {row.cells.map((cell, index) => (
            <td key={`${row.label}-${index}`} className={usesCellClass}>
              {cell}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function UsesFigure({ figure, warm }: { figure: HandbookFigure; warm: boolean }) {
  const rows = figure.rows ?? [];
  return (
    <figure>
      <UsesHead figure={figure} warm={warm} />
      {rows.map((row) => (
        <UsesRow key={row.label} row={row} warm={warm} />
      ))}
      {figure.caption ? <figcaption className="mt-2 text-sm leading-relaxed text-slate-400">{figure.caption}</figcaption> : null}
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

