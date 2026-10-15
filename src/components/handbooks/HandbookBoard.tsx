import Link from "next/link";
import { useId, type ReactNode } from "react";
import type {
  Handbook,
  HandbookFigure,
  HandbookFigureStep,
  HandbookMark,
  HandbookPage,
} from "@/content/handbooks";
import { IconPaths } from "@/components/handbooks/HandbookFigures";

const PANEL =
  "relative flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-cyan-300/30 bg-[#040914] shadow-[0_0_42px_-18px_rgba(34,211,238,0.55)]";

const PATH_STOPS: Array<{
  href: string;
  term: string;
  detail: string;
  glyph: "card" | "book" | "story" | "bars";
  beam: string;
  x: number;
  y: number;
}> = [
  { href: "/sdlc-field-card/index.html", term: "Field card", detail: "The picture", glyph: "card", beam: "#67e8f9", x: 180, y: 268 },
  { href: "/handbooks/software-that-stays-in-use/1", term: "Handbook", detail: "How you work", glyph: "book", beam: "#22d3ee", x: 400, y: 236 },
  { href: "/stories", term: "Story", detail: "What happened", glyph: "story", beam: "#a78bfa", x: 640, y: 198 },
  { href: "/portfolio", term: "Portfolio", detail: "The work", glyph: "bars", beam: "#e879f9", x: 860, y: 168 },
];

const ROAD: Array<[number, number]> = [
  [-30, 318],
  [70, 308],
  [180, 268],
  [280, 292],
  [400, 236],
  [520, 252],
  [640, 198],
  [750, 214],
  [860, 168],
  [1020, 156],
];

const STARS = starField(56, 11);

export function HandbookBoard({ handbook, page }: { handbook: Handbook; page: HandbookPage }) {
  const loop = figureOf(page, "loop");
  const recovery = figureOf(page, "recovery");
  const signals = figureOf(page, "signals");
  const scene = figureOf(page, "scene");
  const compare = figureOf(page, "compare");
  const sceneSection = sectionOf(page, "scene");

  return (
    <div
      data-handbook-board
      className="scroll-mt-28 rounded-xl border border-cyan-400/15 bg-[#02060e] p-2 shadow-[0_0_80px_-24px_rgba(34,211,238,0.35)] sm:p-3"
    >
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1.05fr_1.34fr_0.98fr] lg:grid-rows-[auto_auto_auto]">
        <EarthHero handbook={handbook} page={page} />
        <DailyLoop figure={loop} />
        <BrokenMain figure={recovery} />
        <SignalTable figure={signals} />
        <IllustrativeScene figure={scene} label={sceneSection?.paragraphs?.[0]} />
        <Distinctions figure={compare} />
        <div className="lg:col-span-3">
          <BiggerPicture />
        </div>
      </div>
    </div>
  );
}

export function HandbookFieldLandscape() {
  return (
    <figure className="relative mt-10 overflow-hidden rounded-md border border-cyan-300/30 bg-[#040914] shadow-[0_0_42px_-18px_rgba(34,211,238,0.45)]">
      <NightRoad />
      <figcaption className="sr-only">
        Field card, handbook, story, and portfolio sit on one road.
      </figcaption>
    </figure>
  );
}

function EarthHero({ handbook, page }: { handbook: Handbook; page: HandbookPage }) {
  const lines = operatingLines(page.rule);
  return (
    <section className={`${PANEL} min-h-[560px]`} data-board-panel="hero" aria-label={handbook.title}>
      <EarthBackdrop />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-44 bg-gradient-to-t from-[#02040a] via-[#02040a]/80 to-transparent" />
      <div className="relative z-10 flex min-h-[560px] flex-1 flex-col px-5 pt-5 pb-6 sm:px-6 sm:pt-6">
        <p className="font-mono text-[10px] tracking-[0.28em] text-cyan-200">
          ORBIT / HANDBOOK {handbook.index}
        </p>
        <p className="mt-8 font-mono text-[11px] tracking-[0.28em] text-white/85 uppercase">
          {page.topic}
        </p>
        <h1 className="mt-3 max-w-[11ch] font-display text-[2.65rem] font-semibold leading-[0.9] tracking-tight text-white sm:text-[3.15rem]">
          {handbook.title}
        </h1>
        <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-slate-300">{handbook.thesis}</p>
        <ul
          className="mt-auto max-w-[36ch] space-y-1.5 pt-20 text-sm leading-snug text-white sm:text-[0.95rem]"
          style={{ textShadow: "0 2px 14px rgba(0,0,0,0.95)" }}
        >
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DailyLoop({ figure }: { figure: HandbookFigure | undefined }) {
  const steps = ringSteps(figure);
  const repair = figure?.steps.find((step) => step.mark === "wrench");
  return (
    <section className={`${PANEL} min-h-[560px]`} data-board-panel="loop">
      <StarWash />
      <PanelHead index="2" kicker="The daily loop" title="Small enough to merge today." />
      <div className="relative z-10 flex flex-1 flex-col px-4 pb-4 sm:px-5">
        <ul className="mt-4 list-none sm:hidden">
          {steps.map((step, index) => (
            <StepRow key={step.term} index={index} step={step} />
          ))}
        </ul>
        <LoopRing steps={steps} caption={figure?.caption ?? "The commit loop."} />
        {repair ? (
          <p className="relative z-10 mt-3 border-l-2 border-rose-300 pl-3 text-sm leading-snug text-slate-200">
            <span className="font-mono text-[10px] tracking-[0.16em] text-rose-200 uppercase">Main is red. </span>
            {repair.detail}
          </p>
        ) : null}
        <p className="relative z-10 mt-auto hidden pt-2 text-xs leading-relaxed text-slate-400 sm:block">
          {figure?.caption}
        </p>
      </div>
    </section>
  );
}

function BrokenMain({ figure }: { figure: HandbookFigure | undefined }) {
  const steps = figure?.steps ?? [];
  return (
    <section className={`${PANEL} min-h-[560px]`} data-board-panel="recovery">
      <StarWash />
      <PanelHead index="3" kicker="A broken main" title="Feature work waits." />
      <div className="relative z-10 flex flex-1 flex-col px-4 pt-4 pb-4 sm:px-5">
        <ul className="relative flex list-none flex-1 flex-col justify-between gap-3">
          <span
            aria-hidden
            className="absolute top-8 bottom-5 left-[1.65rem] w-[2px] -translate-x-1/2 bg-gradient-to-b from-rose-400 via-teal-200 to-teal-200/30 shadow-[0_0_12px_rgba(34,211,238,0.85)]"
          />
          {steps.map((step, index) => {
            const tone = recoveryTone(step);
            const label =
              tone === "red" ? "text-rose-100" : tone === "ok" ? "text-teal-100" : "text-cyan-200";
            return (
              <li key={step.term} className="relative flex items-start gap-3">
                <GlowDot tone={tone} large={index === 0} mark={step.mark} />
                <span className="min-w-0 pt-1">
                  <span
                    className={
                      index === 0
                        ? "block font-display text-lg font-semibold text-rose-100"
                        : `block font-mono text-[11px] tracking-[0.14em] uppercase ${label}`
                    }
                  >
                    {index + 1}. {step.term}
                  </span>
                  <span className="mt-1 block text-sm leading-snug text-slate-300">{step.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
        {figure?.caption ? (
          <p className="relative z-10 mt-4 text-xs leading-relaxed text-slate-400">{figure.caption}</p>
        ) : null}
      </div>
    </section>
  );
}

function SignalTable({ figure }: { figure: HandbookFigure | undefined }) {
  const steps = figure?.steps ?? [];
  return (
    <section className={PANEL} data-board-panel="signals">
      <StarWash />
      <PanelHead index="4" kicker="How I would know" title="Four signals. No target times." />
      <div className="relative z-10 flex flex-1 flex-col px-4 pt-4 pb-4 sm:px-5">
        <div className="overflow-hidden rounded-md border border-cyan-300/25">
          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] bg-cyan-400/10 px-3 py-2 font-mono text-[10px] tracking-[0.16em] text-cyan-200 uppercase">
            <span>Signal</span>
            <span>What to count</span>
          </div>
          <ul className="list-none">
            {steps.map((step) => (
              <li
                key={step.term}
                className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] items-center gap-2 border-t border-white/10 px-3 py-2.5"
              >
                <span className="flex items-center gap-2 text-sm text-white">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-200/50 bg-[#07111c] shadow-[0_0_12px_rgba(34,211,238,0.45)]">
                    <HtmlIcon name={step.mark} className="h-4 w-4" />
                  </span>
                  <span className="leading-tight">{step.term}</span>
                </span>
                <span className="text-sm leading-snug text-slate-300">{step.detail}</span>
              </li>
            ))}
          </ul>
        </div>
        {figure?.caption ? (
          <p className="mt-3 text-xs leading-relaxed text-slate-400">{figure.caption}</p>
        ) : null}
      </div>
    </section>
  );
}

function IllustrativeScene({
  figure,
  label,
}: {
  figure: HandbookFigure | undefined;
  label?: string;
}) {
  const steps = figure?.steps ?? [];
  const frames: Array<{ tone: "red" | "green" | "list"; title: string }> = [
    { tone: "red", title: "Downstream test fails" },
    { tone: "green", title: "The change is named" },
    { tone: "list", title: "The revert restores main" },
  ];
  return (
    <section className={PANEL} data-board-panel="scene">
      <StarWash />
      <PanelHead index="5" kicker="An illustrative break" title="A renamed field, then a revert." />
      {label ? (
        <p className="relative z-10 px-4 pt-3 text-xs leading-relaxed text-slate-400 sm:px-5">{label}</p>
      ) : null}
      <div className="relative z-10 grid flex-1 gap-4 px-4 pt-3 pb-4 sm:px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <ul className="list-none">
          {steps.map((step, index) => {
            const failed = step.mark === "cross";
            return (
              <li key={step.term} className="relative flex gap-3 pb-3 last:pb-0">
                {index === steps.length - 1 ? null : (
                  <span aria-hidden className="absolute top-8 bottom-0 left-3.5 w-px -translate-x-1/2 bg-cyan-200/40" />
                )}
                <span
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-[#07111c] font-mono text-[11px] shadow-[0_0_12px_rgba(34,211,238,0.45)] ${failed ? "border-rose-300/80 text-rose-100" : "border-cyan-200/70 text-cyan-100"}`}
                >
                  {index + 1}
                </span>
                <span>
                  <span
                    className={`block font-mono text-[10px] tracking-[0.16em] uppercase ${failed ? "text-rose-200" : "text-cyan-200"}`}
                  >
                    {step.term}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-slate-200">{step.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col justify-center gap-2">
          {frames.map((frame) => (
            <OperatorFrame key={frame.title} tone={frame.tone} title={frame.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Distinctions({ figure }: { figure: HandbookFigure | undefined }) {
  const columns = figure?.columns ?? [];
  return (
    <section className={PANEL} data-board-panel="compare">
      <StarWash />
      <PanelHead index="6" kicker="Key distinctions" title="A green build is not the release." />
      <div className="relative z-10 flex flex-1 flex-col px-4 pt-4 pb-4 sm:px-5">
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.term} className="overflow-hidden rounded-md border border-cyan-300/25 bg-[#030812]/80">
              <h3 className="bg-cyan-400/15 px-2 py-2 text-center font-display text-sm leading-tight font-semibold text-white">
                {column.term}
              </h3>
              <p className="px-2 pt-2 text-[12px] leading-snug text-slate-400">{column.detail}</p>
              <ul className="space-y-2 px-2 py-3">
                {column.points.map((point) => (
                  <li key={point} className="flex items-start gap-1.5 text-[13px] leading-snug text-slate-200">
                    <HtmlIcon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {figure?.caption ? (
          <p className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-400/5 px-3 py-2 text-xs leading-relaxed text-slate-300">
            {figure.caption}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function BiggerPicture() {
  return (
    <section className={PANEL} data-board-panel="path">
      <div className="relative z-10 grid lg:grid-cols-[minmax(0,18rem)_1fr]">
        <header className="px-5 pt-5 pb-2 lg:py-6">
          <p className="font-mono text-[10px] tracking-[0.22em] text-cyan-300 uppercase">7. The bigger picture</p>
          <p className="mt-2 font-display text-xl font-semibold text-white">Card, book, story, work.</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">
            The field card is the picture. The book is how you work. A story is what happened. The portfolio is the work you can open.
          </p>
          <p className="mt-4 font-mono text-[10px] tracking-[0.14em] text-slate-400 uppercase">
            Field card → Handbook → Story → Portfolio
          </p>
        </header>
        <NightRoad />
      </div>
    </section>
  );
}

function NightRoad() {
  const rawId = useId().replace(/:/g, "");
  const road = smoothPath(ROAD, 0.55);
  const band = roadRibbon(ROAD);
  return (
    <div className="relative min-h-[260px]">
      <svg viewBox="0 0 960 380" className="h-auto w-full" role="img" aria-label="Field card, handbook, story, and portfolio on one road.">
        <defs>
          <linearGradient id={`${rawId}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="55%" stopColor="#071525" />
            <stop offset="100%" stopColor="#07140f" />
          </linearGradient>
          <linearGradient id={`${rawId}-road`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="48%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <filter id={`${rawId}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`${rawId}-soft`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <rect width="960" height="380" fill={`url(#${rawId}-sky)`} />
        {NIGHT_STARS.map((star) => (
          <circle key={`${star.x}-${star.y}`} cx={star.x} cy={star.y} r={star.r} fill="#fff" opacity={star.o} />
        ))}
        <path
          d="M0 150 L70 118 L140 146 L220 96 L300 138 L390 88 L480 130 L570 78 L660 124 L750 92 L840 128 L920 100 L960 118 L960 380 L0 380 Z"
          fill="#07111c"
        />
        <path
          d="M0 230 L120 200 L210 236 L330 190 L450 228 L580 184 L700 220 L820 176 L960 200 L960 380 L0 380 Z"
          fill="#0a1812"
        />
        <path d="M0 300 C 180 270, 320 330, 520 290 C 700 256, 820 300, 960 270 L960 380 L0 380 Z" fill="#06110e" />
        {TOWN_LIGHTS.map((light) => (
          <circle key={`${light.x}-${light.y}`} cx={light.x} cy={light.y} r={light.r} fill={light.fill} opacity={light.o} />
        ))}
        <path d={band} fill={`url(#${rawId}-road)`} opacity="0.35" filter={`url(#${rawId}-soft)`} />
        <path d={band} fill={`url(#${rawId}-road)`} opacity="0.9" />
        <path d={road} fill="none" stroke="#f8fdff" strokeWidth="2" strokeLinecap="round" filter={`url(#${rawId}-glow)`} />
        {PATH_STOPS.map((stop) => (
          <g key={stop.term}>
            <line
              x1={stop.x}
              y1={92}
              x2={stop.x}
              y2={stop.y}
              stroke={stop.beam}
              strokeWidth="10"
              opacity="0.28"
              filter={`url(#${rawId}-soft)`}
            />
            <line x1={stop.x} y1={92} x2={stop.x} y2={stop.y} stroke={stop.beam} strokeWidth="1.7" />
            <circle cx={stop.x} cy={stop.y} r="5" fill="#fff" />
            <circle cx={stop.x} cy={stop.y} r="14" fill={stop.beam} opacity="0.4" />
            <circle cx={stop.x} cy="78" r="20" fill="#07111c" stroke={stop.beam} strokeWidth="1.6" filter={`url(#${rawId}-glow)`} />
            <svg x={stop.x - 9} y="69" width="18" height="18" viewBox="0 0 16 16">
              <PathGlyph name={stop.glyph} color={stop.beam} />
            </svg>
          </g>
        ))}
      </svg>
      <ol className="pointer-events-none absolute inset-x-0 top-2 hidden lg:block">
        {PATH_STOPS.map((stop) => (
          <li
            key={stop.term}
            className="absolute -translate-x-1/2"
            style={{ left: `${(stop.x / 960) * 100}%` }}
          >
            <StopLink href={stop.href} className="pointer-events-auto focus-ring block rounded-sm text-center">
              <span className="block font-mono text-[10px] tracking-[0.14em] text-cyan-100 uppercase">{stop.term}</span>
              <span className="mt-0.5 block text-xs text-slate-300">{stop.detail}</span>
            </StopLink>
          </li>
        ))}
      </ol>
      <ol className="grid grid-cols-2 gap-3 border-t border-white/10 p-4 lg:hidden">
        {PATH_STOPS.map((stop) => (
          <li key={stop.term}>
            <StopLink href={stop.href} className="focus-ring block rounded-sm">
              <span className="block font-mono text-[10px] tracking-[0.14em] text-cyan-100 uppercase">{stop.term}</span>
              <span className="mt-0.5 block text-sm text-slate-200">{stop.detail}</span>
            </StopLink>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LoopRing({ steps, caption }: { steps: HandbookFigureStep[]; caption: string }) {
  const rawId = useId().replace(/:/g, "");
  const slots = [
    { x: 96, y: 176 },
    { x: 260, y: 54 },
    { x: 424, y: 166 },
    { x: 352, y: 318 },
    { x: 160, y: 318 },
  ];
  const center = { x: 258, y: 198 };
  const placed = steps.map((step, index) => ({ step, index, ...(slots[index] ?? slots[0]) }));

  return (
    <svg viewBox="0 0 520 500" className="mt-1 hidden h-auto w-full sm:block" role="img" aria-label={caption}>
      <defs>
        <filter id={`${rawId}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id={`${rawId}-arrow`} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 1 L11 6 L0 11 Z" fill="#67e8f9" />
        </marker>
      </defs>
      {placed.map((point, index) => {
        const next = placed[(index + 1) % placed.length];
        if (!next) return null;
        const d = curvedArrow(point, next, center, 34, 36);
        return (
          <g key={`edge-${point.step.term}`}>
            <path d={d} fill="none" stroke="#22d3ee" strokeWidth="12" strokeOpacity="0.32" filter={`url(#${rawId}-glow)`} />
            <path
              d={d}
              fill="none"
              stroke="#e0faff"
              strokeWidth="3.4"
              markerEnd={`url(#${rawId}-arrow)`}
              filter={`url(#${rawId}-glow)`}
            />
          </g>
        );
      })}
      {placed.map((point) => {
        const lines = wrap(point.step.detail, 24).slice(0, 3);
        const mark = point.step.mark === "pulse" ? "check" : point.step.mark;
        return (
          <g key={point.step.term}>
            <circle cx={point.x} cy={point.y} r="34" fill="#22d3ee" opacity="0.12" filter={`url(#${rawId}-glow)`} />
            <circle cx={point.x} cy={point.y} r="26" fill="#07111c" stroke="#67e8f9" strokeWidth="1.7" filter={`url(#${rawId}-glow)`} />
            <svg x={point.x - 11} y={point.y - 11} width="22" height="22" viewBox="0 0 24 24">
              <IconPaths name={mark} />
            </svg>
            <text
              x={point.x}
              y={point.y + 46}
              textAnchor="middle"
              style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
            >
              <tspan x={point.x} fill="#67e8f9" fontSize="11">
                {point.index + 1}. {point.step.term.toUpperCase()}
              </tspan>
              {lines.map((line, lineIndex) => (
                <tspan
                  key={line}
                  x={point.x}
                  dy={lineIndex === 0 ? 15 : 13}
                  fill="#cbd5e1"
                  fontSize="11"
                  style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function OperatorFrame({ tone, title }: { tone: "red" | "green" | "list"; title: string }) {
  const rawId = useId().replace(/:/g, "");
  const accent = tone === "red" ? "#fb7185" : "#5eead4";
  return (
    <div
      className={`overflow-hidden rounded-md border bg-[#030814] ${tone === "red" ? "border-rose-300/50 shadow-[0_0_22px_-8px_rgba(251,113,133,0.9)]" : "border-cyan-200/40 shadow-[0_0_22px_-8px_rgba(34,211,238,0.85)]"}`}
      aria-hidden
    >
      <svg viewBox="0 0 340 148" className="h-36 w-full">
        <defs>
          <pattern id={`${rawId}-grid`} width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M14 0 H0 V14" fill="none" stroke="#22d3ee" strokeOpacity="0.13" />
          </pattern>
          <filter id={`${rawId}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`${rawId}-floor`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="340" height="148" fill="#030814" />
        <rect width="340" height="148" fill={`url(#${rawId}-grid)`} />
        <ellipse cx="160" cy="132" rx="90" ry="14" fill={`url(#${rawId}-floor)`} />
        <Person at={tone === "list" ? 48 : 72} />
        {tone === "list" ? <Checklist glow={rawId} /> : <Laptop glow={rawId} />}
        {tone === "list" ? null : (
          <g filter={`url(#${rawId}-glow)`}>
            <circle cx="286" cy="36" r="16" fill={tone === "red" ? "#1a0a10" : "#04221c"} stroke={accent} strokeWidth="1.8" />
            {tone === "red" ? (
              <path d="M278 28 L294 44 M294 28 L278 44" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
            ) : (
              <path d="M278 36 l6 6 12-12" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </g>
        )}
      </svg>
      <p
        className={`border-t px-2 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase ${tone === "red" ? "border-rose-300/30 text-rose-100" : "border-cyan-200/20 text-teal-100"}`}
      >
        {title}
      </p>
    </div>
  );
}

function Person({ at }: { at: number }) {
  return (
    <g transform={`translate(${at} 22)`} fill="#071820" stroke="#9ae8ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="34" cy="16" r="12" />
      <path d="M24 14c1-10 18-12 22 0" fill="none" />
      <path d="M30 28v7" fill="none" />
      <path d="M16 48c2-12 10-16 20-14 8 2 14 8 16 18l2 26H18l-2-22c-2-4-2-6 0-8z" />
      <path d="M46 52c18 8 32 10 48 2" fill="none" />
      <path d="M22 78c-4 14 2 20 12 18" fill="none" />
      <path d="M40 80c8 12 22 14 32 4" fill="none" />
    </g>
  );
}

function Laptop({ glow }: { glow: string }) {
  return (
    <g transform="translate(156 52)" filter={`url(#${glow}-glow)`}>
      <rect x="18" y="0" width="70" height="46" rx="3" fill="#071820" stroke="#67e8f9" strokeWidth="1.8" />
      <rect x="24" y="6" width="58" height="30" fill="#083044" stroke="none" />
      <path d="M30 16h40M30 24h26M30 32h32" fill="none" stroke="#d9faff" strokeWidth="1.4" opacity="0.8" />
      <path d="M4 48h108l-8 10H14z" fill="#071820" stroke="#67e8f9" strokeWidth="1.8" />
    </g>
  );
}

function Checklist({ glow }: { glow: string }) {
  return (
    <g transform="translate(176 18)" filter={`url(#${glow}-glow)`}>
      <rect width="112" height="100" rx="4" fill="#071820" stroke="#67e8f9" strokeWidth="1.7" />
      {[0, 1, 2].map((row) => (
        <g key={row} transform={`translate(0 ${18 + row * 22})`}>
          <path d="M16 6 l4 4 8-8" fill="none" stroke="#5eead4" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M40 8h52" fill="none" stroke="#67e8f9" strokeWidth="1.4" opacity={1 - row * 0.2} />
        </g>
      ))}
      <circle cx="86" cy="78" r="12" fill="#04221c" stroke="#5eead4" strokeWidth="1.6" />
      <path d="M80 78 l4 4 8-9" fill="none" stroke="#5eead4" strokeWidth="1.7" strokeLinecap="round" />
    </g>
  );
}

function EarthBackdrop() {
  const rawId = useId().replace(/:/g, "");
  return (
    <svg
      aria-hidden
      viewBox="0 0 480 720"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <radialGradient id={`${rawId}-space`} cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#07111f" />
          <stop offset="100%" stopColor="#02040a" />
        </radialGradient>
        <radialGradient id={`${rawId}-ocean`} cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor="#12304d" />
          <stop offset="28%" stopColor="#0a1c30" />
          <stop offset="100%" stopColor="#02040a" />
        </radialGradient>
        <radialGradient id={`${rawId}-flare`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="16%" stopColor="#e0f7ff" />
          <stop offset="40%" stopColor="#67e8f9" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${rawId}-air`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.55" />
          <stop offset="42%" stopColor="#0369a1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
        </linearGradient>
        <filter id={`${rawId}-bloom`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`${rawId}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <clipPath id={`${rawId}-disc`}>
          <circle cx="240" cy="1080" r="638" />
        </clipPath>
      </defs>
      <rect width="480" height="720" fill={`url(#${rawId}-space)`} />
      {HERO_STARS.map((star) => (
        <circle key={`${star.x}-${star.y}`} cx={star.x} cy={star.y} r={star.r} fill={star.fill} opacity={star.o} />
      ))}
      <rect x="0" y="300" width="480" height="150" fill={`url(#${rawId}-air)`} />
      <circle cx="240" cy="1080" r="676" fill="none" stroke="#0284c7" strokeWidth="70" opacity="0.45" filter={`url(#${rawId}-bloom)`} />
      <circle cx="240" cy="1080" r="652" fill="none" stroke="#e0f7ff" strokeWidth="14" opacity="0.95" filter={`url(#${rawId}-soft)`} />
      <circle cx="240" cy="1080" r="640" fill={`url(#${rawId}-ocean)`} />
      <g clipPath={`url(#${rawId}-disc)`}>
        {CITY_LIGHTS.map((light) => (
          <circle key={`${light.x}-${light.y}-${light.r}`} cx={light.x} cy={light.y} r={light.r} fill={light.fill} opacity={light.o} />
        ))}
      </g>
      <circle cx="240" cy="1080" r="640" fill="none" stroke="#ffffff" strokeWidth="2.4" />
      <ellipse cx="168" cy="436" rx="90" ry="12" fill={`url(#${rawId}-flare)`} />
      <ellipse cx="280" cy="444" rx="210" ry="8" fill="#bae6fd" opacity="0.55" />
    </svg>
  );
}

function PanelHead({ index, kicker, title }: { index: string; kicker: string; title: string }) {
  return (
    <header className="relative z-10 px-4 pt-4 sm:px-5 sm:pt-5">
      <p className="font-mono text-[10px] tracking-[0.22em] text-cyan-300 uppercase">
        {index}. {kicker}
      </p>
      <p className="mt-1 font-display text-lg leading-tight font-semibold text-white sm:text-xl">{title}</p>
    </header>
  );
}

function StarWash() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-80"
      style={{ backgroundImage: STARS }}
    />
  );
}

function StepRow({ index, step }: { index: number; step: HandbookFigureStep }) {
  return (
    <li className="relative flex gap-3 pb-4">
      <GlowDot mark={step.mark === "pulse" ? "check" : step.mark} />
      <span>
        <span className="block font-mono text-[11px] tracking-[0.14em] text-cyan-200 uppercase">
          {index + 1}. {step.term}
        </span>
        <span className="mt-1 block text-sm leading-snug text-slate-200">{step.detail}</span>
      </span>
    </li>
  );
}

function recoveryTone(step: HandbookFigureStep): "cyan" | "red" | "ok" {
  if (step.mark === "cross") return "red";
  if (step.mark === "check" || step.mark === "play") return "ok";
  return "cyan";
}

function GlowDot({
  mark,
  tone = "cyan",
  large = false,
}: {
  mark?: HandbookMark;
  tone?: "cyan" | "red" | "ok";
  large?: boolean;
}) {
  const size = large ? "h-16 w-16" : "h-11 w-11";
  const ring =
    tone === "red"
      ? `${size} border-rose-300 shadow-[0_0_26px_rgba(251,113,133,0.8),inset_0_0_14px_rgba(251,113,133,0.4)]`
      : tone === "ok"
        ? `${size} border-teal-200 shadow-[0_0_16px_rgba(94,234,212,0.75),inset_0_0_10px_rgba(94,234,212,0.28)]`
        : `${size} border-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.7),inset_0_0_10px_rgba(34,211,238,0.28)]`;
  return (
    <span className={`relative z-10 flex shrink-0 items-center justify-center rounded-full border bg-[#071018] ${ring}`}>
      <HtmlIcon name={mark} tone={tone} className={large ? "h-7 w-7" : "h-5 w-5"} />
    </span>
  );
}

function HtmlIcon({
  name,
  tone = "cyan",
  className,
}: {
  name?: HandbookMark;
  tone?: "cyan" | "red" | "ok";
  className: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <IconPaths name={name} tone={tone} />
    </svg>
  );
}

function PathGlyph({ name, color }: { name: "card" | "book" | "story" | "bars"; color: string }) {
  const props = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "card") return <path d="M2 2h12v12H2zM5 5h6M5 8h4" {...props} />;
  if (name === "book") return <path d="M2 2c3 1 5 1 6 0v12c-1 1-3 1-6 0V2zm6 0c3 1 5 1 6 0v12c-1 1-3 1-6 0" {...props} />;
  if (name === "story") return <path d="M3 2h10v8H6L3 12V2z" {...props} />;
  return <path d="M2 12V8M6 12V4M10 12V6M14 12V2" {...props} />;
}

function StopLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  if (href.endsWith(".html")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function figureOf(page: HandbookPage, kind: HandbookFigure["kind"]) {
  return sectionOf(page, kind)?.figure;
}

function sectionOf(page: HandbookPage, kind: HandbookFigure["kind"]) {
  return page.sections.find((section) => section.figure?.kind === kind);
}

function ringSteps(figure: HandbookFigure | undefined) {
  const steps = figure?.steps ?? [];
  const wanted: HandbookMark[] = ["refresh", "code", "gear", "merge", "pulse"];
  const ordered = wanted
    .map((mark) => steps.find((step) => step.mark === mark))
    .filter((step): step is HandbookFigureStep => Boolean(step));
  if (ordered.length >= 5) return ordered.slice(0, 5);
  return steps.filter((step) => step.mark !== "wrench").slice(0, 5);
}

function operatingLines(rule: string | undefined) {
  if (!rule) return [];
  const body = rule.replace(/^My operating rule:\s*/i, "").replace(/\.$/, "");
  return body.split(/,\s*/).map((part) => {
    const trimmed = part.replace(/^and\s+/i, "");
    const sentence = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    return sentence.endsWith(".") ? sentence : `${sentence}.`;
  });
}

function curvedArrow(
  from: { x: number; y: number },
  to: { x: number; y: number },
  center: { x: number; y: number },
  bulge: number,
  pad: number,
) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = mx - center.x;
  const dy = my - center.y;
  const length = Math.hypot(dx, dy) || 1;
  const control = { x: mx + (dx / length) * bulge, y: my + (dy / length) * bulge };
  const start = travel(from, to, pad);
  const end = travel(to, from, pad + 10);
  return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
}

function travel(from: { x: number; y: number }, toward: { x: number; y: number }, distance: number) {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: from.x + (dx / length) * distance, y: from.y + (dy / length) * distance };
}

function roadRibbon(points: Array<[number, number]>) {
  const top: Array<[number, number]> = [];
  const bottom: Array<[number, number]> = [];
  points.forEach(([x, y], index) => {
    const half = 26 - (index / Math.max(points.length - 1, 1)) * 16;
    top.push([x, y - half]);
    bottom.push([x, y + half]);
  });
  const forward = smoothPath(top, 0.55);
  const back = smoothPath([...bottom].reverse(), 0.55).replace(/^M/, "L");
  return `${forward} ${back} Z`;
}

function smoothPath(points: Array<[number, number]>, tension: number) {
  const scale = (1 - tension) / 2;
  const first = points[0];
  if (!first) return "";
  let path = `M ${first[0]} ${first[1]}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(index - 1, 0)] ?? first;
    const p1 = points[index] ?? first;
    const p2 = points[index + 1] ?? p1;
    const p3 = points[Math.min(index + 2, points.length - 1)] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) * scale;
    const c1y = p1[1] + (p2[1] - p0[1]) * scale;
    const c2x = p2[0] - (p3[0] - p1[0]) * scale;
    const c2y = p2[1] - (p3[1] - p1[1]) * scale;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return path;
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

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function starField(count: number, seed: number) {
  const rand = mulberry32(seed);
  const layers: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const x = Math.round(rand() * 100);
    const y = Math.round(rand() * 100);
    const opacity = (0.2 + rand() * 0.75).toFixed(2);
    const radius = rand() > 0.92 ? 1.5 : 1;
    layers.push(`radial-gradient(${radius}px ${radius}px at ${x}% ${y}%, rgba(255,255,255,${opacity}), transparent)`);
  }
  return layers.join(",");
}

const HERO_STARS = scatterStars(70, 3, 480, 430);
const NIGHT_STARS = scatterStars(40, 9, 960, 160);
const CITY_LIGHTS = buildCityLights();
const TOWN_LIGHTS = buildTownLights();

function scatterStars(count: number, seed: number, width: number, height: number) {
  const rand = mulberry32(seed);
  const stars: Array<{ x: number; y: number; r: number; o: number; fill: string }> = [];
  for (let index = 0; index < count; index += 1) {
    stars.push({
      x: Math.round(rand() * width),
      y: Math.round(rand() * height),
      r: rand() > 0.9 ? 1.6 : 0.8,
      o: 0.35 + rand() * 0.65,
      fill: rand() > 0.85 ? "#a5f3fc" : "#ffffff",
    });
  }
  return stars;
}

function buildCityLights() {
  const rand = mulberry32(21);
  const lights: Array<{ x: number; y: number; r: number; fill: string; o: number }> = [];
  const colors = ["#fff7ed", "#fde68a", "#ffffff", "#fef3c7"];
  for (let index = 0; index < 2400 && lights.length < 420; index += 1) {
    const bias = (rand() + rand()) / 2;
    const angle = -Math.PI / 2 + (bias - 0.5) * 1.15;
    const depth = rand() * rand();
    const radius = 636 - depth * 150;
    const x = 240 + Math.cos(angle) * radius;
    const y = 1080 + Math.sin(angle) * radius;
    if (x < 8 || x > 472 || y < 448 || y > 680) continue;
    const fill = colors[Math.floor(rand() * colors.length)] ?? "#fff";
    const bright = rand() > 0.94;
    lights.push({
      x,
      y,
      r: bright ? 1.7 : 0.45 + rand() * 0.7,
      fill,
      o: bright ? 0.95 : 0.45 + rand() * 0.5,
    });
  }
  return lights;
}

function buildTownLights() {
  const rand = mulberry32(17);
  const lights: Array<{ x: number; y: number; r: number; fill: string; o: number }> = [];
  for (let index = 0; index < 70; index += 1) {
    lights.push({
      x: 40 + rand() * 900,
      y: 150 + rand() * 70,
      r: rand() > 0.8 ? 1.8 : 0.9,
      fill: rand() > 0.7 ? "#fde68a" : "#fb923c",
      o: 0.35 + rand() * 0.5,
    });
  }
  return lights;
}
