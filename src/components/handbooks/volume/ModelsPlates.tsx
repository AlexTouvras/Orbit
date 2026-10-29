import Image from "next/image";
import type { ReactNode } from "react";
import type { HandbookFigure, HandbookFigureStep } from "@/content/handbooks";
import { MODELS_PLATE_IDS, VOLUME_PICTURE_SIZE } from "@/components/handbooks/volume/catalog";

const PREPARE = "#3b6ff0";
const FIT = "#1ea36a";
const SHIP = "#7a5af0";
const WATCH = "#ef8b2c";
const INK = "#1c2430";
const ARC = [PREPARE, FIT, SHIP, WATCH];

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
    <div data-models-plate={sectionId} className="text-[1rem] leading-snug text-[#243040]">
      {body}
    </div>
  );
}

/** Opening leaf. The stations are named in type; the path carries no words. */
export function ModelsCover() {
  const src = "/handbook-art/models-that-stay-in-the-decision/path.jpg";
  const size = VOLUME_PICTURE_SIZE[src] ?? { w: 1280, h: 720 };
  const stations = [
    { name: "Prepare", line: "Profile, quality, outliers, features", color: PREPARE },
    { name: "Fit", line: "Freeze, train, tune, one validation read", color: FIT },
    { name: "Ship", line: "Test once, then a named candidate", color: SHIP },
    { name: "Watch", line: "A new version id, or rollback", color: WATCH },
  ];
  return (
    <figure>
      <div className="overflow-hidden rounded-2xl border border-[#d5e0ec] bg-[#f4f8fb]">
        <Image
          src={src}
          alt=""
          width={size.w}
          height={size.h}
          priority
          sizes="(min-width: 1024px) 52rem, 100vw"
          className="h-auto w-full"
        />
        <ol className="grid gap-3 border-t border-[#d5e0ec] bg-white p-4 sm:grid-cols-4 sm:p-5">
          {stations.map((station) => (
            <li key={station.name} className="min-w-0">
              <p className="font-semibold" style={{ color: station.color }}>
                {station.name}
              </p>
              <p className="mt-1 text-[0.95rem] leading-snug text-[#3d4a5c]">{station.line}</p>
            </li>
          ))}
        </ol>
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
      return <SheetPlate figure={figure} highlight="Target" />;
    case "describe":
    case "stage-example":
    case "test":
      return <SheetPlate figure={figure} />;
    case "card-sheet":
      return <PromotePlate figure={figure} />;
    case "boundary":
      return <BoundaryPlate figure={figure} />;
    case "contracts":
      return <ContractsPlate figure={figure} />;
    case "validity":
      return <ValidityPlate figure={figure} />;
    case "quality":
      return <QualityPlate figure={figure} />;
    case "outliers":
      return <PassPlate figure={figure} />;
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

function SplitBar() {
  const hatch = "bg-[repeating-linear-gradient(135deg,#d5deea_0_4px,#f5f8fc_4px_8px)]";
  return (
    <div className="mt-3">
      <div className="flex h-12 overflow-hidden rounded-lg text-[0.85rem] font-semibold text-white" aria-hidden="true">
        <div className="flex flex-[8] items-center justify-center bg-[#1ea36a]">Train</div>
        <div className={`w-3 shrink-0 sm:w-5 ${hatch}`} />
        <div className="flex flex-[1.6] items-center justify-center bg-[#7a5af0] px-1 text-center leading-tight">
          <span className="hidden sm:inline">Validation</span>
        </div>
        <div className={`w-3 shrink-0 sm:w-5 ${hatch}`} />
        <div className="flex flex-[1.6] items-center justify-center bg-[#1c2430]">
          <span className="hidden sm:inline">Test</span>
        </div>
      </div>
      <p className="mt-2 text-[0.92rem] leading-relaxed text-[#3d4a5c]">
        Hatched gaps are the embargo, label_delay_days, at both boundaries. Widths show the roles, not a measured share of rows.
      </p>
    </div>
  );
}

function Frame({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d5e0ec] bg-[#f5f8fc] p-4 sm:p-5">
      {children}
      {note ? <p className="mt-4 border-t border-[#d7e2ee] pt-3 text-[0.95rem] leading-relaxed text-[#3d4a5c]">{note}</p> : null}
    </div>
  );
}

function SheetPlate({ figure, highlight }: { figure: HandbookFigure; highlight?: string }) {
  const fields = figure.steps.filter((step) => !step.gate);
  const gate = figure.steps.find((step) => step.gate);
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d5e0ec] bg-white">
      <dl>
        {fields.map((step) => (
          <div
            key={step.term}
            className={`grid gap-1 border-b border-[#e6eef6] px-4 py-3 sm:grid-cols-[11.5rem_minmax(0,1fr)] sm:gap-6 sm:px-5 ${
              step.term === highlight ? "bg-[#eef3ff]" : ""
            }`}
          >
            <dt className="font-semibold text-[#1c2430]">{step.term}</dt>
            <dd className="leading-relaxed">{step.detail}</dd>
          </div>
        ))}
      </dl>
      {gate ? <Gate step={gate} /> : null}
      {figure.note ? <p className="px-4 py-3 text-[0.95rem] leading-relaxed text-[#3d4a5c] sm:px-5">{figure.note}</p> : null}
    </div>
  );
}

function Gate({ step }: { step: HandbookFigureStep }) {
  return (
    <div className="grid gap-1 bg-[#1c2430] px-4 py-3 text-white sm:grid-cols-[11.5rem_minmax(0,1fr)] sm:gap-6 sm:px-5">
      <p className="font-semibold text-[#f0c9a0]">{step.term}</p>
      <p className="leading-relaxed">{step.detail}</p>
    </div>
  );
}

function ReleasePlate({ figure }: { figure: HandbookFigure }) {
  return (
    <Frame note={figure.note}>
      <ol className="grid gap-3 md:grid-cols-4">
        {figure.steps.map((step) => (
          <li key={step.term} className="rounded-xl border border-[#e6eef6] bg-white p-4">
            <p className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase" style={{ color: tone(step.term) }}>
              {step.term}
            </p>
            <p className="mt-2 font-medium leading-relaxed">{step.detail}</p>
            {step.term === "Gate" ? <GatePills detail={step.detail} /> : null}
            {step.spine ? (
              <p className="mt-3 border-t border-[#d7e2ee] pt-2 text-[0.92rem] font-medium" style={{ color: tone(step.term) }}>
                ↩ {step.spine}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function GatePills({ detail }: { detail: string }) {
  const approved = /approved/i.test(detail);
  const held = /held/i.test(detail);
  if (!approved && !held) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {approved ? <span className="rounded-full bg-[#e7f6ee] px-2.5 py-1 text-[0.85rem] font-medium text-[#145c3c]">approved</span> : null}
      {held ? <span className="rounded-full bg-[#fff1f2] px-2.5 py-1 text-[0.85rem] font-medium text-[#9f1239]">held</span> : null}
    </div>
  );
}

function tone(term: string) {
  if (term === "Candidate" || term === "Checks") return PREPARE;
  if (term === "Parallel" || term === "Maturity") return "#3d6b8a";
  if (term === "Gate" || term === "Delay") return SHIP;
  if (term === "Live" || term === "quality.json") return FIT;
  if (term === "Watch") return WATCH;
  return INK;
}

function ArcsPlate({ figure }: { figure: HandbookFigure }) {
  const spine = figure.steps.find((step) => step.spine)?.spine;
  return (
    <Frame note={figure.note}>
      <ol className="hidden md:flex" aria-hidden="true">
        {figure.steps.map((step, index) => (
          <li key={step.term} className="min-w-0 flex-1" style={{ marginLeft: index === 0 ? 0 : -12, zIndex: figure.steps.length - index }}>
            <div
              className="flex h-14 items-center justify-center text-[1.05rem] font-semibold text-white"
              style={{
                background: ARC[index] ?? INK,
                clipPath:
                  index === 0
                    ? "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)"
                    : "polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)",
                paddingLeft: index === 0 ? 0 : 14,
              }}
            >
              {step.term}
            </div>
          </li>
        ))}
      </ol>
      <ol className="grid gap-4 md:mt-4 md:grid-cols-4">
        {figure.steps.map((step, index) => (
          <li key={step.term}>
            <p className="font-semibold md:sr-only" style={{ color: ARC[index] ?? INK }}>
              {step.term}
            </p>
            <ul className="mt-2 space-y-1.5">
              {step.detail.split(/\s*→\s*/).map((part) => (
                <li key={part} className="leading-snug">
                  {part}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {spine ? (
        <p className="mt-4 text-center text-[0.95rem] font-medium text-[#145c3c]">↩ {spine}</p>
      ) : null}
    </Frame>
  );
}

function BoundaryPlate({ figure }: { figure: HandbookFigure }) {
  return (
    <Frame note={figure.note}>
      <div className="rounded-xl border border-[#e6eef6] bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-[0.85rem] font-medium text-[#5c6b7c]">
          <span>Morning cut</span>
          <span>Fourteen-day window must be closed</span>
        </div>
        <SplitBar />
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {figure.steps.map((step) => (
          <li key={step.term} className="flex gap-3 rounded-xl border border-[#e6eef6] bg-white p-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1ea36a] text-sm font-semibold text-white" aria-hidden="true">
              ✓
            </span>
            <span>
              <p className="font-semibold text-[#1c2430]">{step.term}</p>
              <p className="mt-1 leading-relaxed">{step.detail}</p>
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

function ContractsPlate({ figure }: { figure: HandbookFigure }) {
  return (
    <Frame note={figure.note}>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {figure.steps.map((step) => {
          const match = /^(\d+)\s+(.+)$/.exec(step.term);
          const number = Number(match?.[1] ?? 0);
          const name = match?.[2] ?? step.term;
          const body = step.detail.replace(/^→\s*/, "");
          const cut = body.indexOf(". ");
          const file = cut < 0 ? body : body.slice(0, cut);
          const rest = cut < 0 ? "" : body.slice(cut + 2);
          const color = number <= 4 ? PREPARE : number <= 6 ? FIT : number <= 8 ? SHIP : WATCH;
          return (
            <li key={step.term} className="rounded-xl border border-[#e6eef6] border-t-4 bg-white p-4" style={{ borderTopColor: color }}>
              <p className="font-mono text-[0.75rem] font-semibold tracking-[0.12em]" style={{ color }}>
                {match?.[1] ?? ""}
              </p>
              <p className="mt-1 font-semibold text-[#1c2430]">{name}</p>
              <p className="mt-2 font-mono text-[0.82rem] leading-relaxed text-[#1e3a8a]">{file}</p>
              {rest ? <p className="mt-2 leading-relaxed">{rest}</p> : null}
            </li>
          );
        })}
      </ol>
    </Frame>
  );
}

function ValidityPlate({ figure }: { figure: HandbookFigure }) {
  const columns = figure.columns ?? [];
  const colors = [PREPARE, FIT, SHIP];
  return (
    <Frame note={figure.note}>
      <ol className="grid gap-3 lg:grid-cols-3">
        {columns.map((column, index) => (
          <li key={column.term} className="rounded-xl border border-[#e6eef6] bg-white p-4">
            <p className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase" style={{ color: colors[index] ?? INK }}>
              Gate {index + 1}
            </p>
            <p className="mt-1 font-display text-xl font-semibold leading-tight text-[#1c2430]">{column.term}</p>
            <p className="mt-2 leading-relaxed">{column.detail}</p>
            <ul className="mt-3 space-y-2 border-t border-[#e6eef6] pt-3">
              {column.points.map((point) => (
                <li key={point} className="leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-center text-[0.95rem] font-medium text-[#1c2430]">Clearing one does not clear the others.</p>
    </Frame>
  );
}

function QualityPlate({ figure }: { figure: HandbookFigure }) {
  return (
    <Frame note={figure.note}>
      <ol className="grid gap-3 md:grid-cols-4">
        {figure.steps.map((step, index) => (
          <li key={step.term} className="rounded-xl border border-[#e6eef6] bg-white p-4">
            <p className="font-mono text-[0.75rem] text-[#5c6b7c]">{index + 1}</p>
            <p className="mt-1 font-semibold" style={{ color: tone(step.term) }}>
              {step.term}
            </p>
            <p className="mt-2 leading-relaxed">{step.detail}</p>
            {step.spine ? <p className="mt-3 font-medium text-[#145c3c]">{step.spine}</p> : null}
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function PassPlate({ figure }: { figure: HandbookFigure }) {
  const rows = figure.rows ?? [];
  return (
    <Frame note={figure.note}>
      <ol className="grid gap-3 lg:grid-cols-3">
        {rows.map((row, index) => {
          const cell = row.cells[0] ?? "";
          const cut = cell.indexOf(" — ");
          const file = cut < 0 ? cell : cell.slice(0, cut);
          const rest = cut < 0 ? "" : cell.slice(cut + 3);
          return (
            <li key={row.label} className="rounded-xl border border-[#e6eef6] bg-white p-4">
              <p className="font-mono text-[0.75rem] font-semibold" style={{ color: ARC[index] ?? INK }}>
                {index + 1}
              </p>
              <p className="mt-1 font-semibold text-[#1c2430]">{row.label}</p>
              <p className="mt-2 font-mono text-[0.85rem] text-[#1e3a8a]">{file}</p>
              {rest ? <p className="mt-2 leading-relaxed">{rest}</p> : null}
            </li>
          );
        })}
      </ol>
    </Frame>
  );
}

function KeepDropPlate({ figure }: { figure: HandbookFigure }) {
  const rows = figure.rows ?? [];
  const keep = rows.filter((row) => (row.cells[0] ?? "").startsWith("Keep"));
  const drop = rows.filter((row) => !(row.cells[0] ?? "").startsWith("Keep"));
  return (
    <Frame note={figure.note}>
      <div className="grid gap-3 lg:grid-cols-2">
        <ActionColumn title="Keep" tone="keep" rows={keep} />
        <ActionColumn title="Drop" tone="drop" rows={drop} />
      </div>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-[#3d4a5c]">
        A kept feature has to be built from this morning’s extract. High correlation with the label is not a keep.
      </p>
    </Frame>
  );
}

function ActionColumn({
  title,
  tone: kind,
  rows,
}: {
  title: string;
  tone: "keep" | "drop";
  rows: { label: string; cells: string[] }[];
}) {
  const keep = kind === "keep";
  return (
    <section className={`rounded-xl border p-4 ${keep ? "border-[#b7e4cd] bg-[#f3fbf6]" : "border-[#f3c7ce] bg-[#fff5f6]"}`}>
      <h3 className={`font-semibold ${keep ? "text-[#145c3c]" : "text-[#9f1239]"}`}>{title}</h3>
      <ul className="mt-3 space-y-3">
        {rows.map((row) => (
          <li key={row.label}>
            <p className="font-medium text-[#1c2430]">{row.label}</p>
            <p className="mt-0.5 leading-relaxed">{reasonOf(row.cells[0] ?? "")}</p>
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
  if (!first || !second) return <SheetPlate figure={figure} />;
  return (
    <Frame note={figure.note}>
      <div className="rounded-xl border border-[#e6eef6] bg-white p-4">
        <p className="font-semibold text-[#1c2430]">{first.term}</p>
        <p className="mt-1 leading-relaxed">{first.detail}</p>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <BranchCard label="No" branch={first.branches?.[0]} />
        <div className="rounded-xl border border-[#b7e4cd] bg-[#f3fbf6] p-4">
          <p className="text-[0.85rem] font-semibold text-[#145c3c]">{first.spine}</p>
          <p className="mt-2 font-semibold text-[#1c2430]">{second.term}</p>
          <p className="mt-1 leading-relaxed">{second.detail}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <BranchCard label="No" branch={second.branches?.[0]} />
        <div className="rounded-xl bg-[#1ea36a] p-4 text-white">
          <p className="text-[0.85rem] font-semibold">Yes</p>
          <p className="mt-2 font-semibold">{second.spine}</p>
        </div>
      </div>
    </Frame>
  );
}

function BranchCard({
  label,
  branch,
}: {
  label: string;
  branch?: { term: string; detail: string };
}) {
  if (!branch) return null;
  return (
    <div className="rounded-xl border border-[#f3c7ce] bg-[#fff5f6] p-4">
      <p className="text-[0.85rem] font-semibold text-[#9f1239]">{label}</p>
      <p className="mt-2 font-semibold text-[#1c2430]">{branch.term}</p>
      <p className="mt-1 leading-relaxed">{branch.detail}</p>
    </div>
  );
}

function FreezePlate({ figure }: { figure: HandbookFigure }) {
  const by = (term: string) => figure.steps.find((step) => step.term === term);
  const matured = by("Matured");
  const train = by("Train");
  const embargo = by("Embargo");
  const validation = by("Validation");
  const test = by("Test");
  if (!train || !validation || !test || !embargo) return <SheetPlate figure={figure} />;
  const bands = [
    { key: "train", term: train.term, detail: train.detail },
    { key: "gap-a", term: embargo.term, detail: embargo.detail },
    { key: "val", term: validation.term, detail: validation.detail },
    { key: "gap-b", term: embargo.term, detail: embargo.detail },
    { key: "test", term: test.term, detail: test.spine ? `${test.detail}. ${test.spine}.` : test.detail },
  ];
  return (
    <Frame note={figure.note}>
      {matured ? (
        <p className="font-medium text-[#145c3c]">
          {matured.term}: {matured.detail}
        </p>
      ) : null}
      <SplitBar />
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {bands
          .filter((band) => band.key !== "gap-b")
          .map((band) => (
            <li key={band.key}>
              <p className="font-semibold text-[#1c2430]">{band.term}</p>
              <p className="mt-1 leading-snug">{band.detail}</p>
            </li>
          ))}
      </ul>
    </Frame>
  );
}

function TrainPlate({ figure }: { figure: HandbookFigure }) {
  const inner = figure.steps.filter((step) => step.term !== "Validate");
  const validate = figure.steps.find((step) => step.term === "Validate");
  return (
    <Frame note={figure.note}>
      <div className="rounded-xl border border-[#b7e4cd] bg-[#f3fbf6] p-4">
        <p className="font-semibold text-[#145c3c]">Inner slice of train</p>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {inner.map((step, index) => (
            <li key={step.term} className="rounded-lg bg-white p-3">
              <p className="font-mono text-[0.75rem] text-[#5c6b7c]">{index + 1}</p>
              <p className="mt-1 font-semibold text-[#1c2430]">{step.term}</p>
              <p className="mt-1 leading-snug">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
      {validate ? (
        <div className="mt-3 rounded-xl border border-[#e6eef6] bg-white p-4">
          <p className="text-[0.85rem] font-medium text-[#5c6b7c]">After inner selection finishes — not between revisions</p>
          <p className="mt-2 font-semibold text-[#1c2430]">{validate.term}</p>
          <p className="mt-1 leading-relaxed">{validate.detail}</p>
        </div>
      ) : null}
    </Frame>
  );
}

function LoopsPlate({ figure }: { figure: HandbookFigure }) {
  return (
    <Frame note={figure.note}>
      <ol className="grid gap-3 lg:grid-cols-3">
        {figure.steps.map((step) => (
          <li key={step.term} className="flex flex-col rounded-xl border border-[#e6eef6] bg-white p-4">
            <p className="font-display text-xl font-semibold text-[#1c2430]">{step.term}</p>
            <p className="mt-2 leading-relaxed">{step.detail}</p>
            {step.spine ? <p className="mt-3 font-medium text-[#145c3c]">{step.spine}</p> : null}
            <div className="mt-auto">
              {step.branches?.map((branch) => (
                <p key={branch.term} className="mt-3 border-t border-[#f3d0d4] pt-3 leading-relaxed text-[#9f1239]">
                  <span className="font-semibold">{branch.term}. </span>
                  {branch.detail}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function MonitorPlate({ figure }: { figure: HandbookFigure }) {
  return (
    <Frame note={figure.note}>
      <ol className="space-y-3">
        {figure.steps.map((step) => (
          <li key={step.term} className="grid gap-3 rounded-xl border border-[#e6eef6] bg-white p-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
            <div>
              <p className="font-semibold text-[#1c2430]">{step.term}</p>
              <p className="mt-1 leading-relaxed">{step.detail}</p>
            </div>
            <div>
              {step.branches?.map((branch) => (
                <p key={branch.term} className="leading-relaxed">
                  <span className="font-medium text-[#9f1239]">{branch.term}. </span>
                  {branch.detail}
                </p>
              ))}
            </div>
            {step.spine ? <p className="font-medium text-[#9a4d0f]">{step.spine}</p> : null}
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function PromotePlate({ figure }: { figure: HandbookFigure }) {
  const gate = figure.steps.find((step) => step.gate);
  const left = new Set(["Intended use", "Out of scope", "Fallback"]);
  const right = new Set(["Decision owner", "Technical owner", "Evidence"]);
  const fields = figure.steps.filter((step) => !step.gate);
  const useFields = fields.filter((step) => left.has(step.term));
  const authFields = fields.filter((step) => right.has(step.term));
  const rest = fields.filter((step) => !left.has(step.term) && !right.has(step.term));
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d5e0ec] bg-[#f5f8fc]">
      <div className="grid lg:grid-cols-2">
        <FieldGroup kicker="Use" steps={useFields} />
        <FieldGroup kicker="Who answers, and the evidence already written" steps={authFields} />
      </div>
      {rest.length ? (
        <dl>
          {rest.map((step) => (
            <div key={step.term} className="grid gap-1 border-t border-[#e6eef6] bg-white px-4 py-3 sm:grid-cols-[11.5rem_minmax(0,1fr)] sm:px-5">
              <dt className="font-semibold">{step.term}</dt>
              <dd>{step.detail}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {gate ? <Gate step={gate} /> : null}
      {figure.note ? <p className="px-4 py-3 text-[0.95rem] text-[#3d4a5c] sm:px-5">{figure.note}</p> : null}
    </div>
  );
}

function FieldGroup({ kicker, steps }: { kicker: string; steps: HandbookFigureStep[] }) {
  return (
    <section className="border-b border-[#e6eef6] bg-white p-4 sm:p-5 lg:border-r lg:border-b-0">
      <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-[#5c6b7c] uppercase">{kicker}</p>
      <dl className="mt-3 space-y-3">
        {steps.map((step) => (
          <div key={step.term}>
            <dt className="font-semibold text-[#1c2430]">{step.term}</dt>
            <dd className="mt-0.5 leading-relaxed">{step.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function RiskPlate({ figure }: { figure: HandbookFigure }) {
  const rows = figure.rows ?? [];
  const wash = ["bg-white", "bg-[#eef3ff]", "bg-[#fff5f6]"];
  const mark = ["#94a3b8", PREPARE, "#9f1239"];
  return (
    <Frame note={figure.note}>
      <ol className="grid gap-3 lg:grid-cols-3">
        {rows.map((row, index) => (
          <li key={row.label} className={`rounded-xl border border-[#e6eef6] p-4 ${wash[index] ?? "bg-white"}`}>
            <p className="text-[0.72rem] font-semibold tracking-[0.14em] uppercase" style={{ color: mark[index] ?? INK }}>
              {index === 1 ? "This illustration" : `Depth ${index + 1}`}
            </p>
            <p className="mt-2 font-semibold text-[#1c2430]">{row.label}</p>
            <p className="mt-2 leading-relaxed">{row.cells[0]}</p>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function ReviewPlate({ figure }: { figure: HandbookFigure }) {
  return (
    <Frame note={figure.note}>
      <ol className="grid gap-3 md:grid-cols-4">
        {figure.steps.map((step, index) => (
          <li key={step.term} className="rounded-xl border border-[#e6eef6] border-t-4 bg-white p-4" style={{ borderTopColor: ARC[index] ?? INK }}>
            <p className="font-mono text-[0.75rem] text-[#5c6b7c]">{index + 1}</p>
            <p className="mt-1 font-semibold text-[#1c2430]">{step.term}</p>
            <p className="mt-2 leading-relaxed">{step.detail}</p>
          </li>
        ))}
      </ol>
    </Frame>
  );
}
