import { useId, type CSSProperties } from "react";
import type { HandbookFigure, HandbookFigureStep, HandbookMark } from "@/content/handbooks";
import { IconPaths } from "@/components/handbooks/icon-paths";

const PASS = "#34d399";
const FAIL = "#fb7185";
const CARD_W = 220;
const CARD_H = 108;

type Ink = "pass" | "red" | "cyan" | "ink";

function Glyph({ name, tone = "pass", size = 18 }: { name?: HandbookMark; tone?: Ink; size?: number }) {
  const iconTone = tone === "pass" ? "pass" : tone === "red" ? "red" : tone === "ink" ? "ink" : "cyan";
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden style={{ display: "block", flexShrink: 0 }}>
      <IconPaths name={name} tone={iconTone} />
    </svg>
  );
}

function ringSteps(figure: HandbookFigure) {
  const wanted: HandbookMark[] = ["refresh", "code", "gear", "merge", "pulse"];
  const ordered = wanted
    .map((mark) => figure.steps.find((step) => step.mark === mark))
    .filter((step): step is HandbookFigureStep => Boolean(step));
  if (ordered.length >= 5) return ordered.slice(0, 5);
  return figure.steps.filter((step) => step.mark !== "wrench").slice(0, 5);
}

const face: CSSProperties = {
  boxSizing: "border-box",
  height: "100%",
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  borderRadius: 14,
  border: "1px solid rgba(226,232,240,0.16)",
  background: "#0c1420",
  padding: "12px 12px 12px 12px",
  fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
  boxShadow: "0 16px 32px -22px rgba(0,0,0,0.9)",
};

const badge: CSSProperties = {
  display: "flex",
  width: 26,
  height: 26,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  background: PASS,
  color: "#052e16",
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1,
};

export function LoopPlate({ figure }: { figure: HandbookFigure }) {
  const steps = ringSteps(figure);
  const repair = figure.steps.find((step) => step.mark === "wrench");
  const rawId = useId().replace(/:/g, "");
  const seats = [
    { n: 1, x: 278, y: 6 },
    { n: 2, x: 548, y: 28 },
    { n: 3, x: 548, y: 220 },
    { n: 4, x: 246, y: 386 },
    { n: 5, x: 14, y: 156 },
  ];
  const boxes = seats.map((seat) => ({
    ...seat,
    step: steps[seat.n - 1],
    l: seat.x,
    t: seat.y,
    r: seat.x + CARD_W,
    b: seat.y + CARD_H,
    cx: seat.x + CARD_W / 2,
    cy: seat.y + CARD_H / 2,
  }));
  const pull = boxes[0];
  const change = boxes[1];
  const test = boxes[2];
  const integrate = boxes[3];
  const verify = boxes[4];
  const repairY = (integrate?.b ?? 540) + 72;
  const viewW = 840;
  const viewH = repairY + 112;
  const legs = pull && change && test && integrate && verify
    ? [
        `M ${pull.r - 2} ${pull.t + 30} Q ${(pull.r + change.l) / 2} ${Math.min(pull.t, change.t) - 6} ${change.l - 12} ${change.t + 34}`,
        `M ${change.cx} ${change.b + 2} Q ${(change.cx + test.cx) / 2 + 28} ${(change.b + test.t) / 2} ${test.cx} ${test.t - 12}`,
        `M ${test.l + 8} ${test.b - 8} Q ${(test.l + integrate.r) / 2 - 10} ${(test.b + integrate.t) / 2} ${integrate.r + 12} ${integrate.t + 32}`,
        `M ${integrate.l + 8} ${integrate.t + 28} Q ${verify.cx - 10} ${(integrate.t + verify.b) / 2} ${verify.cx} ${verify.b + 12}`,
        `M ${verify.cx + 8} ${verify.t} Q ${(verify.r + pull.l) / 2 - 30} ${verify.t - 78} ${pull.l - 12} ${pull.t + 42}`,
      ]
    : [];
  const labelX = verify && test ? (verify.r + test.l) / 2 : 400;
  const labelY = change && integrate ? (change.b + integrate.t) / 2 - 8 : 230;

  return (
    <div data-handbook-plate="loop">
      <ul className="flex list-none flex-col gap-2 sm:hidden">
        {boxes.map((box) =>
          box.step ? (
            <li key={box.step.term}>
              <Face n={box.n} step={box.step} />
            </li>
          ) : null,
        )}
      </ul>
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="hidden h-auto w-full sm:block"
      >
        <defs>
          <marker id={`${rawId}-pass`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" fill={PASS} />
          </marker>
          <marker id={`${rawId}-fail`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" fill={FAIL} />
          </marker>
          <marker id={`${rawId}-next`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" fill="#cbd5e1" />
          </marker>
        </defs>
        {legs.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={PASS}
            strokeWidth="2.4"
            strokeLinecap="round"
            markerEnd={`url(#${rawId}-pass)`}
          />
        ))}
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          fill={PASS}
          fontSize="13"
          letterSpacing="3.4"
          fontFamily="var(--font-mono), ui-monospace, monospace"
        >
          THE DAILY LOOP
        </text>
        <text
          x={labelX}
          y={labelY + 24}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="15"
          fontFamily="var(--font-sans), ui-sans-serif, system-ui, sans-serif"
        >
          Merge today.
        </text>
        <text
          x={labelX}
          y={labelY + 44}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="13"
          fontFamily="var(--font-sans), ui-sans-serif, system-ui, sans-serif"
        >
          The integration build counts.
        </text>
        {integrate ? (
          <path
            d={`M 24 ${integrate.b + 28} H ${viewW - 24}`}
            fill="none"
            stroke="rgba(226,232,240,0.28)"
            strokeWidth="1.4"
            strokeDasharray="5 6"
          />
        ) : null}
        {integrate ? (
          <path
            d={`M ${integrate.cx - 16} ${integrate.b + 6} C 220 ${repairY - 36}, 181 ${repairY - 28}, 181 ${repairY - 8}`}
            fill="none"
            stroke={FAIL}
            strokeWidth="2.2"
            strokeLinecap="round"
            markerEnd={`url(#${rawId}-fail)`}
          />
        ) : null}
        {repair ? (
          <path
            d={`M 352 ${repairY + 50} H 418`}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeLinecap="round"
            markerEnd={`url(#${rawId}-next)`}
          />
        ) : null}
        {change && test ? (
          <path
            d={`M 748 ${repairY + 18} C 824 ${(repairY + change.cy) / 2}, 824 ${change.cy}, ${change.r + 12} ${change.cy}`}
            fill="none"
            stroke={PASS}
            strokeWidth="2.2"
            strokeLinecap="round"
            markerEnd={`url(#${rawId}-pass)`}
          />
        ) : null}
        {boxes.map((box) =>
          box.step ? (
            <foreignObject key={box.step.term} x={box.x} y={box.y} width={CARD_W} height={CARD_H}>
              <div style={{ width: CARD_W, height: CARD_H }}>
                <Face n={box.n} step={box.step} />
              </div>
            </foreignObject>
          ) : null,
        )}
        <foreignObject x={16} y={repairY} width={330} height={100}>
          <div style={{ width: 330, height: 100 }}>
            <BranchFace
              tone="fail"
              mark="alert"
              title="Main is red?"
              detail="Stop integration."
            />
          </div>
        </foreignObject>
        {repair ? (
          <foreignObject x={430} y={repairY} width={330} height={100}>
            <div style={{ width: 330, height: 100 }}>
              <BranchFace tone="pass" mark="wrench" title={repair.term} detail={repair.detail} />
            </div>
          </foreignObject>
        ) : null}
      </svg>
      {repair ? (
        <div className="mt-3 flex flex-col gap-2 sm:hidden">
          <BranchFace tone="fail" mark="alert" title="Main is red?" detail="Stop integration." />
          <BranchFace tone="pass" mark="wrench" title={repair.term} detail={repair.detail} />
        </div>
      ) : null}
    </div>
  );
}

function Face({ n, step }: { n: number; step: HandbookFigureStep }) {
  const mark = step.mark === "pulse" ? "check" : step.mark;
  return (
    <div style={face}>
      <span style={badge}>{n}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Glyph name={mark} size={16} />
          <span style={{ fontSize: 15, fontWeight: 650, lineHeight: 1.2, color: "#f8fafc" }}>{step.term}</span>
        </span>
        <span style={{ display: "block", marginTop: 4, fontSize: 12, lineHeight: 1.35, color: "#94a3b8" }}>{step.detail}</span>
      </span>
    </div>
  );
}

function BranchFace({
  tone,
  mark,
  title,
  detail,
}: {
  tone: "fail" | "pass";
  mark: HandbookMark;
  title: string;
  detail: string;
}) {
  const failed = tone === "fail";
  return (
    <div
      style={{
        ...face,
        alignItems: "center",
        border: failed ? "1px solid rgba(251,113,133,0.9)" : "1px solid rgba(226,232,240,0.16)",
        background: failed ? "#3a121c" : "#0c1420",
        boxShadow: failed ? "0 0 28px -12px rgba(251,113,133,0.95)" : face.boxShadow,
      }}
    >
      <span
        style={{
          display: "flex",
          width: 36,
          height: 36,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          border: failed ? "1px solid rgba(251,113,133,0.8)" : "1px solid rgba(52,211,153,0.45)",
          background: failed ? "#2a0c14" : "#07140f",
        }}
      >
        <Glyph name={mark} tone={failed ? "red" : "pass"} />
      </span>
      <span>
        <span style={{ display: "block", fontSize: 15, fontWeight: 650, color: "#f8fafc" }}>{title}</span>
        <span style={{ display: "block", marginTop: 2, fontSize: 12, lineHeight: 1.35, color: failed ? "#fecdd3" : "#94a3b8" }}>
          {detail}
        </span>
      </span>
    </div>
  );
}

export function RecoveryPlate({ figure }: { figure: HandbookFigure }) {
  return (
    <div data-handbook-plate="recovery">
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[minmax(0,1fr)_11.5rem]">
        {figure.steps.map((step, index) => (
          <div key={step.term} className="col-start-1">
            {index > 0 ? <DownMark into={step.mark === "check" ? "pass" : "neutral"} /> : null}
            <RecoveryCard step={step} />
          </div>
        ))}
        <div className="col-start-2 row-start-2 row-span-3 hidden sm:block">
          <ReturnNote />
        </div>
      </div>
      <p className="mt-3 rounded-xl border border-dashed border-white/25 px-3 py-3 text-xs leading-relaxed text-slate-300 sm:hidden">
        The fix or the revert still lands. The failure is not left in place.
      </p>
    </div>
  );
}

function RecoveryCard({ step }: { step: HandbookFigureStep }) {
  const failed = step.mark === "cross" || step.mark === "alert";
  const restored = step.mark === "check";
  const shell = failed
    ? "border-rose-400/90 bg-[#3a121c] shadow-[0_0_28px_-12px_rgba(251,113,133,0.95)]"
    : restored
      ? "border-emerald-200 bg-emerald-400 text-emerald-950 shadow-[0_0_32px_-8px_rgba(52,211,153,0.95)]"
      : "border-white/15 bg-[#0c1420]";
  const bubble = failed
    ? "border-rose-300/80 bg-[#2a0c14]"
    : restored
      ? "border-emerald-900/20 bg-emerald-950/10"
      : "border-white/15 bg-[#101826]";
  return (
    <div className={`flex items-center gap-3 rounded-[14px] border px-3 py-3 ${shell}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${bubble}`}>
        <Glyph name={step.mark} tone={failed ? "red" : restored ? "ink" : "pass"} />
      </span>
      <span className="min-w-0">
        <span className={`block text-sm font-semibold ${restored ? "text-emerald-950" : "text-white"}`}>{step.term}</span>
        <span className={`mt-0.5 block text-xs leading-snug ${restored ? "text-emerald-950/80" : "text-slate-400"}`}>
          {step.detail}
        </span>
      </span>
    </div>
  );
}

function DownMark({ into }: { into: "pass" | "neutral" }) {
  const stroke = into === "pass" ? PASS : "rgba(226,232,240,0.7)";
  return (
    <div className="flex justify-center py-1.5" aria-hidden>
      <svg width="16" height="18" viewBox="0 0 16 18">
        <path d="M8 1v11" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
        <path d="M3 9.5 8 16l5-6.5" fill={stroke} />
      </svg>
    </div>
  );
}

function ReturnNote() {
  return (
    <div className="flex h-full items-stretch gap-2">
      <div className="relative w-7 shrink-0" aria-hidden>
        <div className="absolute top-8 right-1 bottom-8 left-3 rounded-l-md border-t border-b border-l border-dashed border-slate-300/80" />
        <span className="absolute top-6 -left-1 text-sm leading-none text-slate-200">←</span>
      </div>
      <p className="self-center text-xs leading-relaxed text-slate-300">
        The fix or the revert still lands. The failure is not left in place.
      </p>
    </div>
  );
}

export function ScenePlate({ figure, disclaimer }: { figure: HandbookFigure; disclaimer?: string }) {
  return (
    <div data-handbook-plate="scene">
      <ol className="grid list-none grid-cols-1 gap-3 lg:grid-cols-5 lg:gap-2">
        {figure.steps.map((step, index) => {
          const failed = step.mark === "cross";
          const restored = step.mark === "check";
          return (
            <li key={step.term} className="relative">
              {index < figure.steps.length - 1 ? (
                <span aria-hidden className="absolute top-10 -right-2.5 z-10 hidden text-sm text-emerald-300 lg:block">
                  →
                </span>
              ) : null}
              <div
                className={`relative flex h-full flex-col items-center rounded-[14px] border px-2 pt-5 pb-3 text-center ${
                  failed
                    ? "border-rose-400/85 bg-[#3a121c]"
                    : restored
                      ? "border-emerald-300/70 bg-emerald-400/10"
                      : "border-white/15 bg-[#0c1420]"
                }`}
              >
                <span
                  className={`absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-xs font-bold ${
                    failed ? "bg-rose-400 text-rose-950" : "bg-emerald-400 text-emerald-950"
                  }`}
                >
                  {index + 1}
                </span>
                <Glyph name={step.mark} tone={failed ? "red" : "pass"} />
                <span className={`mt-2 block text-[13px] font-semibold ${failed ? "text-rose-50" : "text-white"}`}>{step.term}</span>
                <span className="mt-1 block text-[11px] leading-snug text-slate-400">{step.detail}</span>
              </div>
              {index < figure.steps.length - 1 ? (
                <span aria-hidden className="mt-1 block text-center text-emerald-300 lg:hidden">
                  ↓
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 rounded-[14px] border border-white/10 bg-black/30 p-3">
        <p className="font-mono text-[10px] tracking-[0.18em] text-slate-500 uppercase">Example</p>
        <div className="mt-3 grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <FieldSample label="The break" field="title" note="Downstream still reads name." tone="fail" />
          <span aria-hidden className="self-center text-center text-lg text-emerald-300">
            →
          </span>
          <FieldSample label="The revert" field="name" note="The known-good name is back." tone="pass" />
        </div>
      </div>
      <p className="mt-3 flex gap-2 text-xs leading-relaxed text-slate-400">
        <span aria-hidden className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/30 text-[10px] text-slate-300">
          i
        </span>
        <span>
          {disclaimer ??
            "Illustrative scenario. Not a record of a team, and not a measured result."}
        </span>
      </p>
    </div>
  );
}

function FieldSample({
  label,
  field,
  note,
  tone,
}: {
  label: string;
  field: string;
  note: string;
  tone: "fail" | "pass";
}) {
  const key = tone === "fail" ? FAIL : PASS;
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${tone === "fail" ? "border-rose-400/40 bg-rose-950/20" : "border-emerald-300/40 bg-emerald-400/5"}`}>
      <p className="font-mono text-[10px] tracking-[0.14em] text-slate-500 uppercase">{label}</p>
      <pre className="mt-2 font-mono text-[12px] leading-relaxed text-slate-300">
        {"{\n  "}
        <span style={{ color: key }}>&quot;{field}&quot;</span>
        {': "widget"\n}'}
      </pre>
      <p className="mt-1 text-[11px] leading-snug text-slate-400">{note}</p>
    </div>
  );
}

export function PyramidPlate({ figure }: { figure: HandbookFigure }) {
  const fast = figure.steps[0];
  const coarser = figure.steps[1];
  const end = figure.steps[2];
  const commit = figure.columns?.[0];
  const later = figure.columns?.[1];
  const apex = 18;
  const base = 236;
  const cx = 196;
  const half = 168;
  const edge = (y: number) => ((y - apex) / (base - apex)) * half;
  const trap = (y0: number, y1: number) =>
    `${cx - edge(y0)},${y0} ${cx + edge(y0)},${y0} ${cx + edge(y1)},${y1} ${cx - edge(y1)},${y1}`;
  const bands = [
    { step: end, y0: apex, y1: 104, fill: "#12263a", ink: "#e2e8f0", sub: "Very few" },
    { step: coarser, y0: 104, y1: 170, fill: "#16324a", ink: "#e2e8f0", sub: "Fewer" },
    { step: fast, y0: 170, y1: base, fill: "#34d399", ink: "#052e16", sub: "Many" },
  ];
  return (
    <div data-handbook-plate="pyramid">
      <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(13rem,0.72fr)]">
        <svg viewBox="0 0 420 260" className="mx-auto h-auto w-full max-w-lg">
          {bands.map((band) =>
            band.step ? (
              <g key={band.step.term}>
                <polygon points={trap(band.y0, band.y1)} fill={band.fill} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <text
                  x={cx}
                  y={(band.y0 + band.y1) / 2 - 2}
                  textAnchor="middle"
                  fill={band.ink}
                  fontSize="15"
                  fontWeight="650"
                  fontFamily="var(--font-sans), ui-sans-serif, system-ui, sans-serif"
                >
                  {band.step.term}
                </text>
                <text
                  x={cx}
                  y={(band.y0 + band.y1) / 2 + 16}
                  textAnchor="middle"
                  fill={band.ink}
                  fontSize="12"
                  opacity="0.82"
                  fontFamily="var(--font-sans), ui-sans-serif, system-ui, sans-serif"
                >
                  {band.sub}
                </text>
              </g>
            ) : null,
          )}
        </svg>
        <div className="flex flex-col gap-3">
          {later ? <GateNote title={later.term} detail={later.detail} /> : null}
          {commit ? <GateNote title={commit.term} detail={commit.detail} emphasis /> : null}
        </div>
      </div>
      <div className="mt-4 flex gap-3 rounded-[14px] border border-white/10 bg-black/25 px-3 py-3">
        <Glyph name="clock" />
        <p className="text-sm leading-relaxed text-slate-300">{figure.caption}</p>
      </div>
    </div>
  );
}

function GateNote({ title, detail, emphasis = false }: { title: string; detail: string; emphasis?: boolean }) {
  return (
    <div className={`rounded-[14px] border px-3 py-3 ${emphasis ? "border-emerald-300/70 bg-emerald-400/10" : "border-white/15 bg-[#0c1420]"}`}>
      <p className={`font-mono text-[10px] tracking-[0.16em] uppercase ${emphasis ? "text-emerald-300" : "text-slate-400"}`}>{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-200">{detail}</p>
    </div>
  );
}
