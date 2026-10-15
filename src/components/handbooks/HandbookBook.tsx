"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Handbook, HandbookPage, HandbookSection } from "@/content/handbooks";
import { HandbookSpread, type SpreadPanel } from "@/components/handbooks/HandbookBoard";
import { HandbookFigureView } from "@/components/handbooks/HandbookFigures";
import { SiteLink } from "@/components/handbooks/SiteLink";
import { EssayFeedback } from "@/components/writes/EssayFeedback";
import type { EssayFeedbackEntry } from "@/lib/essay-feedback-types";
import { pagePath } from "@/lib/handbooks";

const BOARD_FIGURES = new Set(["loop", "recovery", "signals", "scene", "compare", "pyramid"]);

const OPENING: SpreadPanel[][] = [
  ["hero", "loop"],
  ["recovery", "scene"],
  ["pyramid"],
  ["signals", "distinctions"],
  ["path"],
];

type Block = {
  key: string;
  sectionId?: string;
  sectionTitle?: string;
  node: ReactNode;
};

type PackedLeaf = {
  start: number;
  end: number;
  offset: number;
};

export function HandbookBook({
  handbook,
  page,
  feedbackEntries,
  feedbackSlug,
  showFeedback,
}: {
  handbook: Handbook;
  page: HandbookPage;
  feedbackEntries: EssayFeedbackEntry[];
  feedbackSlug: string;
  showFeedback: boolean;
}) {
  const router = useRouter();
  const slotRef = useRef<HTMLDivElement>(null);
  const pageStamp = useRef<number | null>(null);
  const landAtEnd = useRef(false);
  const turnRef = useRef<(direction: -1 | 1) => void>(() => {});
  const [leaves, setLeaves] = useState<PackedLeaf[]>([]);
  const [index, setIndex] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const blocks = useMemo(
    () => proseBlocks(page, showFeedback, feedbackSlug, feedbackEntries, narrow),
    [page, showFeedback, feedbackSlug, feedbackEntries, narrow],
  );
  const spreads = page.plate === "horizon" ? (narrow ? OPENING.flat().map((panel) => [panel]) : OPENING) : [];
  const leafCount = spreads.length + leaves.length;
  const safeIndex = Math.min(index, Math.max(leafCount - 1, 0));
  const spread = safeIndex < spreads.length ? spreads[safeIndex] : null;
  const proseLeaf = spread ? null : (leaves[safeIndex - spreads.length] ?? null);
  const sectionTitle = proseLeaf
    ? blocks.slice(proseLeaf.start, proseLeaf.end).map((block) => block.sectionTitle).find(Boolean)
    : undefined;

  const previousHref = page.number <= 1 ? "/handbooks" : pagePath(handbook.slug, page.number - 1);
  const nextPage = handbook.pages.find((item) => item.number === page.number + 1) ?? null;
  const nextHref = nextPage ? pagePath(handbook.slug, nextPage.number) : null;
  const canPrev = safeIndex > 0 || previousHref !== null;
  const canNext = safeIndex < leafCount - 1 || (leaves.length > 0 && nextHref !== null);

  useLayoutEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const apply = () => setNarrow(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousRoot = root.style.overflow;
    const previousBody = body.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousRoot;
      body.style.overflow = previousBody;
    };
  }, []);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const pack = () => {
      const packed = packBlocks(slot, blocks);
      setLeaves((existing) => (samePack(existing, packed) ? existing : packed));
      return packed;
    };
    const packed = pack();
    const url = new URL(window.location.href);
    const fromEnd = url.searchParams.get("from") === "end";
    const hash = url.hash.replace(/^#/, "");
    const pageChanged = pageStamp.current !== page.number;
    const watch = () => {
      const observer = new ResizeObserver(() => pack());
      observer.observe(slot);
      const column = slot.firstElementChild;
      if (column) observer.observe(column);
      const fonts = document.fonts?.ready.then(() => pack());
      return () => {
        observer.disconnect();
        void fonts?.then(() => undefined);
      };
    };
    if (!pageChanged && !fromEnd) return watch();
    pageStamp.current = page.number;
    if (fromEnd) {
      url.searchParams.delete("from");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      landAtEnd.current = true;
      setIndex(spreads.length + Math.max(packed.length, 1) - 1);
    } else if (hash) {
      const proseIndex = packed.findIndex((leaf) =>
        blocks.slice(leaf.start, leaf.end).some((block) => block.sectionId === hash),
      );
      setIndex(proseIndex >= 0 ? spreads.length + proseIndex : 0);
    } else {
      setIndex(0);
    }
    return watch();
  }, [blocks, page.number, spreads.length]);

  useEffect(() => {
    if (!landAtEnd.current || leaves.length === 0) return;
    landAtEnd.current = false;
    setIndex(spreads.length + leaves.length - 1);
  }, [leaves, spreads.length]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        turnRef.current(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        turnRef.current(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function turn(direction: -1 | 1) {
    const last = leafCount - 1;
    if (direction < 0) {
      if (safeIndex > 0) {
        setIndex(safeIndex - 1);
        return;
      }
      if (page.number > 1) router.push(`${previousHref}?from=end`);
      else router.push(previousHref);
      return;
    }
    if (safeIndex < last) {
      setIndex(safeIndex + 1);
      return;
    }
    if (nextHref && leaves.length > 0) router.push(nextHref);
  }

  useEffect(() => {
    turnRef.current = turn;
  });

  const offset = proseLeaf?.offset ?? 0;

  const folio = leafCount === 0 ? "" : `${safeIndex + 1} / ${leafCount}`;

  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch lg:gap-2"
      data-handbook-book
      data-leaf={safeIndex}
      data-leaf-count={leafCount}
    >
      <TurnButton label="Previous page" disabled={!canPrev} onClick={() => turn(-1)} className="hidden lg:grid">
        <ChevronLeft className="h-6 w-6" />
      </TurnButton>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-y border-cyan-300/25 bg-[#040914] lg:rounded-md lg:border lg:shadow-[0_0_60px_-28px_rgba(34,211,238,0.45)]">
        <div className="relative min-h-0 flex-1">
          {spread ? (
            <div className="absolute inset-0 z-10 p-0 lg:p-3 lg:pb-8">
              <HandbookSpread handbook={handbook} page={page} panels={spread} />
            </div>
          ) : null}
          <div className={`${spread ? "invisible" : ""} flex h-full min-h-0 flex-col px-4 pt-3 pb-3 sm:px-8 lg:px-10 lg:pt-4 lg:pb-8`}>
            <header className="mb-3 flex h-5 shrink-0 items-baseline justify-between gap-4">
              <p className="min-w-0 truncate font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
                <span className="hidden sm:inline">
                  {handbook.title}
                  <span className="px-2 text-slate-600">/</span>
                </span>
                <span className="text-slate-300">{sectionTitle ?? page.title}</span>
              </p>
              <p className="shrink-0 font-mono text-xs tabular-nums text-slate-400">{page.number}</p>
            </header>
            <div ref={slotRef} className="min-h-0 flex-1 overflow-hidden">
              <div className="relative mx-auto w-full max-w-3xl" style={{ transform: `translateY(-${offset}px)` }}>
                {blocks.map((block, blockIndex) => {
                  const inLeaf = !proseLeaf || (blockIndex >= proseLeaf.start && blockIndex < proseLeaf.end);
                  return (
                    <div
                      key={block.key}
                      data-leaf-block={blockIndex}
                      aria-hidden={inLeaf ? undefined : true}
                      style={inLeaf ? undefined : { visibility: "hidden" }}
                    >
                      {block.node}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="pointer-events-none absolute inset-x-0 bottom-2 z-20 hidden text-center font-mono text-[0.65rem] tabular-nums tracking-[0.14em] text-slate-500 lg:block">
            {folio}
          </p>
        </div>
        <div className="flex h-11 shrink-0 items-center justify-between border-t border-white/10 px-1 lg:hidden">
          <TurnButton label="Previous page" disabled={!canPrev} onClick={() => turn(-1)} wide>
            <ChevronLeft className="h-6 w-6" />
          </TurnButton>
          <p className="font-mono text-xs tabular-nums tracking-[0.14em] text-slate-400">{folio}</p>
          <TurnButton label="Next page" disabled={!canNext} onClick={() => turn(1)} wide>
            <ChevronRight className="h-6 w-6" />
          </TurnButton>
        </div>
      </div>
      <TurnButton label="Next page" disabled={!canNext} onClick={() => turn(1)} className="hidden lg:grid">
        <ChevronRight className="h-6 w-6" />
      </TurnButton>
    </div>
  );
}

function TurnButton({
  label,
  disabled,
  onClick,
  wide = false,
  className = "",
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`focus-ring grid shrink-0 place-items-center rounded-md text-slate-200 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:text-slate-700 ${wide ? "h-11 w-12" : "w-10 lg:w-12"} ${className}`}
    >
      {children}
    </button>
  );
}

function packBlocks(slot: HTMLElement, blocks: Block[]): PackedLeaf[] {
  const available = slot.clientHeight;
  const budget = available > 36 ? available - 20 : available;
  const nodes = [...slot.querySelectorAll<HTMLElement>("[data-leaf-block]")];
  const packed: PackedLeaf[] = [];
  let start = 0;
  let leafTop = nodes.find((node) => node.offsetHeight > 0)?.offsetTop ?? 0;
  let seen = 0;
  const openLeaf = (end: number, nextTop: number) => {
    if (end <= start) return;
    packed.push({ start, end, offset: leafTop });
    start = end;
    leafTop = nextTop;
  };
  nodes.forEach((node, index) => {
    const height = node.offsetHeight;
    if (height <= 0) return;
    seen += 1;
    const top = node.offsetTop;
    const overflows = seen > 1 && top + height - leafTop > budget && budget > 0;
    if (!overflows) return;
    let end = index;
    if (blocks[end - 1]?.key.endsWith("-title") && end - 1 > start) end -= 1;
    if (end > start) openLeaf(end, nodes[end]?.offsetTop ?? top);
    if (index > start && top + height - leafTop > budget && budget > 0) openLeaf(index, top);
  });
  if (seen > 0) packed.push({ start, end: blocks.length, offset: leafTop });
  return packed;
}

function samePack(left: PackedLeaf[], right: PackedLeaf[]) {
  if (left.length !== right.length) return false;
  return left.every((leaf, index) => {
    const other = right[index];
    return leaf.start === other?.start && leaf.end === other?.end && leaf.offset === other?.offset;
  });
}

function proseBlocks(
  page: HandbookPage,
  showFeedback: boolean,
  feedbackSlug: string,
  feedbackEntries: EssayFeedbackEntry[],
  narrow: boolean,
): Block[] {
  const blocks: Block[] = [
    {
      key: "open",
      node: (
        <div className="pb-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">{page.topic}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{page.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-200 sm:text-lg">{page.lede}</p>
          {page.rule ? (
            <p className="mt-4 border-l border-cyan-300/70 pl-4 text-base leading-relaxed text-white">{page.rule}</p>
          ) : null}
        </div>
      ),
    },
  ];
  page.sections.forEach((section) => {
    blocks.push({
      key: `${section.id}-title`,
      sectionId: section.id,
      sectionTitle: section.title,
      node: (
        <h2 id={section.id} className="pt-2 pb-3 font-display text-2xl font-semibold tracking-tight text-white">
          {section.title}
        </h2>
      ),
    });
    blocks.push(...sectionBlocks(section, page.plate === "horizon", narrow));
  });
  blocks.push({
    key: "sources",
    sectionTitle: "References",
    node: (
      <div className="border-t border-white/10 pt-5 pb-4">
        <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">References</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed">
          {page.sources.map((source) => (
            <li key={source.href}>
              <SiteLink href={source.href}>{source.label}</SiteLink>
            </li>
          ))}
        </ul>
      </div>
    ),
  });
  if (showFeedback) {
    blocks.push({
      key: "notes",
      sectionTitle: "Notes",
      node: (
        <div className="border-t border-white/10 pt-6 pb-4">
          <EssayFeedback slug={feedbackSlug} initialEntries={feedbackEntries} notesLabel="Notes on this page" />
        </div>
      ),
    });
  }
  return blocks;
}

function sectionBlocks(section: HandbookSection, hideBoardFigure: boolean, narrow: boolean): Block[] {
  const blocks: Block[] = [];
  section.paragraphs?.forEach((paragraph, index) => {
    blocks.push({
      key: `${section.id}-p-${index}`,
      sectionId: section.id,
      sectionTitle: section.title,
      node: <p className="pb-4 text-base leading-relaxed text-slate-300">{paragraph}</p>,
    });
  });
  if (section.figure && !(hideBoardFigure && BOARD_FIGURES.has(section.figure.kind))) {
    if (narrow && section.figure.kind === "flow") {
      section.figure.steps.forEach((step, index) => {
        blocks.push({
          key: `${section.id}-flow-${index}`,
          sectionId: section.id,
          sectionTitle: section.title,
          node: (
            <div className="flex gap-3 pb-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-cyan-200/50 font-mono text-xs text-cyan-100">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-cyan-200">{step.term}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-200">{step.detail}</span>
              </span>
            </div>
          ),
        });
      });
      if (section.figure.caption) {
        blocks.push({
          key: `${section.id}-flow-caption`,
          sectionId: section.id,
          sectionTitle: section.title,
          node: <p className="pb-4 text-sm leading-relaxed text-slate-400">{section.figure.caption}</p>,
        });
      }
    } else {
      blocks.push({
        key: `${section.id}-figure`,
        sectionId: section.id,
        sectionTitle: section.title,
        node: (
          <div className="pb-4">
            <HandbookFigureView figure={section.figure} />
          </div>
        ),
      });
    }
  }
  section.steps?.forEach((step, index) => {
    blocks.push({
      key: `${section.id}-step-${index}`,
      sectionId: section.id,
      sectionTitle: section.title,
      node: (
        <div className="flex gap-3 pb-3 text-base leading-relaxed text-slate-300">
          <span className="w-5 shrink-0 font-mono text-sm text-cyan-200">{index + 1}</span>
          <span>{step}</span>
        </div>
      ),
    });
  });
  if (section.sources?.length) {
    blocks.push({
      key: `${section.id}-sources`,
      sectionId: section.id,
      sectionTitle: section.title,
      node: (
        <p className="pb-5 text-sm leading-relaxed text-slate-400">
          {section.sources.map((source, index) => (
            <span key={source.href}>
              {index > 0 ? <span className="px-2 text-slate-600">·</span> : null}
              <SiteLink href={source.href}>{source.label}</SiteLink>
            </span>
          ))}
        </p>
      ),
    });
  }
  return blocks;
}
