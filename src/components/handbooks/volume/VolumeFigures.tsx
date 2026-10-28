import Image from "next/image";
import type { ReactNode } from "react";
import type {
  HandbookFigure,
  HandbookFigureStep,
  HandbookPicture,
} from "@/content/handbooks";
import { BookLink } from "@/components/handbooks/volume/BookLink";
import { VOLUME_PICTURE_SIZE } from "@/components/handbooks/volume/catalog";

export { VOLUME_FIGURE_KINDS, VOLUME_PICTURE_SIZE } from "@/components/handbooks/volume/catalog";

export function VolumeFigure({
  figure,
  n,
  fallback,
}: {
  figure: HandbookFigure;
  n: number;
  fallback: string;
}) {
  const caption = figure.caption.trim() || fallback;
  return (
    <FigureFrame n={n} caption={caption}>
      {figure.note ? <p className="book-caption mb-4">{figure.note}</p> : null}
      <FigureBody figure={figure} />
    </FigureFrame>
  );
}

export function VolumeLines({
  lines,
  n,
  caption,
}: {
  lines: { term: string; detail: string }[];
  n: number;
  caption: string;
}) {
  return (
    <FigureFrame n={n} caption={caption} wide={false}>
      <dl>
        {lines.map((line) => (
          <div key={line.term} className="grid gap-1 border-t border-[var(--book-rule)] py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
            <dt className="font-medium text-[var(--book-ink)]">{line.term}</dt>
            <dd className="text-[1.02rem] leading-relaxed text-[var(--book-ink)]">{line.detail}</dd>
          </div>
        ))}
      </dl>
    </FigureFrame>
  );
}

export function VolumePicture({ picture, n }: { picture: HandbookPicture; n: number }) {
  const size = VOLUME_PICTURE_SIZE[picture.src] ?? { w: 1280, h: 720 };
  const portrait = size.h > size.w;
  return (
    <FigureFrame n={n} caption={picture.alt}>
      <Image
        src={picture.src}
        alt=""
        width={size.w}
        height={size.h}
        sizes={portrait ? "22rem" : "(min-width: 1024px) 52rem, 100vw"}
        className={
          portrait
            ? "mx-auto h-auto w-full max-w-[22rem] border border-[var(--book-rule)]"
            : "h-auto w-full border border-[var(--book-rule)]"
        }
      />
    </FigureFrame>
  );
}

export function CoverSheets() {
  return (
    <figure>
      <svg viewBox="0 0 720 480" className="h-auto w-full" aria-hidden="true">
        <rect width="720" height="480" fill="#ebe4d6" />
        <rect x="292" y="92" width="300" height="320" fill="#1b1814" />
        <line x1="292" y1="92" x2="592" y2="92" stroke="#8a7b6a" strokeWidth="2" />
        <rect x="86" y="46" width="292" height="368" fill="#f7f3eb" stroke="#1b1814" strokeWidth="1.25" />
        <line x1="86" y1="46" x2="378" y2="46" stroke="#7c3822" strokeWidth="7" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
          <line
            key={row}
            x1="114"
            x2="350"
            y1={104 + row * 34}
            y2={104 + row * 34}
            stroke="#c9bdae"
            strokeWidth="1"
          />
        ))}
      </svg>
      <figcaption className="book-caption mt-3 max-w-[40rem]">
        One lit sheet and one sheet left dark. The bright edge is the sheet that can go out.
      </figcaption>
    </figure>
  );
}

/** Exclusive opening leaf for Models that stay in the decision. */
export function CoverModels() {
  const src = "/handbook-art/models-that-stay-in-the-decision/cover.jpg";
  const size = VOLUME_PICTURE_SIZE[src] ?? { w: 864, h: 1152 };
  return (
    <figure>
      <div className="overflow-hidden border border-[var(--book-rule)] bg-[#04110c]">
        <Image
          src={src}
          alt=""
          width={size.w}
          height={size.h}
          priority
          sizes="(min-width: 1024px) 28rem, min(100vw, 28rem)"
          className="mx-auto h-auto w-full max-w-[28rem]"
        />
      </div>
      <figcaption className="book-caption mt-3 max-w-[40rem]">
        Four arcs on one spine. Watch returns as a new version, not a silent retrain.
      </figcaption>
    </figure>
  );
}

/** Alias kept for the volume reader import. */
export function CoverPipeline() {
  return <CoverModels />;
}

function FigureFrame({
  n,
  caption,
  wide = true,
  children,
}: {
  n: number;
  caption: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <figure className={wide ? "book-spread my-8" : "book-measure my-8"}>
      {children}
      <figcaption className="book-caption mt-3 max-w-[40rem]">
        <span className="font-medium text-[var(--book-ink)]">Figure {n}. </span>
        {caption}
      </figcaption>
    </figure>
  );
}

function ScrollTable({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`book-scroll ${className}`} data-book-scroll tabIndex={0}>
      {children}
    </div>
  );
}

function FigureBody({ figure }: { figure: HandbookFigure }) {
  if (figure.kind === "sheet") return <SheetFigure figure={figure} />;
  if (figure.kind === "reading") return <ReadingFigure figure={figure} />;
  if (figure.kind === "uses") return <UsesFigure figure={figure} />;
  if (figure.kind === "matrix") return <MatrixFigure figure={figure} />;
  if (figure.kind === "panels") return <PanelsFigure figure={figure} />;
  if (figure.kind === "tree") return <TreeFigure figure={figure} />;
  if (figure.kind === "compare") return <CompareFigure figure={figure} />;
  if (figure.kind === "pyramid") return <PyramidFigure figure={figure} />;
  if (figure.kind === "curve") return <CurveSketch figure={figure} />;
  if (figure.kind === "pipeline") return <PipelineFigure figure={figure} />;
  if (figure.kind === "flow" || figure.steps.length > 0) return <FlowFigure figure={figure} />;
  if (figure.columns?.length) return <CompareFigure figure={figure} />;
  if (figure.rows?.length) return <UsesFigure figure={figure} />;
  return null;
}

/** Wide base, narrow top. The first step is the base and stays first for reading. */
function PyramidFigure({ figure }: { figure: HandbookFigure }) {
  const span = figure.steps.length > 1 ? 56 / (figure.steps.length - 1) : 0;
  return (
    <div>
      <ol className="mx-auto flex max-w-[40rem] flex-col-reverse">
        {figure.steps.map((step, index) => (
          <li
            key={step.term}
            className="mx-auto border-x border-b border-[var(--book-ink)] px-4 py-3 last:border-t"
            style={{ width: `${100 - index * span}%` }}
          >
            <p className="font-medium">{step.term}</p>
            <p className="mt-1 leading-relaxed">{step.detail}</p>
          </li>
        ))}
      </ol>
      {figure.columns?.length ? (
        <div className="mt-8">
          <CompareFigure figure={figure} />
        </div>
      ) : null}
    </div>
  );
}

/** A sketch. It states no amount. */
function CurveSketch({ figure }: { figure: HandbookFigure }) {
  const yLabel = figure.axes?.y ?? "Pain";
  const xLabel = figure.axes?.x ?? "Time between integrations";
  return (
    <div>
      <p className="book-kicker">{yLabel}</p>
      <svg viewBox="0 0 320 128" className="mt-2 h-auto w-full max-w-[28rem]" role="img" aria-label={`${yLabel} against ${xLabel}. A sketch, not a measurement.`}>
        <line x1="28" y1="108" x2="28" y2="12" stroke="#1b1814" strokeWidth="1.5" />
        <line x1="28" y1="108" x2="304" y2="108" stroke="#1b1814" strokeWidth="1.5" />
        <path d="M28 100 C 90 98, 150 90, 190 68 S 250 22, 292 16" fill="none" stroke="#7c3822" strokeWidth="2.25" strokeLinecap="round" />
      </svg>
      <p className="book-kicker mt-2">{xLabel}</p>
    </div>
  );
}

function SheetFigure({ figure }: { figure: HandbookFigure }) {
  const fields = figure.steps.filter((step) => !step.gate);
  const gate = figure.steps.find((step) => step.gate);
  return (
    <div>
      <dl>
        {fields.map((step) => (
          <div key={step.term} className="grid gap-1 border-t border-[var(--book-rule)] py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
            <dt className="font-medium">{step.term}</dt>
            <dd className="leading-relaxed">{step.detail}</dd>
          </div>
        ))}
      </dl>
      {gate ? (
        <div className="grid gap-1 border-y-2 border-[var(--book-ink)] py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
          <p className="font-medium text-[var(--book-accent)]">{gate.term}</p>
          <p className="leading-relaxed">{gate.detail}</p>
        </div>
      ) : null}
    </div>
  );
}

function ReadingFigure({ figure }: { figure: HandbookFigure }) {
  const head = figure.head ?? [];
  const colHeads = head.slice(1);
  const rows = figure.rows ?? [];
  return (
    <>
      <div className="md:hidden">
        {rows.map((row) => (
          <div key={row.label} className="border-t border-[var(--book-rule)] py-4">
            <p className="font-medium">{row.label}</p>
            {row.cells.map((cell, index) => (
              <p key={`${row.label}-${index}`} className="mt-3 leading-relaxed">
                {colHeads[index] ? <span className="book-kicker mb-1 block">{colHeads[index]}</span> : null}
                <span className="tabular-nums">{cell}</span>
              </p>
            ))}
          </div>
        ))}
      </div>
      <ScrollTable className="hidden md:block">
    <table className="w-full min-w-[22rem] border-collapse text-left text-[1rem]">
      <thead>
        <tr className="border-b-2 border-[var(--book-ink)]">
          {head.map((cell, index) => (
            <th
              key={`${cell}-${index}`}
              scope="col"
              className={`py-2 font-medium ${index === 0 ? "pr-4 text-left" : "px-3 text-right"}`}
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-[var(--book-rule)]">
            <th scope="row" className="py-3 pr-4 text-left font-medium">
              {row.label}
            </th>
            {row.cells.map((cell, index) => (
              <td key={`${row.label}-${index}`} className="px-3 py-3 text-right whitespace-nowrap tabular-nums">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
      </ScrollTable>
    </>
  );
}

function UsesFigure({ figure }: { figure: HandbookFigure }) {
  const head = figure.head ?? [];
  const colHeads = head.slice(1);
  const rows = figure.rows ?? [];
  return (
    <>
      <div className="md:hidden">
        {rows.map((row) => (
          <div key={row.label} className="border-t border-[var(--book-rule)] py-4">
            <p className="font-medium">
              {row.href ? <BookLink href={row.href}>{row.label}</BookLink> : row.label}
            </p>
            {row.cells.map((cell, index) => (
              <p key={`${row.label}-${index}`} className="mt-3 leading-relaxed">
                {colHeads[index] ? <span className="book-kicker mb-1 block">{colHeads[index]}</span> : null}
                {cell}
              </p>
            ))}
          </div>
        ))}
      </div>
      <ScrollTable className="hidden md:block">
      <table className="w-full min-w-[36rem] border-collapse text-left text-[0.98rem]">
        <thead>
          <tr className="border-b-2 border-[var(--book-ink)]">
            {head.map((cell) => (
              <th key={cell} scope="col" className="py-2 pr-4 align-bottom font-medium">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-[var(--book-rule)] align-top">
              <th scope="row" className="py-3 pr-4 text-left font-medium">
                {row.href ? <BookLink href={row.href}>{row.label}</BookLink> : row.label}
              </th>
              {row.cells.map((cell, index) => (
                <td key={`${row.label}-${index}`} className="py-3 pr-4 leading-relaxed">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </ScrollTable>
    </>
  );
}

function MatrixFigure({ figure }: { figure: HandbookFigure }) {
  const options = (figure.head ?? []).slice(1);
  const rows = figure.rows ?? [];
  return (
    <>
      <div className="md:hidden">
        {rows.map((row) => (
          <div key={row.label} className="border-t border-[var(--book-rule)] py-4">
            <p className="font-medium">{row.label}</p>
            {row.cells.map((cell, index) => (
              <p key={`${row.label}-${index}`} className="mt-3 leading-relaxed">
                {options[index] ? <span className="book-kicker mb-1 block">{options[index]}</span> : null}
                {cell}
              </p>
            ))}
          </div>
        ))}
      </div>
      <ScrollTable className="hidden md:block">
      <table className="w-full min-w-[44rem] border-collapse text-left text-[0.98rem]">
        <thead>
          <tr className="border-b-2 border-[var(--book-ink)]">
            <th scope="col" className="w-[8.5rem] py-2 pr-3 text-left font-medium">
              {(figure.head ?? [])[0] ?? ""}
            </th>
            {options.map((option) => (
              <th key={option} scope="col" className="px-3 py-2 text-left font-medium">
                {option}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-[var(--book-rule)] align-top">
              <th scope="row" className="py-3 pr-3 text-left font-medium">
                {row.label}
              </th>
              {row.cells.map((cell, index) => (
                <td key={`${row.label}-${index}`} className="px-3 py-3 leading-relaxed">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </ScrollTable>
    </>
  );
}

function PanelsFigure({ figure }: { figure: HandbookFigure }) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {figure.steps.map((step) => (
        <div key={step.term} className="border-t-2 border-[var(--book-ink)] pt-3">
          <p className="font-medium">{step.term}</p>
          <PanelBars spine={step.spine} />
          <p className="mt-3 text-[0.98rem] leading-relaxed">{step.detail}</p>
        </div>
      ))}
    </div>
  );
}

function PanelBars({ spine }: { spine?: string }) {
  const pair = barPair(spine);
  if (!pair) return null;
  const [left, right] = pair;
  const max = Math.max(left, right, 0.001);
  const h = (value: number) => Math.max(8, Math.round((value / max) * 72));
  return (
    <div className="mt-4 flex items-end gap-4" aria-hidden="true">
      <div>
        <div className="w-8 bg-[var(--book-ink)]" style={{ height: h(left) }} />
        <p className="mt-1 text-[0.85rem] tabular-nums">{formatBar(left)}</p>
      </div>
      <div>
        <div className="w-8 bg-[var(--book-ink)] opacity-45" style={{ height: h(right) }} />
        <p className="mt-1 text-[0.85rem] tabular-nums">{formatBar(right)}</p>
      </div>
    </div>
  );
}

function barPair(spine?: string): [number, number] | null {
  if (!spine) return null;
  const parts = spine.split(",").map((part) => Number(part.trim()));
  if (parts.length < 2 || parts.some((value) => !Number.isFinite(value) || value < 0)) return null;
  return [parts[0], parts[1]];
}

function formatBar(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function TreeFigure({ figure }: { figure: HandbookFigure }) {
  return (
    <ol className="space-y-6">
      {figure.steps.map((step, index) => (
        <li key={step.term} className="border-l-2 border-[var(--book-ink)] pl-4">
          <p className="font-medium">
            <span className="mr-2 tabular-nums text-[var(--book-muted)]">{index + 1}</span>
            {step.term}
          </p>
          <p className="mt-1 leading-relaxed">{step.detail}</p>
          {step.spine ? <p className="mt-2 font-medium text-[var(--book-accent)]">{step.spine}</p> : null}
          {step.branches?.length ? (
            <ul
              className={`mt-3 grid gap-3 ${step.branches.length > 2 ? "sm:grid-cols-3" : step.branches.length === 2 ? "sm:grid-cols-2" : ""}`}
            >
              {step.branches.map((branch) => (
                <li key={branch.term} className="border-t border-[var(--book-accent)] pt-2">
                  <p className="font-medium text-[var(--book-accent)]">{branch.term}</p>
                  <p className="mt-1 leading-relaxed">{branch.detail}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function CompareFigure({ figure }: { figure: HandbookFigure }) {
  const columns = figure.columns ?? [];
  const layout =
    columns.length === 2 ? "sm:grid-cols-2" : columns.length >= 3 ? "lg:grid-cols-3" : "grid-cols-1";
  return (
    <div className={`grid gap-6 ${layout}`}>
      {columns.map((column) => (
        <div key={column.term} className="border-t-2 border-[var(--book-ink)] pt-3">
          <h3 className="font-display text-xl leading-tight font-semibold">{column.term}</h3>
          <p className="mt-2 leading-relaxed">{column.detail}</p>
          {column.points.length ? (
            <ul className="mt-3 space-y-2">
              {column.points.map((point) => (
                <li key={point} className="border-t border-[var(--book-rule)] pt-2 leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Stages on a spine, with optional return arcs named in step.spine. */
function PipelineFigure({ figure }: { figure: HandbookFigure }) {
  const steps = figure.steps;
  const count = Math.max(steps.length, 1);
  const width = 920;
  const height = 280;
  const left = 36;
  const right = width - 36;
  const boxW = Math.min(118, (right - left) / count - 16);
  const gap = (right - left - boxW * count) / Math.max(count - 1, 1);
  const y = 88;
  const centers = steps.map((_, index) => left + boxW / 2 + index * (boxW + gap));

  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="hidden h-auto w-full md:block"
        role="img"
        aria-label={figure.caption || "Pipeline"}
      >
        <rect width={width} height={height} fill="#f4f7f1" />
        <line
          x1={centers[0] ?? left}
          x2={centers[count - 1] ?? right}
          y1={y + 34}
          y2={y + 34}
          stroke="#1f2a1c"
          strokeWidth="2.5"
        />
        {steps.map((step, index) => {
          const cx = centers[index] ?? left;
          const x = cx - boxW / 2;
          return (
            <g key={step.term}>
              <rect
                x={x}
                y={y}
                width={boxW}
                height={68}
                rx="5"
                fill="#fff"
                stroke="#1f2a1c"
                strokeWidth="1.75"
              />
              <text
                x={cx}
                y={y + 28}
                textAnchor="middle"
                fill="#1f2a1c"
                fontFamily="Georgia, serif"
                fontSize="15"
                fontWeight="600"
              >
                {step.term}
              </text>
              <text
                x={cx}
                y={y + 50}
                textAnchor="middle"
                fill="#3d4638"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontSize="11"
              >
                {step.detail.length > 18 ? `${step.detail.slice(0, 16)}…` : step.detail}
              </text>
              {step.spine ? (
                <g>
                  <path
                    d={`M${cx} ${y + 68} C${cx} ${y + 120} ${centers[0]} ${y + 120} ${centers[0]} ${y + 68}`}
                    fill="none"
                    stroke="#0f6b5c"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                  />
                  <text
                    x={(cx + (centers[0] ?? cx)) / 2}
                    y={y + 138}
                    textAnchor="middle"
                    fill="#0f6b5c"
                    fontFamily="ui-monospace, monospace"
                    fontSize="11"
                  >
                    {step.spine}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
        {figure.note ? (
          <text
            x={width / 2}
            y={height - 24}
            textAnchor="middle"
            fill="#3d4638"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize="13"
          >
            {figure.note}
          </text>
        ) : null}
      </svg>
      <ol className="md:hidden">
        {steps.map((step, index) => (
          <FlowStep key={step.term} step={step} index={index} last={index === steps.length - 1} />
        ))}
      </ol>
    </>
  );
}

function FlowFigure({ figure }: { figure: HandbookFigure }) {
  const horizontal =
    figure.steps.length > 1 &&
    figure.steps.length <= 6 &&
    figure.steps.every((step) => step.detail.length <= 72 && !step.branches?.length);
  if (horizontal) {
    return (
      <>
        <ol className="hidden gap-0 md:flex">
          {figure.steps.map((step, index) => (
            <FlowStep key={step.term} step={step} index={index} last={index === figure.steps.length - 1} horizontal />
          ))}
        </ol>
        <ol className="md:hidden">
          {figure.steps.map((step, index) => (
            <FlowStep key={step.term} step={step} index={index} last={index === figure.steps.length - 1} />
          ))}
        </ol>
      </>
    );
  }
  return (
    <ol>
      {figure.steps.map((step, index) => (
        <FlowStep key={step.term} step={step} index={index} last={index === figure.steps.length - 1} />
      ))}
    </ol>
  );
}

function FlowStep({
  step,
  index,
  last,
  horizontal = false,
}: {
  step: HandbookFigureStep;
  index: number;
  last: boolean;
  horizontal?: boolean;
}) {
  if (horizontal) {
    return (
      <li className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center">
          <span className="grid h-8 w-8 shrink-0 place-items-center border border-[var(--book-ink)] text-sm tabular-nums">
            {index + 1}
          </span>
          {last ? null : <span className="h-px flex-1 bg-[var(--book-ink)]" aria-hidden="true" />}
        </div>
        <p className="mt-3 pr-4 font-medium">{step.term}</p>
        <p className="mt-1 pr-4 text-[0.95rem] leading-snug">{step.detail}</p>
      </li>
    );
  }
  return (
    <li className={`relative pl-12 ${last ? "" : "pb-5"}`}>
      {last ? null : (
        <span className="absolute top-8 bottom-0 left-4 w-px -translate-x-1/2 bg-[var(--book-ink)]" aria-hidden="true" />
      )}
      <span className="absolute top-0 left-0 grid h-8 w-8 place-items-center border border-[var(--book-ink)] bg-[var(--book-paper)] text-sm tabular-nums">
        {index + 1}
      </span>
      <p className="font-medium">{step.term}</p>
      {step.detail ? <p className="mt-1 leading-relaxed">{step.detail}</p> : null}
    </li>
  );
}
