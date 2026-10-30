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
const MUTED = "#5c5348";
const PAPER = "#faf7f1";
const RULE = "#ddd4c6";
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

function HatchPattern({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="#e7eef5" />
        <rect width="3.2" height="8" fill="#7f93a8" />
      </pattern>
    </defs>
  );
}

function SoftArrow({ x1, y1, x2, y2, color = "#8aa0b8" }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d={`M${x2} ${y2} l-7 -4.5 v9 z`} fill={color} />
    </g>
  );
}

function ReturnArc({ label }: { label: string }) {
  return (
    <div className="mt-3">
      <svg viewBox="0 0 720 58" className="mx-auto h-12 w-full max-w-[44rem]" aria-hidden="true">
        <defs>
          <marker id="return-head" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill={FIT} />
          </marker>
        </defs>
        <path
          d="M660 10 C660 46 70 50 48 18"
          fill="none"
          stroke={FIT}
          strokeWidth="3"
          markerEnd="url(#return-head)"
        />
      </svg>
      <p className="text-center text-[1rem] font-semibold text-[#145c3c]">↩ {label}</p>
    </div>
  );
}

/** Four-color chevron ribbon — desktop and phone. */
function ChevronRibbon({ labels }: { labels: string[] }) {
  const n = labels.length;
  const w = 900;
  const h = 64;
  const gap = 4;
  const tip = 22;
  const slice = (w - tip - gap * (n - 1)) / n;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={labels.join(", ")}>
      {labels.map((label, index) => {
        const x = index * (slice + gap);
        const color = ARC[index] ?? INK;
        const first = index === 0;
        const last = index === n - 1;
        const d = last
          ? first
            ? `M${x} 0 H${x + slice + tip} V${h} H${x} Z`
            : `M${x} 0 L${x + tip} ${h / 2} L${x} ${h} H${x + slice + tip} V0 Z`
          : first
            ? `M${x} 0 H${x + slice} L${x + slice + tip} ${h / 2} L${x + slice} ${h} H${x} Z`
            : `M${x} 0 L${x + tip} ${h / 2} L${x} ${h} H${x + slice} L${x + slice + tip} ${h / 2} L${x + slice} 0 Z`;
        const textX = first ? x + slice / 2 : x + tip / 2 + slice / 2;
        return (
          <g key={label}>
            <path d={d} fill={color} />
            <text
              x={textX}
              y={h / 2 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="22"
              fontWeight="700"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ReleasePlate({ figure }: { figure: HandbookFigure }) {
  const spine = [...figure.steps].reverse().find((step) => step.spine)?.spine;
  const steps = figure.steps;
  const n = steps.length;
  const width = Math.max(720, n * 190);
  const nodeW = 150;
  const gap = (width - 80 - n * nodeW) / Math.max(n - 1, 1);
  return (
    <div>
      <div className="hidden md:block">
        <svg viewBox={`0 0 ${width} 168`} className="h-auto w-full" role="img" aria-label={figure.caption}>
          {steps.map((step, index) => {
            const x = 40 + index * (nodeW + gap);
            const color = ARC[index] ?? INK;
            const cy = 48;
            return (
              <g key={step.term}>
                {index < n - 1 ? (
                  <SoftArrow x1={x + nodeW + 4} y1={cy} x2={x + nodeW + gap - 8} y2={cy} color="#9aabbc" />
                ) : null}
                <rect x={x} y={cy - 26} width={nodeW} height={52} rx="26" fill={color} />
                <text
                  x={x + nodeW / 2}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="18"
                  fontWeight="700"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {step.term}
                </text>
                <text
                  x={x + nodeW / 2}
                  y={cy + 44}
                  textAnchor="middle"
                  fill={INK}
                  fontSize="15"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {step.detail.length > 28 ? `${step.detail.slice(0, 26)}…` : step.detail}
                </text>
                {step.term === "Gate" ? (
                  <>
                    <rect x={x + 8} y={cy + 58} width={64} height={22} rx="11" fill="#e7f6ee" />
                    <text x={x + 40} y={cy + 70} textAnchor="middle" dominantBaseline="middle" fill="#145c3c" fontSize="12" fontWeight="600">
                      approved
                    </text>
                    <rect x={x + 78} y={cy + 58} width={48} height={22} rx="11" fill="#fff1f2" />
                    <text x={x + 102} y={cy + 70} textAnchor="middle" dominantBaseline="middle" fill={DROP} fontSize="12" fontWeight="600">
                      held
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}
          {spine ? (
            <>
              <path
                d={`M${40 + (n - 1) * (nodeW + gap) + nodeW / 2} 140 C ${width - 40} 168, 80 168, ${40 + nodeW / 2} 140`}
                fill="none"
                stroke={FIT}
                strokeWidth="3"
              />
              <path d={`M${40 + nodeW / 2} 140 l-7 8 l14 0 z`} fill={FIT} />
              <text
                x={width / 2}
                y={162}
                textAnchor="middle"
                fill="#145c3c"
                fontSize="14"
                fontWeight="700"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                ↩ {spine}
              </text>
            </>
          ) : null}
        </svg>
      </div>
      <ol className="flex flex-col gap-2 md:hidden">
        {steps.map((step, index) => (
          <li key={step.term} className="flex flex-col items-center">
            <div
              className="w-full max-w-[20rem] rounded-full px-5 py-3 text-center text-white"
              style={{ background: ARC[index] ?? INK }}
            >
              <p className="font-semibold">{step.term}</p>
              <p className="mt-0.5 text-[0.95rem] opacity-95">{step.detail}</p>
            </div>
            {step.term === "Gate" ? (
              <div className="mt-2 flex gap-2">
                <GatePills detail={step.detail} />
              </div>
            ) : null}
            {index < steps.length - 1 ? <span className="py-1 text-[1.35rem] text-[#8aa0b8]">↓</span> : null}
          </li>
        ))}
      </ol>
      {spine ? <div className="md:hidden"><ReturnArc label={spine} /></div> : null}
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
  const labels = figure.steps.map((step) => step.term);
  return (
    <div>
      <ChevronRibbon labels={labels} />
      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 md:grid-cols-4">
        {figure.steps.map((step, index) => (
          <ol key={step.term} className="min-w-0 space-y-1.5 border-t-4 pt-3" style={{ borderColor: ARC[index] }}>
            {step.detail.split(/\s*→\s*/).map((part, partIndex) => (
              <li key={part} className="flex gap-2 leading-snug">
                <span className="font-semibold tabular-nums" style={{ color: ARC[index] ?? INK }}>
                  {partIndex + 1}.
                </span>
                <span>{part.charAt(0).toUpperCase() + part.slice(1)}</span>
              </li>
            ))}
          </ol>
        ))}
      </div>
      {spine ? <ReturnArc label={spine} /> : null}
      <Note>{figure.note}</Note>
    </div>
  );
}

function BriefFlow({ figure, highlight }: { figure: HandbookFigure; highlight?: string }) {
  return (
    <div>
      <div className="overflow-hidden rounded-[1.1rem] border" style={{ borderColor: RULE, background: PAPER }}>
        <dl>
          {figure.steps.map((step) => {
            const dark = Boolean(step.gate);
            const lit = step.term === highlight;
            return (
              <div
                key={step.term}
                className="grid gap-1 border-b px-4 py-3 last:border-b-0 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-5 sm:px-5"
                style={{
                  borderColor: RULE,
                  background: dark ? INK : lit ? "#eef3ff" : PAPER,
                  color: dark ? "#f4efe6" : INK,
                }}
              >
                <dt className="font-semibold" style={{ color: dark ? "#f0c9a0" : lit ? PREPARE : INK }}>
                  {step.term}
                </dt>
                <dd className="leading-relaxed">{step.detail}</dd>
              </div>
            );
          })}
        </dl>
      </div>
      <Note>{figure.note}</Note>
    </div>
  );
}

function StageFlow({ figure }: { figure: HandbookFigure }) {
  const main = figure.steps.filter((step) => !step.gate);
  const fail = figure.steps.find((step) => step.gate);
  return (
    <div>
      <ol className="mx-auto flex max-w-[36rem] flex-col items-center">
        {main.map((step, index) => (
          <li key={step.term} className="flex w-full flex-col items-center">
            <div
              className="w-full rounded-[1.4rem] border-2 px-5 py-3 text-center"
              style={{ borderColor: index === 0 ? PREPARE : FIT, background: PAPER }}
            >
              <p className="text-[0.78rem] font-semibold tracking-[0.12em] uppercase" style={{ color: index === 0 ? PREPARE : FIT }}>
                {step.term}
              </p>
              <p className="mt-1 leading-snug">{step.detail}</p>
            </div>
            {index < main.length - 1 ? <ConnectorDown /> : null}
          </li>
        ))}
      </ol>
      {fail ? (
        <div className="mx-auto mt-3 flex max-w-[36rem] items-start gap-3 border-l-4 pl-4" style={{ borderColor: DROP }}>
          <span className="mt-0.5 font-semibold" style={{ color: DROP }} aria-hidden="true">
            ✕
          </span>
          <p className="leading-snug">
            <span className="font-semibold" style={{ color: DROP }}>
              {fail.term}.{" "}
            </span>
            {fail.detail}
          </p>
        </div>
      ) : null}
      <Note>{figure.note}</Note>
    </div>
  );
}

function ConnectorDown() {
  return (
    <svg width="24" height="28" viewBox="0 0 24 28" className="my-1" aria-hidden="true">
      <line x1="12" y1="2" x2="12" y2="20" stroke="#9aabbc" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 24 l-6 -7 h12 z" fill="#9aabbc" />
    </svg>
  );
}

function TestFlow({ figure }: { figure: HandbookFigure }) {
  const main = figure.steps.filter((step) => !step.gate);
  const status = figure.steps.find((step) => step.gate);
  const outcomes = status?.detail.split(/\s*;\s*/) ?? [];
  return (
    <div>
      <ol className="flex flex-col md:flex-row md:items-stretch">
        {main.map((step, index) => (
          <li key={step.term} className="flex min-w-0 flex-1 flex-col items-center md:flex-row">
            <div
              className="w-full rounded-[1.4rem] border-2 px-4 py-3 text-center"
              style={{ borderColor: ARC[index] ?? INK, background: PAPER }}
            >
              <p className="text-[0.78rem] font-semibold tracking-[0.12em] uppercase" style={{ color: ARC[index] ?? MUTED }}>
                {step.term}
              </p>
              <p className="mt-1 leading-snug">{step.detail}</p>
            </div>
            {index < main.length - 1 ? (
              <span className="py-1 text-[1.35rem] text-[#8aa0b8] md:px-2 md:py-0" aria-hidden="true">
                <span className="md:hidden">↓</span>
                <span className="hidden md:inline">→</span>
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {status ? (
        <div className="mt-4">
          <p className="text-center text-[0.82rem] font-semibold tracking-[0.12em] uppercase" style={{ color: MUTED }}>
            {status.term}
          </p>
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
          <li key={step.term} className="flex min-w-0 flex-1 flex-col items-center md:flex-row md:items-start">
            <div className="min-w-0 flex-1 text-center">
              <span
                className="mx-auto grid h-11 w-11 place-items-center rounded-full text-[1.05rem] font-semibold text-white"
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
              <span className="py-1 text-[1.35rem] text-[#8aa0b8] md:px-1 md:pt-2" aria-hidden="true">
                <span className="md:hidden">↓</span>
                <span className="hidden md:inline">→</span>
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {spine ? <p className="mt-4 text-center text-[1rem] font-semibold text-[#145c3c]">→ {spine}</p> : null}
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
            <li key={row.label} className="flex min-w-0 flex-1 flex-col items-center md:flex-row md:items-start">
              <div className="min-w-0 flex-1 text-center">
                <span
                  className="mx-auto grid h-11 w-11 place-items-center rounded-full text-[1.05rem] font-semibold text-white"
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
                <span className="py-1 text-[1.35rem] text-[#8aa0b8] md:px-1 md:pt-2" aria-hidden="true">
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
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
      <svg viewBox="0 0 900 210" className="hidden h-auto w-full md:block" role="img" aria-label={figure.caption}>
        <HatchPattern id="embargo-hatch" />
        <text x="8" y="22" fill={MUTED} fontSize="14" fontWeight="600" fontFamily="ui-sans-serif, system-ui, sans-serif">
          Morning cut
        </text>
        <text x="450" y="22" textAnchor="middle" fill={MUTED} fontSize="14" fontWeight="600" fontFamily="ui-sans-serif, system-ui, sans-serif">
          14-day outcome window
        </text>
        <text x="892" y="22" textAnchor="end" fill={MUTED} fontSize="14" fontWeight="600" fontFamily="ui-sans-serif, system-ui, sans-serif">
          Window closed
        </text>
        <line x1="12" y1="36" x2="888" y2="36" stroke="#d5deea" strokeWidth="4" strokeLinecap="round" />
        <line x1="12" y1="36" x2="700" y2="36" stroke={PREPARE} strokeWidth="4" strokeLinecap="round" />
        <circle cx="12" cy="36" r="7" fill={PREPARE} />
        <circle cx="700" cy="36" r="7" fill={INK} />

        <rect x="12" y="64" width="520" height="52" rx="8" fill={FIT} />
        <text x="272" y="94" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
          Train
        </text>
        <rect x="532" y="64" width="44" height="52" fill="url(#embargo-hatch)" />
        <rect x="576" y="64" width="120" height="52" rx="8" fill={SHIP} />
        <text x="636" y="94" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
          Validation
        </text>
        <rect x="696" y="64" width="44" height="52" fill="url(#embargo-hatch)" />
        <rect x="740" y="64" width="148" height="52" rx="8" fill={INK} />
        <text x="814" y="94" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
          Test
        </text>
        <text x="12" y="142" fill={MUTED} fontSize="13" fontFamily="ui-sans-serif, system-ui, sans-serif">
          Hatched gaps are label_delay_days at both boundaries. Widths show the roles, not a measured share of rows.
        </text>

        {figure.steps.map((step, index) => {
          const col = index % 2;
          const row = Math.floor(index / 2);
          const x = 12 + col * 450;
          const y = 164 + row * 22;
          return (
            <g key={step.term}>
              <circle cx={x + 8} cy={y - 4} r="8" fill={FIT} />
              <path d={`M${x + 4} ${y - 4} l3 3 l6 -7`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <text x={x + 24} y={y} fill={INK} fontSize="14" fontFamily="ui-sans-serif, system-ui, sans-serif">
                <tspan fontWeight="700">{step.term}. </tspan>
                {step.detail}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="md:hidden">
        <p className="flex justify-between text-[0.9rem] font-semibold" style={{ color: MUTED }}>
          <span>Morning cut</span>
          <span>Window closed</span>
        </p>
        <PartitionBar />
        <ul className="mt-3 space-y-2">
          {figure.steps.map((step) => (
            <li key={step.term} className="flex gap-2">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.75rem] text-white" style={{ background: FIT }}>
                ✓
              </span>
              <p className="leading-snug">
                <span className="font-semibold">{step.term}. </span>
                {step.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <Note>{figure.note}</Note>
    </div>
  );
}

function PartitionBar() {
  return (
    <div className="mt-2">
      <div className="flex h-12 overflow-hidden rounded-lg text-[0.9rem] font-semibold text-white" aria-hidden="true">
        <div className="flex flex-[8] items-center justify-center" style={{ background: FIT }}>
          Train
        </div>
        <div
          className="w-8 shrink-0 sm:w-10"
          style={{ background: "repeating-linear-gradient(135deg, #7f93a8 0 4px, #e7eef5 4px 8px)" }}
        />
        <div className="flex flex-[2] items-center justify-center px-1 text-center leading-tight" style={{ background: SHIP }}>
          <span className="hidden sm:inline">Val</span>
        </div>
        <div
          className="w-8 shrink-0 sm:w-10"
          style={{ background: "repeating-linear-gradient(135deg, #7f93a8 0 4px, #e7eef5 4px 8px)" }}
        />
        <div className="flex flex-[2] items-center justify-center" style={{ background: INK }}>
          Test
        </div>
      </div>
      <p className="mt-2 text-[0.92rem] leading-relaxed text-[#3e3933]">
        Hatched gaps are label_delay_days at both boundaries. Widths show the roles, not a measured share of rows.
      </p>
    </div>
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
  /** Snake positions: 1-2-3 / 6-5-4 / 7-8-9 */
  const order = [0, 1, 2, 5, 4, 3, 6, 7, 8];
  const positions = order.map((sourceIndex, visualIndex) => {
    const row = Math.floor(visualIndex / 3);
    const colInRow = visualIndex % 3;
    const col = row % 2 === 1 ? 2 - colInRow : colInRow;
    return { sourceIndex, x: 90 + col * 260, y: 70 + row * 150 };
  });
  return (
    <div>
      <svg viewBox="0 0 900 460" className="hidden h-auto w-full md:block" role="img" aria-label={figure.caption}>
        {positions.slice(0, -1).map((from, index) => {
          const to = positions[index + 1]!;
          return (
            <line
              key={`edge-${index}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#c5d0de"
              strokeWidth="6"
              strokeLinecap="round"
            />
          );
        })}
        {positions.map(({ sourceIndex, x, y }) => {
          const node = nodes[sourceIndex]!;
          return (
            <g key={node.number}>
              <circle cx={x} cy={y} r="28" fill={node.color} />
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize="18"
                fontWeight="700"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {node.number}
              </text>
              <text
                x={x}
                y={y + 48}
                textAnchor="middle"
                fill={INK}
                fontSize="16"
                fontWeight="700"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {node.name}
              </text>
              <text
                x={x}
                y={y + 70}
                textAnchor="middle"
                fill="#1e3a8a"
                fontSize="12"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              >
                {node.file.length > 34 ? `${node.file.slice(0, 32)}…` : node.file}
              </text>
            </g>
          );
        })}
      </svg>
      <ol className="relative ml-3 space-y-5 border-l-[3px] border-[#d5deea] py-1 md:hidden">
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
      <div className="mt-3 hidden grid-cols-3 gap-4 md:grid">
        {nodes.map((node) => (
          <p key={`rest-${node.number}`} className="text-[0.9rem] leading-snug text-[#3e3933]">
            <span className="font-semibold" style={{ color: node.color }}>
              {node.number}. {node.name}.{" "}
            </span>
            {node.rest}
          </p>
        ))}
      </div>
      <Note>{figure.note}</Note>
    </div>
  );
}

function ValidityPlate({ figure }: { figure: HandbookFigure }) {
  const columns = figure.columns ?? [];
  const colors = [PREPARE, FIT, SHIP];
  return (
    <div>
      <svg viewBox="0 0 640 420" className="mx-auto hidden h-auto w-full max-w-[40rem] md:block" role="img" aria-label={figure.caption}>
        <circle cx="220" cy="170" r="130" fill="rgba(59,111,240,0.18)" stroke={PREPARE} strokeWidth="3" />
        <circle cx="420" cy="170" r="130" fill="rgba(122,90,240,0.16)" stroke={SHIP} strokeWidth="3" />
        <circle cx="320" cy="280" r="130" fill="rgba(30,163,106,0.18)" stroke={FIT} strokeWidth="3" />
        <text x="150" y="120" textAnchor="middle" fill={PREPARE} fontSize="16" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
          {columns[0]?.term ?? "Model validity"}
        </text>
        <text x="490" y="120" textAnchor="middle" fill={SHIP} fontSize="16" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
          {columns[2]?.term ?? "Decision value"}
        </text>
        <text x="320" y="355" textAnchor="middle" fill={FIT} fontSize="16" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
          {columns[1]?.term ?? "Operational validity"}
        </text>
        <text x="320" y="220" textAnchor="middle" fill={INK} fontSize="18" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
          All three
        </text>
      </svg>
      <div className="flex flex-col items-center md:hidden" aria-hidden="true">
        {columns.map((column, index) => (
          <div
            key={column.term}
            className={`grid h-40 w-40 place-items-center rounded-full border-2 px-4 text-center ${index ? "-mt-8" : ""}`}
            style={{
              borderColor: colors[index],
              background: index === 0 ? "rgba(59,111,240,0.16)" : index === 1 ? "rgba(30,163,106,0.18)" : "rgba(122,90,240,0.16)",
            }}
          >
            <div>
              <p className="font-semibold leading-tight" style={{ color: colors[index] }}>
                {column.term}
              </p>
              <p className="mt-1 text-[0.9rem] leading-snug">{column.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-5 grid gap-5 md:grid-cols-3">
        {columns.map((column, index) => (
          <li key={column.term}>
            <p className="font-semibold" style={{ color: colors[index] }}>
              {column.term}
            </p>
            <p className="mt-1 text-[0.95rem] leading-snug text-[#3e3933]">{column.detail}</p>
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
        <span className="grid h-11 w-11 place-items-center rounded-full text-[1.3rem] text-white" style={{ background: color }} aria-hidden="true">
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
    <div className="rounded-full border-2 border-[#1b1814] px-5 py-3 text-center" style={{ background: PAPER }}>
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
      <svg viewBox="0 0 900 210" className="hidden h-auto w-full md:block" role="img" aria-label={figure.caption}>
        <HatchPattern id="freeze-hatch" />
        {matured ? (
          <>
            <rect x="12" y="12" width="876" height="44" rx="8" fill={FIT} />
            <text x="450" y="40" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
              {matured.term} — {matured.detail}
            </text>
          </>
        ) : null}
        <rect x="12" y="72" width="500" height="56" rx="8" fill={FIT} />
        <text x="262" y="106" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
          {train.term}
        </text>
        <rect x="512" y="72" width="48" height="56" fill="url(#freeze-hatch)" />
        <rect x="560" y="72" width="120" height="56" rx="8" fill={SHIP} />
        <text x="620" y="106" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
          {validation.term}
        </text>
        <rect x="680" y="72" width="48" height="56" fill="url(#freeze-hatch)" />
        <rect x="728" y="72" width="160" height="56" rx="8" fill={INK} />
        <text x="808" y="106" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
          {test.term}
        </text>
        <text x="12" y="156" fill={INK} fontSize="14" fontFamily="ui-sans-serif, system-ui, sans-serif">
          <tspan fontWeight="700">{train.term}. </tspan>
          {train.detail}
          <tspan dx="18" fontWeight="700">
            {embargo.term}.{" "}
          </tspan>
          {embargo.detail}
        </text>
        <text x="12" y="180" fill={INK} fontSize="14" fontFamily="ui-sans-serif, system-ui, sans-serif">
          <tspan fontWeight="700">{validation.term}. </tspan>
          {validation.detail}
          <tspan dx="18" fontWeight="700">
            {test.term}.{" "}
          </tspan>
          {testLine}
        </text>
        <text x="12" y="202" fill={MUTED} fontSize="13" fontFamily="ui-sans-serif, system-ui, sans-serif">
          Widths show the roles, not a measured share of rows.
        </text>
      </svg>
      <div className="md:hidden">
        {matured ? (
          <div className="mb-3 flex h-11 items-center rounded-lg px-4 font-semibold text-white" style={{ background: FIT }}>
            {matured.term} — {matured.detail}
          </div>
        ) : null}
        <PartitionBar />
        <ul className="mt-3 space-y-1.5 text-[0.98rem] leading-snug">
          <li>
            <span className="font-semibold">{train.term}. </span>
            {train.detail}
          </li>
          <li>
            <span className="font-semibold">{embargo.term}. </span>
            {embargo.detail}
          </li>
          <li>
            <span className="font-semibold">{validation.term}. </span>
            {validation.detail}
          </li>
          <li>
            <span className="font-semibold">{test.term}. </span>
            {testLine}
          </li>
        </ul>
      </div>
      <Note>{figure.note}</Note>
    </div>
  );
}

function TrainPlate({ figure }: { figure: HandbookFigure }) {
  const inner = figure.steps.filter((step) => step.term !== "Validate");
  const validate = figure.steps.find((step) => step.term === "Validate");
  const n = inner.length;
  return (
    <div>
      <svg viewBox="0 0 900 320" className="hidden h-auto w-full md:block" role="img" aria-label={figure.caption}>
        <rect x="20" y="20" width="860" height="200" rx="28" fill="rgba(30,163,106,0.06)" stroke={FIT} strokeWidth="3" strokeDasharray="10 8" />
        <text x="450" y="48" textAnchor="middle" fill="#145c3c" fontSize="14" fontWeight="700" letterSpacing="1.5" fontFamily="ui-sans-serif, system-ui, sans-serif">
          INNER SLICE OF TRAIN
        </text>
        {inner.map((step, index) => {
          const x = 70 + index * 160;
          return (
            <g key={step.term}>
              {index < n - 1 ? <SoftArrow x1={x + 118} y1={100} x2={x + 148} y2={100} color="#9aabbc" /> : null}
              <rect x={x} y={78} width={110} height="44" rx="22" fill={FIT} />
              <text x={x + 55} y={103} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
                {step.term}
              </text>
              <text
                x={x + 55}
                y={148}
                textAnchor="middle"
                fill={INK}
                fontSize="12"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {step.detail.length > 28 ? `${step.detail.slice(0, 26)}…` : step.detail}
              </text>
            </g>
          );
        })}
        <path d="M780 170 C780 210 120 210 120 170" fill="none" stroke={FIT} strokeWidth="2.5" />
        <path d="M120 170 l-7 8 l14 0 z" fill={FIT} />
        <text x="450" y="200" textAnchor="middle" fill="#145c3c" fontSize="13" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
          Inner trials and feature loops
        </text>
        {validate ? (
          <>
            <line x1="450" y1="224" x2="450" y2="248" stroke={SHIP} strokeWidth="3" />
            <path d="M450 256 l-7 -8 h14 z" fill={SHIP} />
            <rect x="280" y="262" width="340" height="48" rx="24" fill={SHIP} />
            <text x="450" y="282" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">
              {validate.term}
            </text>
            <text x="450" y="300" textAnchor="middle" fill="#efe8ff" fontSize="12" fontFamily="ui-sans-serif, system-ui, sans-serif">
              {validate.detail}
            </text>
          </>
        ) : null}
      </svg>
      <div className="md:hidden">
        <div className="rounded-[1.5rem] border-2 border-dashed px-3 py-4" style={{ borderColor: FIT }}>
          <p className="text-center text-[0.85rem] font-semibold tracking-[0.14em] text-[#145c3c] uppercase">Inner slice of train</p>
          <ol className="mt-3 flex flex-col items-center">
            {inner.map((step, index) => (
              <li key={step.term} className="flex w-full flex-col items-center">
                <div className="w-full max-w-[18rem] rounded-full px-4 py-2 text-center font-semibold text-white" style={{ background: FIT }}>
                  {step.term}
                </div>
                <p className="mt-1 px-2 text-center text-[0.95rem] leading-snug">{step.detail}</p>
                {index < inner.length - 1 ? <span className="py-1 text-[#8aa0b8]">↓</span> : null}
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
            <div className="mt-1 w-full max-w-[22rem] rounded-full px-5 py-3 text-center text-white" style={{ background: SHIP }}>
              <p className="font-semibold">{validate.term}</p>
              <p className="mt-0.5 text-[0.98rem] leading-snug">{validate.detail}</p>
            </div>
          </div>
        ) : null}
      </div>
      <Note>{figure.note}</Note>
    </div>
  );
}

function LoopsPlate({ figure }: { figure: HandbookFigure }) {
  return (
    <div>
      <ol className="flex flex-col gap-3 md:flex-row md:items-stretch">
        {figure.steps.map((step, index) => (
          <li key={step.term} className="flex min-w-0 flex-1 flex-col md:flex-row">
            <div className="min-w-0 flex-1">
              <div className="rounded-full px-4 py-3 text-center font-semibold text-white" style={{ background: ARC[index] ?? INK }}>
                {step.term}
              </div>
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
              <span className="grid place-items-center py-2 text-[1.35rem] text-[#8aa0b8] md:px-2 md:pt-3" aria-hidden="true">
                <span className="md:hidden">↓</span>
                <span className="hidden md:inline">→</span>
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-[0.98rem]">
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
      </div>
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
        <div className="flex flex-col items-center justify-center gap-2 md:w-48 md:shrink-0">
          <svg viewBox="0 0 120 40" className="h-8 w-28 md:hidden" aria-hidden="true">
            <line x1="60" y1="4" x2="60" y2="28" stroke={SHIP} strokeWidth="3" />
            <path d="M60 36 l-7 -9 h14 z" fill={SHIP} />
          </svg>
          <svg viewBox="0 0 120 40" className="hidden h-8 w-28 md:block" aria-hidden="true">
            <line x1="8" y1="20" x2="96" y2="20" stroke={SHIP} strokeWidth="3" />
            <path d="M108 20 l-10 -7 v14 z" fill={SHIP} />
          </svg>
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
    <section className="min-w-0 flex-1 rounded-[1.1rem] border px-4 py-4 sm:px-5" style={{ borderColor: RULE, background: PAPER }}>
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
              className="min-w-0 flex-1 rounded-[1.5rem] border-2 px-4 py-3 text-center"
              style={{
                borderColor: colors[index],
                background: index === rows.length - 1 ? "#fff5f6" : PAPER,
              }}
            >
              <p className="font-semibold" style={{ color: index === rows.length - 1 ? DROP : INK }}>
                {row.label}
              </p>
              <p className="mt-1 leading-snug">{row.cells[0]}</p>
            </div>
            {index < rows.length - 1 ? (
              <span className="grid place-items-center py-1 text-[1.35rem] text-[#8aa0b8] md:px-2" aria-hidden="true">
                <span className="md:hidden">↓</span>
                <span className="hidden md:inline">→</span>
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
  const labels = figure.steps.map((step) => step.term);
  return (
    <div>
      <ChevronRibbon labels={labels} />
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        {figure.steps.map((step, index) =>
          index < last ? (
            <p key={step.term} className="text-center leading-snug">
              {step.detail}
            </p>
          ) : null,
        )}
      </div>
      {figure.steps[last] ? <ReturnArc label={figure.steps[last].detail} /> : null}
      <Note>{figure.note}</Note>
    </div>
  );
}
