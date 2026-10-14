import { useId, type ReactNode } from "react";
import type { HandbookFigure, HandbookMark } from "@/content/handbooks";

const CYAN = "#67e8f9";
const RED = "#fb7185";

export function HandbookFigureView({ figure }: { figure: HandbookFigure }) {
  if (figure.kind === "pyramid") return <PyramidFigure figure={figure} />;
  if (figure.kind === "loop") return <LoopFigure figure={figure} />;
  if (figure.kind === "recovery") return <RecoveryFigure figure={figure} />;
  if (figure.kind === "signals") return <SignalsFigure figure={figure} />;
  if (figure.kind === "scene") return <SceneFigure figure={figure} />;
  if (figure.kind === "compare") return <CompareFigure figure={figure} />;
  return <FlowFigure figure={figure} />;
}

export function HorizonPlate({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-8 overflow-hidden rounded-2xl border border-cyan-300/25 bg-[#050814] shadow-[0_0_48px_-16px_rgba(34,211,238,0.55)]">
      <svg
        aria-hidden
        viewBox="0 0 800 200"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 w-full sm:h-44"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <radialGradient id="limb" cx="50%" cy="78%" r="48%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="14%" stopColor="#d9f8ff" />
            <stop offset="32%" stopColor="#22d3ee" stopOpacity="0.95" />
            <stop offset="58%" stopColor="#0369a1" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#050814" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="200" fill="url(#limb)" />
        <ellipse cx="400" cy="248" rx="640" ry="92" fill="#050814" />
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 12% 22%, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 28% 40%, rgba(255,255,255,0.5), transparent), radial-gradient(1.5px 1.5px at 70% 18%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 84% 36%, rgba(255,255,255,0.45), transparent), radial-gradient(1px 1px at 48% 16%, rgba(103,232,249,0.8), transparent)",
        }}
      />
      <div className="relative px-5 pt-6 pb-28 sm:px-8 sm:pt-8 sm:pb-32">{children}</div>
    </div>
  );
}

export function HandbookFieldPath() {
  const stops = [
    { href: "/sdlc-field-card/index.html", term: "Field card", detail: "The picture" },
    { href: "/handbooks/software-that-stays-in-use/1", term: "Handbook", detail: "How you work" },
    { href: "/stories", term: "Story", detail: "What happened" },
    { href: "/portfolio", term: "Portfolio", detail: "The work" },
  ];
  return (
    <figure className="relative mt-10 overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#050814]">
      <svg aria-hidden viewBox="0 0 960 220" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
            <stop offset="40%" stopColor="#67e8f9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="ground" cx="50%" cy="100%" r="70%">
            <stop offset="0%" stopColor="#083344" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#050814" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="960" height="220" fill="url(#ground)" />
        <path
          d="M40 150 C 180 150, 220 70, 360 78 S 560 170, 700 92 S 860 60, 930 88"
          fill="none"
          stroke="url(#trail)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M40 156 C 180 156, 220 78, 360 86 S 560 178, 700 100 S 860 68, 930 96"
          fill="none"
          stroke="#67e8f9"
          strokeOpacity="0.25"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>
      <figcaption className="sr-only">
        Field card, handbook, story, and portfolio are one path.
      </figcaption>
      <ol className="relative grid grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:px-6 sm:py-10">
        {stops.map((stop, index) => (
          <li key={stop.term} className="text-center">
            <a href={stop.href} className="focus-ring group inline-flex flex-col items-center rounded-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-200/70 bg-[#07111c] font-mono text-xs text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.45)]">
                {index + 1}
              </span>
              <span className="mt-3 block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cyan-100 group-hover:text-white">
                {stop.term}
              </span>
              <span className="mt-1 block text-sm text-slate-300">{stop.detail}</span>
            </a>
          </li>
        ))}
      </ol>
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

function MarkGlyph({ name, tone = "cyan" }: { name?: HandbookMark; tone?: "cyan" | "red" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <IconPaths name={name} tone={tone} />
    </svg>
  );
}

function IconPaths({ name, tone = "cyan" }: { name?: HandbookMark; tone?: "cyan" | "red" }) {
  const stroke = tone === "red" ? RED : CYAN;
  const props = {
    fill: "none",
    stroke,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "code") return <path d="M8 8 4 12l4 4M16 8l4 4-4 4M13 6l-2 12" {...props} />;
  if (name === "gear") {
    return (
      <path
        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-4.5.7 2.2a6 6 0 0 1 2.1.9l2.1-1 1.5 2.6-1.6 1.6a6 6 0 0 1 0 2.4l1.6 1.6-1.5 2.6-2.1-1a6 6 0 0 1-2.1.9L12 20l-.7-2.2a6 6 0 0 1-2.1-.9l-2.1 1-1.5-2.6 1.6-1.6a6 6 0 0 1 0-2.4L5.6 9.7 7.1 7.1l2.1 1a6 6 0 0 1 2.1-.9L12 4Z"
        {...props}
      />
    );
  }
  if (name === "check") return <path d="m5 12 5 5L20 7" {...props} />;
  if (name === "merge") {
    return (
      <>
        <circle cx="7" cy="6" r="2" {...props} />
        <circle cx="17" cy="18" r="2" {...props} />
        <path d="M7 8v4a6 6 0 0 0 6 6h2" {...props} />
      </>
    );
  }
  if (name === "pulse") return <path d="M3 12h4l2-5 4 10 2-5h6" {...props} />;
  if (name === "refresh") return <path d="M20 12a8 8 0 1 1-2.2-5.5M20 4v5h-5" {...props} />;
  if (name === "alert") return <path d="M12 4 4 19h16L12 4Zm0 6v4" {...props} />;
  if (name === "cross") return <path d="M6 6l12 12M18 6 6 18" {...props} />;
  if (name === "pause") return <path d="M9 6v12M15 6v12" {...props} />;
  if (name === "search") return <path d="m16 16 4 4M11 17a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z" {...props} />;
  if (name === "wrench") return <path d="M14 7a4 4 0 0 0-5 5L4 17l3 3 5-5a4 4 0 0 0 5-5l-3 3-2-2 2-3Z" {...props} />;
  if (name === "play") return <path d="m8 6 10 6-10 6V6Z" {...props} />;
  if (name === "clock") return <path d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" {...props} />;
  if (name === "bolt") return <path d="m13 3-8 10h6l-1 8 8-10h-6l1-8Z" {...props} />;
  if (name === "shield") return <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" {...props} />;
  if (name === "flag") return <path d="M6 4v16M6 5h10l-2 3 2 3H6" {...props} />;
  return <circle cx="12" cy="12" r="3" {...props} />;
}

function Node({
  index,
  mark,
  tone = "cyan",
}: {
  index: number;
  mark?: HandbookMark;
  tone?: "cyan" | "red";
}) {
  const ring = tone === "red" ? "border-rose-300/80 shadow-[0_0_18px_rgba(251,113,133,0.55)]" : "border-cyan-200/80 shadow-[0_0_18px_rgba(34,211,238,0.5)]";
  return (
    <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-[#07111c] ${ring}`}>
      <MarkGlyph name={mark} tone={tone} />
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-[#050814] font-mono text-[0.6rem] text-white">
        {index + 1}
      </span>
    </span>
  );
}

function LoopFigure({ figure }: { figure: HandbookFigure }) {
  const rawId = useId().replace(/:/g, "");
  const cx = 500;
  const cy = 340;
  const radius = 150;
  const count = figure.steps.length;
  const points = figure.steps.map((step, index) => {
    const angle = Math.PI - (index * 2 * Math.PI) / Math.max(count, 1);
    return {
      step,
      index,
      x: cx + radius * Math.cos(angle),
      y: cy - radius * Math.sin(angle),
      angle,
    };
  });

  return (
    <figure>
      <Plate>
        <ol className="sm:hidden">
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
        </ol>
        <svg viewBox="0 0 1000 720" className="hidden h-auto w-full sm:block" role="img" aria-label={figure.caption}>
          <defs>
            <filter id={`${rawId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker id={`${rawId}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 Z" fill={CYAN} />
            </marker>
          </defs>
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke={CYAN} strokeOpacity="0.18" strokeWidth="2" />
          {points.map((point, index) => {
            const next = points[(index + 1) % points.length];
            if (!next) return null;
            const edge = shorten(point, next, 34);
            return (
              <line
                key={`edge-${point.step.term}`}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={CYAN}
                strokeWidth="1.6"
                strokeOpacity="0.85"
                markerEnd={`url(#${rawId}-arrow)`}
                filter={`url(#${rawId}-glow)`}
              />
            );
          })}
          {points.map((point) => {
            const label = placeLabel(point.angle, point.x, point.y);
            const lines = wrap(point.step.detail, 24).slice(0, 3);
            return (
              <g key={point.step.term}>
                <circle cx={point.x} cy={point.y} r="30" fill="#07111c" stroke={CYAN} strokeWidth="1.6" filter={`url(#${rawId}-glow)`} />
                <svg x={point.x - 11} y={point.y - 11} width="22" height="22" viewBox="0 0 24 24">
                  <IconPaths name={point.step.mark} />
                </svg>
                <circle cx={point.x + 18} cy={point.y - 18} r="9" fill="#050814" stroke="rgba(255,255,255,0.25)" />
                <text x={point.x + 18} y={point.y - 14} textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="ui-monospace, monospace">
                  {point.index + 1}
                </text>
                <text x={label.x} y={label.y} textAnchor={label.anchor} fill="#e2e8f0" fontSize="15" fontFamily="ui-sans-serif, system-ui, sans-serif">
                  <tspan x={label.x} dy="0" fill={CYAN} fontSize="12" fontFamily="ui-monospace, monospace">
                    {point.step.term.toUpperCase()}
                  </tspan>
                  {lines.map((line) => (
                    <tspan key={line} x={label.x} dy="16" fill="#cbd5e1" fontSize="13">
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
        <Caption>{figure.caption}</Caption>
      </Plate>
    </figure>
  );
}

function RecoveryFigure({ figure }: { figure: HandbookFigure }) {
  return (
    <figure>
      <Plate>
        <ol>
          {figure.steps.map((step, index) => {
            const failed = index === 0;
            const last = index === figure.steps.length - 1;
            return (
              <li key={step.term} className="relative flex gap-4 pb-5 last:pb-0">
                {last ? null : (
                  <span
                    aria-hidden
                    className={`absolute top-12 bottom-0 left-6 w-px -translate-x-1/2 ${failed ? "bg-rose-300/70" : "bg-cyan-200/50"}`}
                  />
                )}
                <Node index={index} mark={step.mark} tone={failed ? "red" : "cyan"} />
                <span className="min-w-0 pt-1">
                  <span className={`block font-mono text-[0.65rem] uppercase tracking-[0.16em] ${failed ? "text-rose-300" : "text-cyan-200"}`}>
                    {step.term}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-200">{step.detail}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <Caption>{figure.caption}</Caption>
      </Plate>
    </figure>
  );
}

function SignalsFigure({ figure }: { figure: HandbookFigure }) {
  return (
    <figure>
      <Plate>
        <ol className="divide-y divide-white/10">
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
        </ol>
        <Caption>{figure.caption}</Caption>
      </Plate>
    </figure>
  );
}

function SceneFigure({ figure }: { figure: HandbookFigure }) {
  const screens = [
    { tone: "red" as const, title: "Build fails", lines: ["shared interface", "integration red"] },
    { tone: "cyan" as const, title: "Change named", lines: ["open the red build", "revert that change"] },
    { tone: "cyan" as const, title: "Main is green", lines: ["corrective commit", "integration resumes"] },
  ];
  return (
    <figure>
      <Plate>
        <div className="grid gap-6 sm:grid-cols-[1.1fr_0.9fr] sm:items-center">
          <ol>
            {figure.steps.map((step, index) => (
              <li key={step.term} className="relative flex gap-3 pb-4 last:pb-0">
                {index === figure.steps.length - 1 ? null : (
                  <span aria-hidden className="absolute top-10 bottom-0 left-5 w-px -translate-x-1/2 bg-cyan-200/40" />
                )}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-200/70 bg-[#07111c] font-mono text-xs text-cyan-100">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cyan-200">{step.term}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-200">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-3" aria-hidden>
            {screens.map((screen) => (
              <div
                key={screen.title}
                className={`rounded-xl border bg-[#050814] p-3 ${screen.tone === "red" ? "border-rose-300/50 shadow-[0_0_18px_-6px_rgba(251,113,133,0.8)]" : "border-cyan-200/40 shadow-[0_0_18px_-8px_rgba(34,211,238,0.8)]"}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${screen.tone === "red" ? "bg-rose-300" : "bg-cyan-200"}`} />
                  <span className={`font-mono text-[0.65rem] uppercase tracking-[0.14em] ${screen.tone === "red" ? "text-rose-200" : "text-cyan-100"}`}>
                    {screen.title}
                  </span>
                </div>
                {screen.lines.map((line) => (
                  <div key={line} className="mt-1 h-2 rounded-full bg-white/10" style={{ width: `${60 + line.length}%`, maxWidth: "100%" }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <Caption>{figure.caption}</Caption>
      </Plate>
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

function FlowFigure({ figure }: { figure: HandbookFigure }) {
  return (
    <figure>
      <Plate>
        <ol>
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
        </ol>
        <Caption>{figure.caption}</Caption>
      </Plate>
    </figure>
  );
}

function PyramidFigure({ figure }: { figure: HandbookFigure }) {
  return (
    <figure>
      <Plate>
        <ol className="mx-auto flex max-w-lg flex-col items-center gap-2">
          {figure.steps.map((step, index) => (
            <li
              key={step.term}
              className="border border-cyan-200/30 bg-[#050814]/70 px-4 py-3 text-center shadow-[0_0_18px_-10px_rgba(34,211,238,0.8)]"
              style={{ width: `${100 - index * 18}%` }}
            >
              <span className="block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cyan-200">{step.term}</span>
              <span className="mt-1 block text-sm leading-relaxed text-slate-200">{step.detail}</span>
            </li>
          ))}
        </ol>
        <Caption>{figure.caption}</Caption>
      </Plate>
    </figure>
  );
}

function shorten(
  from: { x: number; y: number },
  to: { x: number; y: number },
  pad: number,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x1: from.x + (dx / length) * pad,
    y1: from.y + (dy / length) * pad,
    x2: to.x - (dx / length) * (pad + 6),
    y2: to.y - (dy / length) * (pad + 6),
  };
}

function placeLabel(angle: number, x: number, y: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const distance = 118;
  const side = Math.abs(cos) > Math.abs(sin);
  return {
    x: x + cos * distance,
    y: y - sin * distance + (sin > 0.35 ? -8 : 14),
    anchor: (side ? (cos < 0 ? "end" : "start") : "middle") as "start" | "middle" | "end",
  };
}

function wrap(text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}
