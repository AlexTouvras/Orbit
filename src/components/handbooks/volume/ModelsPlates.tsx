import Image from "next/image";
import type { ReactNode } from "react";
import type { HandbookFigure, HandbookFigureStep } from "@/content/handbooks";
import { MODELS_PLATE_IDS, VOLUME_PICTURE_SIZE } from "@/components/handbooks/volume/catalog";

const PREPARE = "#3b6ff0";
const FIT = "#1ea36a";
const SHIP = "#7a5af0";
const WATCH = "#ef8b2c";
const INK = "#1b1814";
const DROP = "#9f1239";
const ARC = [PREPARE, FIT, SHIP, WATCH];
const HATCH = "repeating-linear-gradient(135deg, #7f93a8 0 4px, #e7eef5 4px 8px)";

const PLATES = new Set<string>(MODELS_PLATE_IDS);

export function ModelsPlate({
  sectionId,
  figure,
}: {
  sectionId: string;
  figure: HandbookFigure;
}) {
  if (!PLATES.has(sectionId)) return null;
  const body = draw(sectionId, figure);
  if (!body) return null;
  return (
    <div data-models-plate={sectionId} className="text-[1rem] leading-snug text-[#1b1814]">
      {body}
    </div>
  );
}

/** Opening leaf. Station names sit on the path; the picture itself has no words. */
export function ModelsCover() {
  const src = "/handbook-art/models-that-stay-in-the-decision/path.jpg";
  const size = VOLUME_PICTURE_SIZE[src] ?? { w: 1280, h: 720 };
  const pins = [
    { name: "Prepare", left: "28%", top: "78%" },
    { name: "Fit", left: "45.5%", top: "74%" },
    { name: "Ship", left: "61%", top: "66%" },
    { name: "Watch", left: "73.5%", top: "58%" },
  ];
  return (
    <figure>
      <div className="relative overflow-hidden">
        <Image
          src={src}
          alt=""
          width={size.w}
          height={size.h}
          priority
          sizes="(min-width: 1024px) 52rem, 100vw"
          className="h-auto w-full"
        />
        {pins.map((pin) => (
          <p
            key={pin.name}
            className="absolute -translate-x-1/2 -translate-y-[130%] text-[0.95rem] font-semibold text-[#1b1814] sm:text-[1.05rem]"
            style={{
              left: pin.left,
              top: pin.top,
              textShadow: "0 0 8px #f4f8fb, 0 0 8px #f4f8fb, 0 1px 0 #f4f8fb",
            }}
          >
            {pin.name}
          </p>
        ))}
      </div>
      <figcaption className="book-caption mt-3 max-w-[40rem]">
        Four arcs on one path. Watch returns as a new version id, not a silent overwrite.
      </figcaption>
    </figure>
  );
}

function draw(sectionId: string, figure: HandbookFigure): ReactNode {
  switch (sectionId) {
    case "destination":
    case "serve":
      return <ReleasePlate figure={figure} />;
    case "arcs":
      return <ArcsPlate figure={figure} />;
    case "case":
      return <BriefFlow figure={figure} highlight="Target" />;
    case "describe":
      return <BriefFlow figure={figure} highlight="Label" />;
    case "stage-example":
      return <StageFlow figure={figure} />;
    case "test":
      return <TestFlow figure={figure} />;
    case "card-sheet":
      return <PromotePlate figure={figure} />;
    case "boundary":
      return <BoundaryPlate figure={figure} />;
    case "contracts":
      return <ContractsPlate figure={figure} />;
    case "validity":
      return <ValidityPlate figure={figure} />;
    case "quality":
      return <ForwardFlow figure={figure} colors={[PREPARE, FIT, WATCH, FIT]} />;
    case "outliers":
      return <OutlierFlow figure={figure} />;
    case "harm":
      return <KeepDropPlate figure={figure} />;
    case "clock":
      return <ClockPlate figure={figure} />;
    case "freeze":
      return <FreezePlate figure={figure} />;
    case "train":
      return <TrainPlate figure={figure} />;
    case "loops":
      return <LoopsPlate figure={figure} />;
    case "monitor":
      return <MonitorPlate figure={figure} />;
    case "risk":
      return <RiskPlate figure={figure} />;
    case "review":
      return <ReviewPlate figure={figure} />;
    default:
      return null;
  }
}

function Note({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-4 max-w-[40rem] text-[0.98rem] leading-relaxed text-[#3e3933]">{children}</p>;
}

function Arrow({ direction = "both" }: { direction?: "both" | "down" | "right" }) {
  return (
    <span className="grid shrink-0 place-items-center text-[1.35rem] leading-none text-[#8aa0b8]" aria-hidden="true">
      {direction !== "right" ? <span className={direction === "both" ? "md:hidden" : ""}>↓</span> : null}
      {direction !== "down" ? <span className={direction === "both" ? "hidden md:inline" : ""}>→</span> : null}
    </span>
  );
}

function ReturnArc({ label }: { label: string }) {
  return (
    <div className="mt-2">
      <svg viewBox="0 0 640 52" className="mx-auto h-11 w-full max-w-[40rem]" aria-hidden="true">
        <path d="M588 8 C588 40 52 44 40 16" fill="none" stroke={FIT} strokeWidth="2.5" />
        <path d="M40 16 L30 30 L52 26 Z" fill={FIT} />
      </svg>
      <p className="text-center text-[1rem] font-semibold text-[#145c3c]">↩ {label}</p>
    </div>
  );
}

function Chevron({
  label,
  color,
  index,
  count,
}: {
  label: string;
  color: string;
  index: number;
  count: number;
}) {
  const pointed = index < count - 1;
  const notched = index > 0;
  const clip = pointed
    ? notched
      ? "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 14px 50%)"
      : "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)"
    : notched
      ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%)"
      : undefined;
  return (
    <div
      className="flex h-12 items-center justify-center px-3 text-center text-[1rem] font-semibold text-white sm:h-14 sm:text-[1.15rem]"
      style={{ background: color, clipPath: clip, paddingLeft: notched ? "1.15rem" : undefined }}
    >
      {label}
    </div>
  );
}

function ReleasePlate({ figure }: { figure: HandbookFigure }) {
  const spine = [...figure.steps].reverse().find((step) => step.spine)?.spine;
  return (
    <div>
      <ol className="flex flex-col gap-1 md:flex-row md:items-start">
        {figure.steps.map((step, index) => (
          <li key={step.term} className="flex min-w-0 flex-1 flex-col md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              <Chevron label={step.term} color={ARC[index] ?? INK} index={index} count={figure.steps.length} />
              <p className="mt-2 px-1 text-center text-[0.98rem] leading-snug">{step.detail}</p>
              {step.term === "Gate" ? (
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <GatePills detail={step.detail} />
                </div>
              ) : null}
            </div>
            {index < figure.steps.length - 1 ? (
              <span className="grid place-items-center py-1 md:px-1 md:pt-3">
                <Arrow />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {spine ? <ReturnArc label={spine} /> : null}
      <Note>{figure.note}</Note>
    </div>
  );
}

function GatePills({ detail }: { detail: string }) {
  const approved = /approved/i.test(detail);
  const held = /held/i.test(detail);
  if (!approved && !held) return null;
  return (
    <>
      {approved ? <span className="rounded-full bg-[#e7f6ee] px-3 py-1 text-[0.9rem] font-semibold text-[#145c3c]">approved</span> : null}
      {held ? <span className="rounded-full bg-[#fff1f2] px-3 py-1 text-[0.9rem] font-semibold text-[#9f1239]">held</span> : null}
    </>
  );
}

function ArcsPlate({ figure }: { figure: HandbookFigure }) {
  const spine = figure.steps.find((step) => step.spine)?.spine;
  return (
    <div>
      <ol className="hidden md:flex" aria-hidden="true">
        {figure.steps.map((step, index) => (
          <li
            key={step.term}
            className="min-w-0 flex-1"
            style={{ marginLeft: index === 0 ? 0 : -12, zIndex: figure.steps.length - index }}
          >
            <Chevron label={step.term} color={ARC[index] ?? INK} index={index} count={figure.steps.length} />
          </li>
        ))}
      </ol>
      <div className="mt-4 hidden gap-x-4 md:grid md:grid-cols-4">
        {figure.steps.map((step, index) => (
          <ArcSteps key={step.term} step={step} index={index} />
        ))}
      </div>
      <ol className="flex flex-col gap-4 md:hidden">
        {figure.steps.map((step, index) => (
          <li key={step.term}>
            <Chevron label={step.term} color={ARC[index] ?? INK} index={0} count={2} />
            <div className="mt-2">
              <ArcSteps step={step} index={index} />
            </div>
          </li>
        ))}
      </ol>
      {spine ? <ReturnArc label={spine} /> : null}
      <Note>{figure.note}</Note>
    </div>
  );
}

function ArcSteps({ step, index }: { step: HandbookFigureStep; index: number }) {
  return (
    <ol className="min-w-0 space-y-1.5">
      {step.detail.split(/\s*→\s*/).map((part, partIndex) => (
        <li key={part} className="flex gap-2 leading-snug">
          <span className="font-semibold tabular-nums" style={{ color: ARC[index] ?? INK }}>
            {partIndex + 1}.
          </span>
          <span>{part.charAt(0).toUpperCase() + part.slice(1)}</span>
        </li>
      ))}
    </ol>
  );
}

function BriefFlow({ figure, highlight }: { figure: HandbookFigure; highlight?: string }) {
  return (
    <div>
      <ol className="mx-auto flex max-w-[34rem] flex-col items-stretch">
        {figure.steps.map((step, index) => (
          <li key={step.term} className="flex flex-col items-center">
            <FlowNode step={step} accent={step.term === highlight ? PREPARE : undefined} />
            {index < figure.steps.length - 1 ? (
              <span className="py-1">
                <Arrow direction="down" />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <Note>{figure.note}</Note>
    </div>
  );
}

function FlowNode({ step, accent }: { step: HandbookFigureStep; accent?: string }) {
  const dark = Boolean(step.gate);
  return (
    <div
      className="w-full rounded-full border-2 px-5 py-3 text-center"
      style={
        dark
          ? { background: INK, borderColor: INK, color: "#f4efe6" }
          : { borderColor: accent ?? INK, background: "#f4efe6" }
      }
    >
      <p className="text-[0.8rem] font-semibold tracking-[0.12em] uppercase" style={{ color: dark ? "#f0c9a0" : accent ?? "#5c5348" }}>
        {step.term}
      </p>
      <p className="mt-0.5 text-[1rem] leading-snug">{step.detail}</p>
    </div>
  );
}

function StageFlow({ figure }: { figure: HandbookFigure }) {
  const main = figure.steps.filter((step) => !step.gate);
  const fail = figure.steps.find((step) => step.gate);
  return (
    <div>
      <ol className="mx-auto flex max-w-[34rem] flex-col items-center">
        {main.map((step, index) => (
          <li key={step.term} className="flex w-full flex-col items-center">
            <FlowNode step={step} accent={index === 0 ? PREPARE : FIT} />
            {index < main.length - 1 ? (
              <span className="py-1">
                <Arrow direction="down" />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {fail ? (
        <div className="mx-auto mt-3 flex max-w-[34rem] items-start gap-3 border-l-4 border-[#c23b4a] pl-4">
          <span className="mt-0.5 font-semibold text-[#9f1239]" aria-hidden="true">
            ✕
          </span>
          <p className="leading-snug">
            <span className="font-semibold text-[#9f1239]">{fail.term}. </span>
            {fail.detail}
          </p>
        </div>
      ) : null}
      <Note>{figure.note}</Note>
    </div>
  );
}

function TestFlow({ figure }: { figure: HandbookFigure }) {
  const main = figure.steps.filter((step) => !step.gate);
  const status = figure.steps.find((step) => step.gate);
  const outcomes = status?.detail.split(/\s*;\s*/) ?? [];
  return (
    <div>
      <ol className="mx-auto flex max-w-[36rem] flex-col items-center md:max-w-none md:flex-row md:items-start">
        {main.map((step, index) => (
          <li key={step.term} className="flex w-full min-w-0 flex-1 flex-col items-center md:flex-row md:items-center">
            <div className="w-full min-w-0">
              <FlowNode step={step} accent={ARC[index] ?? INK} />
            </div>
            {index < main.length - 1 ? (
              <span className="py-1 md:px-2">
                <Arrow />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {status ? (
        <div className="mt-4">
          <p className="text-center text-[0.85rem] font-semibold tracking-[0.12em] text-[#5c5348] uppercase">{status.term}</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(outcomes.length > 1 ? outcomes : [status.detail]).map((outcome, index) => (
              <p
                key={outcome}
                className="rounded-full px-4 py-3 text-center text-[1rem] leading-snug text-white"
                style={{ background: index === 0 ? FIT : INK }}
              >
                {outcome}
              </p>
            ))}
          </div>
        </div>
      ) : null}
      <Note>{figure.note}</Note>
    </div>
  );
}

function ForwardFlow({ figure, colors }: { figure: HandbookFigure; colors: string[] }) {
  const spine = [...figure.steps].reverse().find((step) => step.spine)?.spine;
  return (
    <div>
      <ol className="flex flex-col md:flex-row md:items-start">
        {figure.steps.map((step, index) => (
          <li key={step.term} className="flex min-w-0 flex-1 flex-col md:flex-row md:items-start">
            <div className="min-w-0 flex-1 text-center">
              <span
                className="mx-auto grid h-10 w-10 place-items-center rounded-full text-[1rem] font-semibold text-white"
                style={{ background: colors[index] ?? INK }}
              >
                {index + 1}
              </span>
              <p className="mt-2 font-semibold" style={{ color: colors[index] ?? INK }}>
                {step.term}
              </p>
              <p className="mt-1 px-2 leading-snug">{step.detail}</p>
            </div>
            {index < figure.steps.length - 1 ? (
              <span className="grid place-items-center py-1 md:px-1 md:pt-2">
                <Arrow />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {spine ? (
        <p className="mt-4 text-center text-[1rem] font-semibold text-[#145c3c]">→ {spine}</p>
      ) : null}
      <Note>{figure.note}</Note>
    </div>
  );
}

function OutlierFlow({ figure }: { figure: HandbookFigure }) {
  const rows = figure.rows ?? [];
  return (
    <div>
      <ol className="flex flex-col md:flex-row md:items-start">
        {rows.map((row, index) => {
          const cell = row.cells[0] ?? "";
          const cut = cell.indexOf(" — ");
          const file = cut < 0 ? cell : cell.slice(0, cut);
          const rest = cut < 0 ? "" : cell.slice(cut + 3);
          return (
            <li key={row.label} className="flex min-w-0 flex-1 flex-col md:flex-row md:items-start">
              <div className="min-w-0 flex-1 text-center">
                <span
                  className="mx-auto grid h-10 w-10 place-items-center rounded-full text-[1rem] font-semibold text-white"
                  style={{ background: ARC[index] ?? INK }}
                >
                  {index + 1}
                </span>
                <p className="mt-2 font-semibold" style={{ color: ARC[index] ?? INK }}>
                  {row.label}
                </p>
                <p className="mt-1 px-2 font-mono text-[0.9rem] leading-snug text-[#1e3a8a]">{file}</p>
                {rest ? <p className="mt-1 px-2 leading-snug">{rest}</p> : null}
              </div>
              {index < rows.length - 1 ? (
                <span className="grid place-items-center py-1 md:px-1 md:pt-2">
                  <Arrow />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <Note>{figure.note}</Note>
    </div>
  );
}

function BoundaryPlate({ figure }: { figure: HandbookFigure }) {
  return (
    <div>
      <div>
        <div className="flex items-end justify-between gap-3 text-[0.95rem]">
          <span className="font-semibold">Morning cut</span>
          <span className="text-center font-medium text-[#3e3933]">14-day outcome window</span>
          <span className="font-semibold">Window closed</span>
        </div>
        <div className="relative mt-2 h-3" aria-hidden="true">
          <div className="absolute inset-x-0 top-1 h-[3px] rounded-full bg-[#d5deea]" />
          <div className="absolute top-1 left-0 h-[3px] w-[78%] rounded-full" style={{ background: PREPARE }} />
          <span className="absolute top-0 left-0 h-3 w-3 rounded-full" style={{ background: PREPARE }} />
          <span className="absolute top-0 left-[78%] h-3 w-3 -translate-x-1/2 rounded-full" style={{ background: INK }} />
        </div>
      </div>
      <div className="mt-5">
        <SplitBar />
      </div>
      <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {figure.steps.map((step) => (
          <li key={step.term} className="flex gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: FIT }} aria-hidden="true">
              ✓
            </span>
            <p className="leading-snug">
              <span className="font-semibold">{step.term}. </span>
              {step.detail}
            </p>
          </li>
        ))}
      </ul>
      <Note>{figure.note}</Note>
    </div>
  );
}

function SplitBar() {
  return (
    <div>
      <div className="flex h-14 overflow-hidden rounded-md text-[0.95rem] font-semibold text-white" aria-hidden="true">
        <div className="flex flex-[8] items-center justify-center px-2" style={{ background: FIT }}>
          Train
        </div>
        <div className="w-8 shrink-0 sm:w-12" style={{ background: HATCH }} title="Embargo" />
        <div className="flex flex-[2] items-center justify-center px-1 text-center leading-tight" style={{ background: SHIP }}>
          <span className="hidden sm:inline">Validation</span>
        </div>
        <div className="w-8 shrink-0 sm:w-12" style={{ background: HATCH }} title="Embargo" />
        <div className="flex flex-[2] items-center justify-center" style={{ background: INK }}>
          <span className="hidden sm:inline">Test</span>
        </div>
      </div>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-[#3e3933]">
        Hatched gaps are label_delay_days at both boundaries. Widths show the roles, not a measured share of rows.
      </p>
    </div>
  );
}

function Swatch({ color, hatch }: { color?: string; hatch?: boolean }) {
  return (
    <span
      className="mr-2 inline-block h-3 w-3 translate-y-px"
      style={hatch ? { background: HATCH, boxShadow: "inset 0 0 0 1px #c5d0de" } : { background: color }}
      aria-hidden="true"
    />
  );
}

type ContractNode = {
  number: number;
  name: string;
  file: string;
  rest: string;
  color: string;
};

function parseContract(step: HandbookFigureStep): ContractNode {
  const match = /^(\d+)\s+(.+)$/.exec(step.term);
  const number = Number(match?.[1] ?? 0);
  const name = match?.[2] ?? step.term;
  const body = step.detail.replace(/^→\s*/, "");
  const cut = body.indexOf(". ");
  const file = cut < 0 ? body : body.slice(0, cut);
  const rest = cut < 0 ? "" : body.slice(cut + 2);
  const color = number <= 4 ? PREPARE : number <= 6 ? FIT : number <= 8 ? SHIP : WATCH;
  return { number, name, file, rest, color };
}

function ContractsPlate({ figure }: { figure: HandbookFigure }) {
  const nodes = figure.steps.map(parseContract);
  const rows = [nodes.slice(0, 3), nodes.slice(3, 6), nodes.slice(6)];
  return (
    <div>
      <div className="hidden md:block">
        {rows.map((row, rowIndex) => (
          <div key={row[0]?.number ?? rowIndex}>
            {rowIndex > 0 ? (
              <div className="py-1 text-center text-[1.35rem] text-[#8aa0b8]" aria-hidden="true">
                ↓
              </div>
            ) : null}
            <ol className="flex items-start gap-1">
              {row.map((node, index) => (
                <li key={node.number} className="contents">
                  <div className="min-w-0 flex-1">
                    <ContractMark node={node} />
                  </div>
                  {index < row.length - 1 ? (
                    <span className="px-1 pt-1 text-[1.35rem] text-[#8aa0b8]" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <ol className="relative ml-4 space-y-5 border-l-2 border-[#d5deea] py-1 md:hidden">
        {nodes.map((node) => (
          <li key={node.number} className="relative pl-8">
            <span
              className="absolute top-0 -left-[0.95rem] grid h-8 w-8 place-items-center rounded-full text-[0.95rem] font-semibold text-white"
              style={{ background: node.color }}
            >
              {node.number}
            </span>
            <p className="font-semibold">{node.name}</p>
            <p className="mt-1 font-mono text-[0.9rem] leading-snug text-[#1e3a8a]">{node.file}</p>
            {node.rest ? <p className="mt-1 leading-snug">{node.rest}</p> : null}
          </li>
        ))}
      </ol>
      <Note>{figure.note}</Note>
    </div>
  );
}

function ContractMark({ node }: { node: ContractNode }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[0.95rem] font-semibold text-white"
          style={{ background: node.color }}
        >
          {node.number}
        </span>
        <span className="font-semibold leading-tight">{node.name}</span>
      </div>
      <p className="mt-2 font-mono text-[0.82rem] leading-snug text-[#1e3a8a]">{node.file}</p>
      {node.rest ? <p className="mt-1 text-[0.95rem] leading-snug">{node.rest}</p> : null}
    </div>
  );
}

function ValidityPlate({ figure }: { figure: HandbookFigure }) {
  const columns = figure.columns ?? [];
  const colors = [PREPARE, FIT, SHIP];
  const washes = ["rgba(59,111,240,0.16)", "rgba(30,163,106,0.18)", "rgba(122,90,240,0.16)"];
  return (
    <div>
      <div className="relative mx-auto hidden h-[28rem] max-w-[42rem] md:block" aria-hidden="true">
        <Ring className="top-[2%] left-[4%] h-64 w-64" color={colors[0]!} wash={washes[0]!} />
        <Ring className="top-[2%] right-[4%] h-64 w-64" color={colors[2]!} wash={washes[2]!} />
        <Ring className="top-[38%] left-1/2 h-64 w-64 -translate-x-1/2" color={colors[1]!} wash={washes[1]!} />
        <VennLabel className="top-[14%] left-[7%] w-44" term={columns[0]?.term} detail={columns[0]?.detail} color={colors[0]!} />
        <VennLabel className="top-[14%] right-[7%] w-44" term={columns[2]?.term} detail={columns[2]?.detail} color={colors[2]!} />
        <VennLabel className="top-[70%] left-1/2 w-48 -translate-x-1/2" term={columns[1]?.term} detail={columns[1]?.detail} color={colors[1]!} />
        <p className="absolute top-[46%] left-1/2 w-32 -translate-x-1/2 text-center text-[1.15rem] font-semibold leading-tight">All three</p>
      </div>
      <div className="flex flex-col items-center md:hidden" aria-hidden="true">
        {columns.map((column, index) => (
          <div
            key={column.term}
            className={`grid h-44 w-44 place-items-center rounded-full border-2 px-5 text-center ${index ? "-mt-10" : ""}`}
            style={{ background: washes[index], borderColor: colors[index] }}
          >
            <div>
              <p className="font-semibold leading-tight" style={{ color: colors[index] }}>
                {column.term}
              </p>
              <p className="mt-1 text-[0.92rem] leading-snug">{column.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-6 grid gap-5 md:grid-cols-3">
        {columns.map((column, index) => (
          <li key={column.term}>
            <p className="font-semibold" style={{ color: colors[index] }}>
              <Swatch color={colors[index]} />
              {column.term}
            </p>
            <ul className="mt-2 space-y-1.5">
              {column.points.map((point) => (
                <li key={point} className="leading-snug">
                  {point}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-[1.02rem] font-semibold">Clearing one does not clear the others.</p>
      <Note>{figure.note}</Note>
    </div>
  );
}

function Ring({ className, color, wash }: { className: string; color: string; wash: string }) {
  return <div className={`absolute rounded-full border-2 ${className}`} style={{ borderColor: color, background: wash }} />;
}

function VennLabel({
  className,
  term,
  detail,
  color,
}: {
  className: string;
  term?: string;
  detail?: string;
  color: string;
}) {
  if (!term) return null;
  return (
    <div className={`absolute text-center ${className}`}>
      <p className="font-semibold leading-tight" style={{ color }}>
        {term}
      </p>
      <p className="mt-1 text-[0.95rem] leading-snug">{detail}</p>
    </div>
  );
}

function KeepDropPlate({ figure }: { figure: HandbookFigure }) {
  const rows = figure.rows ?? [];
  const keep = rows.filter((row) => (row.cells[0] ?? "").startsWith("Keep"));
  const drop = rows.filter((row) => !(row.cells[0] ?? "").startsWith("Keep"));
  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2">
        <ActionList title="Keep" kind="keep" rows={keep} />
        <ActionList title="Drop" kind="drop" rows={drop} />
      </div>
      <p className="mt-4 max-w-[40rem] text-[0.98rem] leading-relaxed text-[#3e3933]">
        A kept feature has to be built from this morning’s extract. High correlation with the label is not a keep.
      </p>
      <Note>{figure.note}</Note>
    </div>
  );
}

function ActionList({
  title,
  kind,
  rows,
}: {
  title: string;
  kind: "keep" | "drop";
  rows: { label: string; cells: string[] }[];
}) {
  const keep = kind === "keep";
  const color = keep ? FIT : DROP;
  return (
    <section>
      <h3 className="flex items-center gap-3 text-[1.35rem] font-semibold" style={{ color: keep ? "#145c3c" : DROP }}>
        <span className="grid h-10 w-10 place-items-center rounded-full text-[1.25rem] text-white" style={{ background: color }} aria-hidden="true">
          {keep ? "✓" : "✕"}
        </span>
        {title}
      </h3>
      <ul className="mt-3">
        {rows.map((row) => (
          <li key={row.label} className="flex gap-3 border-t border-[#e4ddd2] py-2.5">
            <span className="mt-0.5 font-semibold" style={{ color }} aria-hidden="true">
              {keep ? "✓" : "✕"}
            </span>
            <span>
              <span className="font-semibold">{row.label}</span>
              <span className="mt-0.5 block leading-snug text-[#3e3933]">{reasonOf(row.cells[0] ?? "")}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function reasonOf(cell: string) {
  return cell.replace(/^Keep\.\s*/, "").replace(/^Keep if\s*/, "If ").replace(/^Drop\.\s*/, "");
}

function ClockPlate({ figure }: { figure: HandbookFigure }) {
  const [first, second] = figure.steps;
  if (!first || !second) return null;
  return (
    <div className="mx-auto max-w-[36rem]">
      <Question step={first} />
      <div className="mt-2 ml-5 border-l-2 border-[#d5deea] pl-4">
        <Branch branch={first.branches?.[0]} />
        <p className="py-2 font-semibold text-[#145c3c]">↓ {first.spine}</p>
        <Question step={second} />
        <div className="mt-2 ml-5 border-l-2 border-[#d5deea] pl-4">
          <Branch branch={second.branches?.[0]} />
          <div className="mt-3 inline-block rounded-full px-5 py-3 text-white" style={{ background: FIT }}>
            <p className="text-[0.85rem] font-semibold tracking-[0.08em] uppercase">Yes</p>
            <p className="mt-0.5 font-semibold leading-snug">{second.spine}</p>
          </div>
        </div>
      </div>
      <Note>{figure.note}</Note>
    </div>
  );
}

function Question({ step }: { step: HandbookFigureStep }) {
  return (
    <div className="rounded-full border-2 border-[#1b1814] bg-[#f4efe6] px-5 py-3 text-center">
      <p className="font-semibold leading-snug">{step.term}</p>
      <p className="mt-0.5 leading-snug text-[#3e3933]">{step.detail}</p>
    </div>
  );
}

function Branch({ branch }: { branch?: { term: string; detail: string } }) {
  if (!branch) return null;
  return (
    <p className="py-2 leading-snug">
      <span className="font-semibold text-[#9f1239]">No → {branch.term}. </span>
      {branch.detail}
    </p>
  );
}

function FreezePlate({ figure }: { figure: HandbookFigure }) {
  const by = (term: string) => figure.steps.find((step) => step.term === term);
  const matured = by("Matured");
  const train = by("Train");
  const embargo = by("Embargo");
  const validation = by("Validation");
  const test = by("Test");
  if (!train || !validation || !test || !embargo) return <BriefFlow figure={figure} />;
  const testLine = test.spine ? `${test.detail}. ${test.spine}.` : test.detail;
  return (
    <div>
      {matured ? (
        <div className="mb-3 flex h-12 items-center rounded-md px-4 font-semibold text-white" style={{ background: FIT }}>
          {matured.term} — {matured.detail}
        </div>
      ) : null}
      <div className="flex h-16 overflow-hidden rounded-md text-[0.95rem] font-semibold text-white" aria-hidden="true">
        <div className="flex flex-[8] flex-col items-center justify-center px-2 text-center leading-tight" style={{ background: FIT }}>
          <span>{train.term}</span>
          <span className="mt-0.5 hidden text-[0.8rem] font-medium sm:inline">{train.detail}</span>
        </div>
        <div className="w-8 shrink-0 sm:w-12" style={{ background: HATCH }} title="Embargo" />
        <div className="flex flex-[2] flex-col items-center justify-center px-1 text-center leading-tight" style={{ background: SHIP }}>
          <span className="hidden sm:inline">{validation.term}</span>
        </div>
        <div className="w-8 shrink-0 sm:w-12" style={{ background: HATCH }} title="Embargo" />
        <div className="flex flex-[2] items-center justify-center" style={{ background: INK }}>
          <span className="hidden sm:inline">{test.term}</span>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5 text-[0.98rem] leading-snug">
        <li>
          <Swatch color={FIT} />
          <span className="font-semibold">{train.term}. </span>
          {train.detail}
        </li>
        <li>
          <Swatch hatch />
          <span className="font-semibold">{embargo.term}. </span>
          {embargo.detail}
        </li>
        <li>
          <Swatch color={SHIP} />
          <span className="font-semibold">{validation.term}. </span>
          {validation.detail}
        </li>
        <li>
          <Swatch color={INK} />
          <span className="font-semibold">{test.term}. </span>
          {testLine}
        </li>
      </ul>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-[#3e3933]">Widths show the roles, not a measured share of rows.</p>
      <Note>{figure.note}</Note>
    </div>
  );
}

function TrainPlate({ figure }: { figure: HandbookFigure }) {
  const inner = figure.steps.filter((step) => step.term !== "Validate");
  const validate = figure.steps.find((step) => step.term === "Validate");
  return (
    <div>
      <div className="rounded-[1.75rem] border-2 border-dashed px-3 py-4 sm:px-5" style={{ borderColor: FIT }}>
        <p className="text-center text-[0.85rem] font-semibold tracking-[0.14em] text-[#145c3c] uppercase">Inner slice of train</p>
        <ol className="mt-3 flex flex-col md:flex-row md:flex-wrap md:items-start md:justify-center">
          {inner.map((step, index) => (
            <li key={step.term} className="flex min-w-0 flex-col items-center md:w-[19%] md:flex-row">
              <div className="w-full min-w-0 text-center">
                <p className="rounded-full px-3 py-2 font-semibold text-white" style={{ background: FIT }}>
                  {step.term}
                </p>
                <p className="mt-1.5 px-1 text-[0.95rem] leading-snug">{step.detail}</p>
              </div>
              {index < inner.length - 1 ? (
                <span className="py-1 md:px-1">
                  <Arrow />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        <ReturnArc label="Inner trials and feature loops" />
      </div>
      {validate ? (
        <div className="mt-2 flex flex-col items-center">
          <span className="text-[1.5rem] leading-none" style={{ color: SHIP }} aria-hidden="true">
            ↓
          </span>
          <div className="mt-2 w-full max-w-[28rem] rounded-full px-5 py-3 text-center text-white" style={{ background: SHIP }}>
            <p className="font-semibold">{validate.term}</p>
            <p className="mt-0.5 text-[0.98rem] leading-snug">{validate.detail}</p>
          </div>
        </div>
      ) : null}
      <Note>{figure.note}</Note>
    </div>
  );
}

function LoopsPlate({ figure }: { figure: HandbookFigure }) {
  return (
    <div>
      <ol className="flex flex-col gap-2 md:flex-row md:items-stretch">
        {figure.steps.map((step, index) => (
          <li key={step.term} className="flex min-w-0 flex-1 flex-col md:flex-row">
            <div className="min-w-0 flex-1">
              <Chevron label={step.term} color={ARC[index] ?? INK} index={0} count={2} />
              <p className="mt-2 leading-snug">{step.detail}</p>
              {step.spine ? <p className="mt-2 font-semibold text-[#145c3c]">↓ {step.spine}</p> : null}
              {step.branches?.map((branch) => (
                <p key={branch.term} className="mt-2 border-l-4 border-[#c23b4a] pl-3 leading-snug">
                  <span className="font-semibold text-[#9f1239]">{branch.term}. </span>
                  {branch.detail}
                </p>
              ))}
            </div>
            {index < figure.steps.length - 1 ? (
              <span className="grid place-items-center py-2 md:px-2 md:pt-3">
                <Arrow />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <Note>{figure.note}</Note>
    </div>
  );
}

function MonitorPlate({ figure }: { figure: HandbookFigure }) {
  return (
    <div>
      <table className="w-full border-collapse text-left text-[0.98rem]">
        <thead>
          <tr className="border-b-2 border-[#1b1814] text-[0.82rem] tracking-[0.08em] text-[#5c5348] uppercase">
            <th className="py-2 pr-3 font-semibold">Signal</th>
            <th className="py-2 pr-3 font-semibold">What happens</th>
            <th className="py-2 font-semibold">Re-enter</th>
          </tr>
        </thead>
        <tbody>
          {figure.steps.map((step) => (
            <tr key={step.term} className="border-b border-[#e4ddd2] align-top">
              <th className="py-3 pr-3 font-semibold" scope="row">
                {step.term}
              </th>
              <td className="py-3 pr-3 leading-snug">
                {step.detail}
                {step.branches?.map((branch) => (
                  <span key={branch.term} className="mt-1 block text-[#9f1239]">
                    <span className="font-semibold">{branch.term}. </span>
                    {branch.detail}
                  </span>
                ))}
              </td>
              <td className="py-3 font-semibold text-[#9a4d0f]">{step.spine}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Note>{figure.note}</Note>
    </div>
  );
}

function PromotePlate({ figure }: { figure: HandbookFigure }) {
  const gate = figure.steps.find((step) => step.gate);
  const fields = figure.steps.filter((step) => !step.gate);
  const evidence = new Set(["Intended use", "Out of scope", "Evidence", "Fallback"]);
  const left = fields.filter((step) => evidence.has(step.term));
  const right = fields.filter((step) => !evidence.has(step.term));
  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <SheetColumn kicker="Evidence" color={PREPARE} steps={left} />
        <div className="flex flex-col items-center justify-center gap-2 md:w-44 md:shrink-0">
          <span className="text-[1.6rem] leading-none text-[#7a5af0]" aria-hidden="true">
            <span className="md:hidden">↓</span>
            <span className="hidden md:inline">→</span>
          </span>
          {gate ? (
            <div className="w-full rounded-full bg-[#1b1814] px-4 py-3 text-center text-white">
              <p className="font-semibold text-[#f0c9a0]">{gate.term}</p>
              <p className="mt-1 text-[0.95rem] leading-snug">{gate.detail}</p>
            </div>
          ) : null}
        </div>
        <SheetColumn kicker="Authorization" color={SHIP} steps={right} />
      </div>
      <Note>{figure.note}</Note>
    </div>
  );
}

function SheetColumn({ kicker, color, steps }: { kicker: string; color: string; steps: HandbookFigureStep[] }) {
  return (
    <section className="min-w-0 flex-1">
      <h3 className="border-b-4 pb-1 text-[1.15rem] font-semibold" style={{ borderColor: color, color }}>
        {kicker}
      </h3>
      <ul className="mt-3 space-y-3">
        {steps.map((step) => (
          <li key={step.term}>
            <p className="font-semibold">{step.term}</p>
            <p className="mt-0.5 leading-snug">{step.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RiskPlate({ figure }: { figure: HandbookFigure }) {
  const rows = figure.rows ?? [];
  const colors = ["#8a8175", PREPARE, DROP];
  return (
    <div>
      <ol className="flex flex-col md:flex-row md:items-stretch">
        {rows.map((row, index) => (
          <li key={row.label} className="flex min-w-0 flex-1 flex-col md:flex-row md:items-center">
            <div
              className="min-w-0 flex-1 rounded-full border-2 px-4 py-3 text-center"
              style={{
                borderColor: colors[index],
                background: index === rows.length - 1 ? "#fff5f6" : "#f4efe6",
              }}
            >
              <p className="font-semibold" style={{ color: index === rows.length - 1 ? DROP : INK }}>
                {row.label}
              </p>
              <p className="mt-1 leading-snug">{row.cells[0]}</p>
            </div>
            {index < rows.length - 1 ? (
              <span className="grid place-items-center py-1 md:px-2">
                <Arrow />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <Note>{figure.note}</Note>
    </div>
  );
}

function ReviewPlate({ figure }: { figure: HandbookFigure }) {
  const last = figure.steps.length - 1;
  return (
    <div>
      <ol className="flex flex-col md:flex-row md:items-start">
        {figure.steps.map((step, index) => (
          <li key={step.term} className="flex min-w-0 flex-1 flex-col md:flex-row md:items-start">
            <div className="min-w-0 flex-1">
              <Chevron label={step.term} color={ARC[index] ?? INK} index={index} count={figure.steps.length} />
              {index < last ? <p className="mt-2 px-1 text-center leading-snug">{step.detail}</p> : null}
            </div>
            {index < last ? (
              <span className="grid place-items-center py-1 md:px-1 md:pt-3">
                <Arrow />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {figure.steps[last] ? <ReturnArc label={figure.steps[last].detail} /> : null}
      <Note>{figure.note}</Note>
    </div>
  );
}
