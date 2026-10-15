import Link from "next/link";
import { useId, type ReactNode } from "react";
import type {
  Handbook,
  HandbookFigure,
  HandbookMark,
  HandbookPage,
} from "@/content/handbooks";
import { LoopPlate, PyramidPlate, RecoveryPlate, ScenePlate } from "@/components/handbooks/HandbookPlates";
import { IconPaths } from "@/components/handbooks/icon-paths";

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
  const pyramid = figureOf(page, "pyramid");
  const sceneSection = sectionOf(page, "scene");

  return (
    <div
      data-handbook-board
      className="scroll-mt-28 rounded-xl border border-cyan-400/15 bg-[#02060e] p-2 shadow-[0_0_80px_-24px_rgba(34,211,238,0.35)] sm:p-3"
    >
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <EarthHero handbook={handbook} page={page} />
        </div>
        <div className="xl:col-span-8">
          <DailyLoop figure={loop} />
        </div>
        <div className="xl:col-span-5">
          <BrokenMain figure={recovery} />
        </div>
        <div className="xl:col-span-7">
          <IllustrativeScene figure={scene} disclaimer={sceneSection?.paragraphs?.[0]} />
        </div>
        <div className="xl:col-span-12">
          <TestShape figure={pyramid} />
        </div>
        <div className="xl:col-span-6">
          <SignalTable figure={signals} />
        </div>
        <div className="xl:col-span-6">
          <Distinctions figure={compare} />
        </div>
        <div className="xl:col-span-12">
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
    <section className={`${PANEL} h-full min-h-[28rem]`} data-board-panel="hero" aria-label={handbook.title}>
      <EarthBackdrop />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-44 bg-gradient-to-t from-[#02040a] via-[#02040a]/80 to-transparent" />
      <div className="relative z-10 flex h-full min-h-[28rem] flex-1 flex-col px-5 pt-5 pb-6 sm:px-6 sm:pt-6">
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
  return (
    <section className={`${PANEL} h-full`} data-board-panel="loop">
      <StarWash />
      <PanelHead index="2" kicker="The daily loop" title="Small enough to merge today." />
      {figure?.caption ? <PanelLede>{figure.caption}</PanelLede> : null}
      <div className="relative z-10 flex flex-1 flex-col px-3 pt-3 pb-4 sm:px-4">{figure ? <LoopPlate figure={figure} /> : null}</div>
    </section>
  );
}

function BrokenMain({ figure }: { figure: HandbookFigure | undefined }) {
  return (
    <section className={`${PANEL} h-full`} data-board-panel="recovery">
      <StarWash />
      <PanelHead index="3" kicker="A broken main" title="Feature work waits." />
      <div className="relative z-10 flex flex-1 flex-col px-3 pt-3 pb-4 sm:px-4">
        {figure ? <RecoveryPlate figure={figure} /> : null}
      </div>
    </section>
  );
}

function SignalTable({ figure }: { figure: HandbookFigure | undefined }) {
  const steps = figure?.steps ?? [];
  return (
    <section className={PANEL} data-board-panel="signals">
      <StarWash />
      <PanelHead index="6" kicker="How I would know" title="Four signals. No target times." />
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
  disclaimer,
}: {
  figure: HandbookFigure | undefined;
  disclaimer?: string;
}) {
  return (
    <section className={`${PANEL} h-full`} data-board-panel="scene">
      <StarWash />
      <PanelHead index="4" kicker="An illustrative break" title="A renamed field, then a revert." />
      <div className="relative z-10 flex flex-1 flex-col px-3 pt-4 pb-4 sm:px-4">
        {figure ? <ScenePlate figure={figure} disclaimer={disclaimer} /> : null}
      </div>
    </section>
  );
}

function TestShape({ figure }: { figure: HandbookFigure | undefined }) {
  return (
    <section className={PANEL} data-board-panel="pyramid">
      <StarWash />
      <PanelHead index="5" kicker="The tests" title="The wide base is the commit build." />
      <div className="relative z-10 px-3 pt-3 pb-4 sm:px-4">{figure ? <PyramidPlate figure={figure} /> : null}</div>
    </section>
  );
}

function Distinctions({ figure }: { figure: HandbookFigure | undefined }) {
  const columns = figure?.columns ?? [];
  return (
    <section className={PANEL} data-board-panel="compare">
      <StarWash />
      <PanelHead index="7" kicker="Key distinctions" title="A green build is not the release." />
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
          <p className="font-mono text-[10px] tracking-[0.22em] text-cyan-300 uppercase">8. The bigger picture</p>
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

function PanelLede({ children }: { children: ReactNode }) {
  return <p className="relative z-10 px-4 pt-2 text-sm leading-relaxed text-slate-300 sm:px-5">{children}</p>;
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

function operatingLines(rule: string | undefined) {
  if (!rule) return [];
  const body = rule.replace(/^My operating rule:\s*/i, "").replace(/\.$/, "");
  return body.split(/,\s*/).map((part) => {
    const trimmed = part.replace(/^and\s+/i, "");
    const sentence = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    return sentence.endsWith(".") ? sentence : `${sentence}.`;
  });
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
