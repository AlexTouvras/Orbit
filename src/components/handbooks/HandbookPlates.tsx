import { useId, type CSSProperties } from "react";
import type { HandbookFigure, HandbookFigureStep, HandbookMark } from "@/content/handbooks";
import { IconPaths } from "@/components/handbooks/icon-paths";

const PASS = "#34d399";
const FAIL = "#fb7185";
const CARD_W = 176;
const CARD_H = 132;
const VIEW_W = 900;
const KAPPA = 0.5522847498;

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
  alignItems: "center",
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

type Seat = {
  n: number;
  step: HandbookFigureStep;
  x: number;
  y: number;
  r: number;
  b: number;
  cx: number;
  cy: number;
};

function seats(steps: HandbookFigureStep[]): Seat[] {
  const inner = 248;
  const left = Math.round((VIEW_W - (CARD_W * 2 + inner)) / 2);
  const right = left + CARD_W + inner;
  const top = 34;
  const gapY = 58;
  const upper = top + CARD_H + gapY;
  const lower = upper + CARD_H + gapY;
  const at = [
    { x: (VIEW_W - CARD_W) / 2, y: top },
    { x: right, y: upper },
    { x: right, y: lower },
    { x: left, y: lower },
    { x: left, y: upper },
  ];
  return steps.map((step, index) => {
    const seat = at[index] ?? at[0];
    return {
      n: index + 1,
      step,
      x: seat.x,
      y: seat.y,
      r: seat.x + CARD_W,
      b: seat.y + CARD_H,
      cx: seat.x + CARD_W / 2,
      cy: seat.y + CARD_H / 2,
    };
  });
}

function n1(value: number) {
  return value.toFixed(1);
}

function topRightArc(pull: Seat, change: Seat) {
  const radius = Math.min(118, change.y - (pull.y + 28), change.cx - pull.r + 36);
  const x1 = pull.r;
  const y1 = change.y - radius;
  const x2 = pull.r + radius;
  const y2 = change.y - 2;
  const k = radius * KAPPA;
  return `M ${n1(x1)} ${n1(y1)} C ${n1(x1 + k)} ${n1(y1)} ${n1(x2)} ${n1(y2 - k)} ${n1(x2)} ${n1(y2)}`;
}

function topLeftArc(verify: Seat, pull: Seat) {
  const radius = Math.min(118, verify.y - (pull.y + 28));
  const x2 = pull.x - 2;
  const y2 = verify.y - radius;
  const x1 = pull.x - radius;
  const y1 = verify.y;
  const k = radius * KAPPA;
  return `M ${n1(x1)} ${n1(y1)} C ${n1(x1)} ${n1(y1 - k)} ${n1(x2 - k)} ${n1(y2)} ${n1(x2)} ${n1(y2)}`;
}

function rightArc(change: Seat, test: Seat) {
  const bulge = 74;
  const y1 = change.cy + 26;
  const y2 = test.cy - 26;
  const x = change.r;
  return `M ${n1(x)} ${n1(y1)} C ${n1(x + bulge)} ${n1(y1)} ${n1(x + bulge)} ${n1(y2)} ${n1(x + 2)} ${n1(y2)}`;
}

function leftArc(integrate: Seat, verify: Seat) {
  const bulge = 74;
  const y1 = integrate.cy - 26;
  const y2 = verify.cy + 26;
  const x = integrate.x;
  return `M ${n1(x)} ${n1(y1)} C ${n1(x - bulge)} ${n1(y1)} ${n1(x - bulge)} ${n1(y2)} ${n1(x - 2)} ${n1(y2)}`;
}

function bottomArc(test: Seat, integrate: Seat) {
  const drop = 74;
  const x1 = test.x + 34;
  const x2 = integrate.r - 34;
  const y = test.b;
  return `M ${n1(x1)} ${n1(y)} C ${n1(x1)} ${n1(y + drop)} ${n1(x2)} ${n1(y + drop)} ${n1(x2)} ${n1(y - 4)}`;
}

function returnArc(pull: Seat, ringRight: number, repairY: number) {
  const startX = ringRight - 16;
  const startY = repairY - 4;
  const outer = Math.min(VIEW_W - 28, ringRight + 146);
  const highX = ringRight + 108;
  const highY = pull.b + 12;
  const landX = pull.cx + 48;
  const landY = pull.y - 1;
  return `M ${n1(startX)} ${n1(startY)} C ${n1(outer + 20)} ${n1(startY + 8)} ${n1(outer + 8)} ${n1(highY + 36)} ${n1(highX)} ${n1(highY)} C ${n1(highX - 38)} ${n1(pull.y + 26)} ${n1(landX)} ${n1(pull.y - 30)} ${n1(landX)} ${n1(landY)}`;
}

export function LoopPlate({ figure, plate = false }: { figure: HandbookFigure; plate?: boolean }) {
  const steps = ringSteps(figure);
  const repair = figure.steps.find((step) => step.mark === "wrench");
  const rawId = useId().replace(/:/g, "");
  const boxes = seats(steps);
  const pull = boxes[0];
  const change = boxes[1];
  const test = boxes[2];
  const integrate = boxes[3];
  const verify = boxes[4];
  const ringLeft = Math.min(...boxes.map((box) => box.x));
  const ringRight = Math.max(...boxes.map((box) => box.r));
  const ringBottom = Math.max(...boxes.map((box) => box.b));
  const ringMidY = ((pull?.y ?? 0) + ringBottom) / 2;
  const repairGap = 36;
  const branchW = (ringRight - ringLeft - repairGap) / 2;
  const repairY = ringBottom + 108;
  const repairH = 92;
  const viewH = repairY + repairH + 22;
  const alertX = ringLeft;
  const repairX = ringLeft + branchW + repairGap;
  const alertCx = alertX + branchW / 2;
  const legs =
    pull && change && test && integrate && verify
      ? [
          topRightArc(pull, change),
          rightArc(change, test),
          bottomArc(test, integrate),
          leftArc(integrate, verify),
          topLeftArc(verify, pull),
        ]
      : [];

  return (
    <div data-handbook-plate="loop" className={plate ? "flex h-full w-full flex-col lg:items-center lg:justify-center" : undefined}>
      {plate ? (
        <div className="flex flex-col gap-2 lg:hidden">
          {boxes.map((box) => (
            <CompactStep key={box.step.term} n={box.n} term={box.step.term} detail={box.step.detail} mark={box.step.mark && box.step.mark !== "pulse" ? box.step.mark : "check"} />
          ))}
          <CompactStep n="—" term="Main is red?" detail="Stop integration." mark="alert" tone="fail" />
          {repair ? <CompactStep n="↩" term={repair.term} detail={repair.detail} mark="wrench" tone="pass" /> : null}
        </div>
      ) : null}
      <ul className={plate ? "hidden" : "flex list-none flex-col gap-2 sm:hidden"}>
        {boxes.map((box) => (
          <li key={box.step.term}>
            <LoopCard n={box.n} step={box.step} badge />
          </li>
        ))}
      </ul>
      <svg viewBox={`0 0 ${VIEW_W} ${viewH}`} className={plate ? "hidden h-full max-h-full w-auto max-w-full lg:block" : "hidden h-auto w-full sm:block"} role="img" aria-label={figure.caption || "The daily loop"}>
        <title>{figure.caption || "The daily loop"}</title>
        <defs>
          <marker id={`${rawId}-pass`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" fill={PASS} />
          </marker>
          <marker id={`${rawId}-fail`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" fill={FAIL} />
          </marker>
          <marker id={`${rawId}-next`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" fill="#cbd5e1" />
          </marker>
        </defs>
        {legs.map((d, index) => (
          <path key={index} d={d} fill="none" stroke={PASS} strokeWidth="2.4" strokeLinecap="round" markerEnd={`url(#${rawId}-pass)`} />
        ))}
        <text x={VIEW_W / 2} y={ringMidY - 18} textAnchor="middle" fill={PASS} fontSize="12" letterSpacing="3.2" fontFamily="var(--font-mono), ui-monospace, monospace">
          THE DAILY LOOP
        </text>
        <text x={VIEW_W / 2} y={ringMidY + 8} textAnchor="middle" fill="#e2e8f0" fontSize="16" fontFamily="var(--font-sans), ui-sans-serif, system-ui, sans-serif">
          Merge today.
        </text>
        <text x={VIEW_W / 2} y={ringMidY + 30} textAnchor="middle" fill="#94a3b8" fontSize="13" fontFamily="var(--font-sans), ui-sans-serif, system-ui, sans-serif">
          The integration build counts.
        </text>
        <path
          d={`M ${ringLeft} ${ringBottom + 78} H ${ringRight}`}
          fill="none"
          stroke="rgba(226,232,240,0.28)"
          strokeWidth="1.4"
          strokeDasharray="5 6"
        />
        <path
          d={`M ${VIEW_W / 2} ${ringBottom + 68} C ${VIEW_W / 2} ${repairY - 20}, ${alertCx} ${repairY - 24}, ${alertCx} ${repairY - 2}`}
          fill="none"
          stroke={FAIL}
          strokeWidth="2.2"
          strokeLinecap="round"
          markerEnd={`url(#${rawId}-fail)`}
        />
        {repair ? (
          <path
            d={`M ${alertX + branchW + 8} ${repairY + repairH / 2} H ${repairX - 12}`}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeLinecap="round"
            markerEnd={`url(#${rawId}-next)`}
          />
        ) : null}
        {repair ? (
          <path
            d={pull ? returnArc(pull, ringRight, repairY) : ""}
            fill="none"
            stroke={PASS}
            strokeWidth="2.2"
            strokeLinecap="round"
            markerEnd={`url(#${rawId}-pass)`}
          />
        ) : null}
        {boxes.map((box) => (
          <foreignObject key={box.step.term} x={box.x} y={box.y} width={CARD_W} height={CARD_H}>
            <div style={{ width: CARD_W, height: CARD_H }}>
              <LoopCard n={box.n} step={box.step} badge={false} />
            </div>
          </foreignObject>
        ))}
        {boxes.map((box) => (
          <g key={`badge-${box.n}`}>
            <circle cx={box.x} cy={box.y} r={13} fill={PASS} />
            <text
              x={box.x}
              y={box.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#052e16"
              fontSize="12"
              fontWeight="700"
              fontFamily="var(--font-sans), ui-sans-serif, system-ui, sans-serif"
            >
              {box.n}
            </text>
          </g>
        ))}
        <foreignObject x={alertX} y={repairY} width={branchW} height={repairH}>
          <div style={{ width: branchW, height: repairH }}>
            <BranchFace tone="fail" mark="alert" title="Main is red?" detail="Stop integration." />
          </div>
        </foreignObject>
        {repair ? (
          <foreignObject x={repairX} y={repairY} width={branchW} height={repairH}>
            <div style={{ width: branchW, height: repairH }}>
              <BranchFace tone="pass" mark="wrench" title={repair.term} detail={repair.detail} />
            </div>
          </foreignObject>
        ) : null}
      </svg>
      {repair ? (
        <div className={plate ? "hidden" : "mt-3 flex flex-col gap-2 sm:hidden"}>
          <BranchFace tone="fail" mark="alert" title="Main is red?" detail="Stop integration." />
          <BranchFace tone="pass" mark="wrench" title={repair.term} detail={repair.detail} />
        </div>
      ) : null}
    </div>
  );
}

function CompactStep({
  n,
  term,
  detail,
  mark,
  tone = "pass",
}: {
  n: string | number;
  term: string;
  detail: string;
  mark: HandbookMark;
  tone?: "pass" | "fail";
}) {
  const failed = tone === "fail";
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${failed ? "border-rose-400/80 bg-[#3a121c]" : "border-white/15 bg-[#0c1420]"}`}
    >
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${failed ? "bg-rose-400 text-rose-950" : "bg-emerald-400 text-emerald-950"}`}>
        {n}
      </span>
      <Glyph name={mark} tone={failed ? "red" : "pass"} size={16} />
      <span className="min-w-0">
        <span className="block text-sm leading-tight font-semibold text-white">{term}</span>
        <span className="mt-0.5 block text-xs leading-snug text-slate-400">{detail}</span>
      </span>
    </div>
  );
}

function LoopCard({ n, step, badge: showBadge }: { n: number; step: HandbookFigureStep; badge: boolean }) {
  const mark = step.mark === "pulse" ? "check" : step.mark;
  return (
    <div
      style={{
        position: "relative",
        boxSizing: "border-box",
        height: showBadge ? "auto" : "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 5,
        borderRadius: 16,
        border: "1px solid rgba(226,232,240,0.16)",
        background: "#0c1420",
        padding: showBadge ? "20px 16px 14px" : "18px 12px 12px",
        fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
        boxShadow: "0 16px 32px -22px rgba(0,0,0,0.9)",
      }}
    >
      {showBadge ? <span style={{ ...badge, position: "absolute", top: 10, left: 10 }}>{n}</span> : null}
      <Glyph name={mark} size={18} />
      <span style={{ fontSize: 15, fontWeight: 650, lineHeight: 1.15, color: "#f8fafc" }}>{step.term}</span>
      <span style={{ maxWidth: "100%", fontSize: 12, lineHeight: 1.35, color: "#94a3b8", textWrap: "balance" }}>{step.detail}</span>
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
      <ol className="grid list-none grid-cols-1 gap-2 lg:grid-cols-5 lg:gap-2">
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
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left lg:relative lg:h-full lg:flex-col lg:items-center lg:rounded-[14px] lg:px-2 lg:pt-5 lg:pb-3 lg:text-center ${
                  failed
                    ? "border-rose-400/85 bg-[#3a121c]"
                    : restored
                      ? "border-emerald-300/70 bg-emerald-400/10"
                      : "border-white/15 bg-[#0c1420]"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold lg:absolute lg:-top-3 lg:left-1/2 lg:-translate-x-1/2 ${
                    failed ? "bg-rose-400 text-rose-950" : "bg-emerald-400 text-emerald-950"
                  }`}
                >
                  {index + 1}
                </span>
                <Glyph name={step.mark} tone={failed ? "red" : "pass"} />
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold lg:mt-2 lg:text-[13px] ${failed ? "text-rose-50" : "text-white"}`}>{step.term}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-slate-400 lg:text-[11px]">{step.detail}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 rounded-[14px] border border-white/10 bg-black/30 p-2.5 sm:mt-4 sm:p-3">
        <p className="font-mono text-[10px] tracking-[0.18em] text-slate-500 uppercase">Example</p>
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2 sm:mt-3 sm:gap-3">
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
      <pre className="mt-2 font-mono text-[11px] leading-snug text-slate-300 sm:text-[12px] sm:leading-relaxed">
        <span style={{ color: key }}>&quot;{field}&quot;</span>
        {': "widget"'}
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
