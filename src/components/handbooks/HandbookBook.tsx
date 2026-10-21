"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Handbook, HandbookPage, HandbookPicture, HandbookSection } from "@/content/handbooks";
import { HandbookSpread, type SpreadPanel } from "@/components/handbooks/HandbookBoard";
import { ChapterRail } from "@/components/handbooks/ChapterRail";
import { CompareCard, HandbookFigureView, SheetGate, SheetRow, UsesHead, UsesRow } from "@/components/handbooks/HandbookFigures";
import { SiteLink } from "@/components/handbooks/SiteLink";
import { EssayFeedback } from "@/components/writes/EssayFeedback";
import type { EssayFeedbackEntry } from "@/lib/essay-feedback-types";
import { adjacentPages, pagePath } from "@/lib/handbooks";

const BOARD_FIGURES = new Set(["loop", "recovery", "signals", "scene", "compare", "pyramid"]);

const PLATES_AFTER: Record<string, SpreadPanel[]> = {
  day: ["loop"],
  broken: ["recovery"],
  scenario: ["scene"],
  tests: ["pyramid"],
  measure: ["signals"],
  limits: ["distinctions", "path"],
};

type Block = {
  key: string;
  sectionId?: string;
  sectionTitle?: string;
  /** Blocks that stay one figure when the group fits a leaf, and otherwise break between blocks. */
  group?: string;
  platesAfter?: SpreadPanel[];
  picturesAfter?: HandbookPicture[];
  /** Shown only when this block opens a leaf. */
  lead?: ReactNode;
  node: ReactNode;
};

type ShownLeaf =
  | { kind: "plate"; panel: SpreadPanel }
  | { kind: "picture"; picture: HandbookPicture; role: "section"; title?: string }
  | { kind: "prose"; leaf: PackedLeaf };

type PackedLeaf = {
  start: number;
  end: number;
  offset: number;
  limit: number;
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
  const warm = handbook.slug === "data-that-drives-decisions";
  const blocks = useMemo(
    () => proseBlocks(page, showFeedback, feedbackSlug, feedbackEntries, narrow, warm),
    [page, showFeedback, feedbackSlug, feedbackEntries, narrow, warm],
  );
  const shown = useMemo(
    () => composeLeaves(leaves, blocks, page.plate),
    [leaves, blocks, page.plate],
  );
  const leafCount = shown.length;
  const safeIndex = Math.min(index, Math.max(leafCount - 1, 0));
  const current = shown[safeIndex];
  const spread = current?.kind === "plate" ? [current.panel] : null;
  const picture = current?.kind === "picture" ? current : null;
  const proseLeaf = current?.kind === "prose" ? current.leaf : null;
  const sectionTitle = proseLeaf
    ? blocks.slice(proseLeaf.start, proseLeaf.end).map((block) => block.sectionTitle).find(Boolean)
    : undefined;

  const { previous: previousPage, next: nextPage } = adjacentPages(handbook, page.number);
  const previousHref = previousPage ? pagePath(handbook.slug, previousPage.number) : "/handbooks";
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
    if (slot.scrollTop !== 0) slot.scrollTop = 0;
    const packed = pack();
    const url = new URL(window.location.href);
    const fromEnd = url.searchParams.get("from") === "end";
    const hash = url.hash.replace(/^#/, "");
    const pageChanged = pageStamp.current !== page.number;
    const watch = () => {
      const pin = () => {
        if (slot.scrollTop !== 0) slot.scrollTop = 0;
      };
      pin();
      slot.addEventListener("scroll", pin);
      const observer = new ResizeObserver(() => pack());
      observer.observe(slot);
      const column = slot.firstElementChild;
      if (column) observer.observe(column);
      const fonts = document.fonts?.ready.then(() => pack());
      return () => {
        slot.removeEventListener("scroll", pin);
        observer.disconnect();
        void fonts?.then(() => undefined);
      };
    };
    if (!pageChanged && !fromEnd && !hash) return watch();
    if (pageChanged) pageStamp.current = page.number;
    const sequence = composeLeaves(packed, blocks, page.plate);
    if (fromEnd && pageChanged) {
      url.searchParams.delete("from");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      landAtEnd.current = true;
      setIndex(Math.max(sequence.length - 1, 0));
    } else if (hash) {
      const proseIndex = sequence.findIndex(
        (item) => item.kind === "prose" && blocks.slice(item.leaf.start, item.leaf.end).some((block) => block.sectionId === hash),
      );
      setIndex(proseIndex >= 0 ? proseIndex : 0);
    } else if (pageChanged) {
      setIndex(0);
    }
    return watch();
  }, [blocks, page.number, page.plate]);

  useEffect(() => {
    if (!landAtEnd.current || shown.length === 0) return;
    landAtEnd.current = false;
    setIndex(shown.length - 1);
  }, [shown.length]);

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
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-y bg-[#040914] lg:rounded-md lg:border ${
          warm
            ? "border-amber-200/30 lg:shadow-[0_0_60px_-28px_rgba(251,191,36,0.4)]"
            : "border-cyan-300/25 lg:shadow-[0_0_60px_-28px_rgba(34,211,238,0.45)]"
        }`}
      >
        <ChapterRail handbook={handbook} page={page} />
        <div className="relative min-h-0 flex-1">
          {page.ground && !spread && !picture ? (
            <div className="pointer-events-none absolute inset-0" aria-hidden="true" data-handbook-ground>
              <Image
                src={page.ground.src}
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-[#040914]/88 lg:bg-[#040914]/25" />
            </div>
          ) : null}
          {spread ? (
            <div className="absolute inset-0 z-10 p-0 lg:p-3 lg:pb-8">
              <HandbookSpread handbook={handbook} page={page} panels={spread} />
            </div>
          ) : null}
          {picture ? (
            <div className="absolute inset-0 z-10 p-0 lg:p-3 lg:pb-8">
              <PictureLeaf leaf={picture} />
            </div>
          ) : null}
          <div className={`relative z-10 ${spread || picture ? "invisible" : ""} flex h-full min-h-0 flex-col px-4 pt-3 pb-3 sm:px-8 lg:px-10 lg:pt-4 lg:pb-8`}>
            {page.ground ? (
              <div
                className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-[min(64rem,100%)] -translate-x-1/2 bg-[#040914]"
                aria-hidden="true"
              />
            ) : null}
            <header className="relative z-10 mb-3 flex h-5 shrink-0 items-baseline justify-between gap-4">
              <p className="min-w-0 truncate font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
                <span className="hidden sm:inline">
                  {handbook.title}
                  <span className="px-2 text-slate-600">/</span>
                </span>
                <span className="text-slate-300">{sectionTitle ?? page.title}</span>
              </p>
              <p className="shrink-0 font-mono text-xs tabular-nums text-slate-400">{page.number}</p>
            </header>
            <div ref={slotRef} className="relative z-10 min-h-0 flex-1 overflow-clip">
              <div
                className="relative mx-auto w-full max-w-3xl"
                style={{
                  transform: `translateY(-${offset}px)`,
                  clipPath: proseLeaf ? `inset(${proseLeaf.offset}px 0 calc(100% - ${proseLeaf.limit}px) 0)` : undefined,
                }}
              >
                {blocks.map((block, blockIndex) => {
                  const inLeaf = !proseLeaf || (blockIndex >= proseLeaf.start && blockIndex < proseLeaf.end);
                  return (
                    <div
                      key={block.key}
                      data-leaf-block={blockIndex}
                      aria-hidden={inLeaf ? undefined : true}
                      style={inLeaf ? undefined : { visibility: "hidden" }}
                    >
                      {proseLeaf && blockIndex === proseLeaf.start ? block.lead : null}
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

type Piece = { index: number; top: number; bottom: number; title: boolean; broken: boolean };

function blockEnd(pieces: Piece[], start: number): Piece {
  let last = pieces[start];
  for (let index = start; index < pieces.length && pieces[index].index === last.index; index += 1) last = pieces[index];
  return last;
}

function blockFitsFresh(pieces: Piece[], start: number, budget: number): boolean {
  const last = blockEnd(pieces, start);
  return last.bottom - pieces[start].top <= budget;
}

function blockFitsHere(pieces: Piece[], start: number, offset: number, budget: number): boolean {
  return blockEnd(pieces, start).bottom - offset <= budget;
}

function groupBounds(pieces: Piece[], blocks: Block[], blockIndex: number): { top: number; bottom: number } | null {
  const group = blocks[blockIndex]?.group;
  if (!group || (blockIndex > 0 && blocks[blockIndex - 1]?.group === group)) return null;
  let last = blockIndex;
  while (last + 1 < blocks.length && blocks[last + 1]?.group === group) last += 1;
  const first = pieces.find((piece) => piece.index === blockIndex);
  let end = first;
  for (const piece of pieces) {
    if (piece.index === last) end = piece;
  }
  if (!first || !end) return null;
  return { top: first.top, bottom: end.bottom };
}

function groupFitsFresh(pieces: Piece[], blocks: Block[], blockIndex: number, budget: number): boolean {
  const bounds = groupBounds(pieces, blocks, blockIndex);
  return Boolean(bounds && bounds.bottom - bounds.top <= budget);
}

function groupFitsHere(pieces: Piece[], blocks: Block[], blockIndex: number, offset: number, budget: number): boolean {
  const bounds = groupBounds(pieces, blocks, blockIndex);
  return Boolean(bounds && bounds.bottom - offset <= budget);
}

function packBlocks(slot: HTMLElement, blocks: Block[]): PackedLeaf[] {
  const available = slot.clientHeight;
  const budget = available > 48 ? available - 16 : available;
  const column = slot.firstElementChild as HTMLElement | null;
  const nodes = [...slot.querySelectorAll<HTMLElement>("[data-leaf-block]")];
  if (!column || budget <= 0 || nodes.length === 0) {
    return [{ start: 0, end: Math.max(blocks.length, 1), offset: 0, limit: 1 }];
  }
  const previousTransform = column.style.transform;
  const previousClip = column.style.clipPath;
  column.style.transform = "none";
  column.style.clipPath = "none";
  try {
    const origin = column.getBoundingClientRect().top;
    const pieces = piecesIn(nodes, blocks, origin, budget);
    if (pieces.length === 0) {
      return [{ start: 0, end: blocks.length, offset: 0, limit: Math.max(column.scrollHeight, 1) }];
    }
    const packed: PackedLeaf[] = [];
    let cursor = 0;
    let guard = 0;
    while (cursor < pieces.length && guard < pieces.length + 8) {
      guard += 1;
      const piece = pieces[cursor];
      const offset = cursor === 0 && piece.top < 2 ? 0 : piece.top;
      let end = cursor;
      while (end < pieces.length) {
        const candidate = pieces[end];
        const started = end > cursor && pieces[end - 1].index === candidate.index;
        // Keep a figure together when it fits a fresh leaf. A figure taller than the leaf breaks between its blocks.
        if (!started && groupFitsFresh(pieces, blocks, candidate.index, budget) && !groupFitsHere(pieces, blocks, candidate.index, offset, budget)) {
          break;
        }
        // Keep a paragraph that fits on a fresh leaf in one piece, so a leaf does not open mid-sentence.
        if (!started && blockFitsFresh(pieces, end, budget) && !blockFitsHere(pieces, end, offset, budget)) break;
        if (candidate.bottom - offset > budget) break;
        const follower = pieces[end + 1];
        const holdWithNext = candidate.title || (candidate.broken && follower?.index === candidate.index);
        if (holdWithNext && follower && follower.bottom - offset > budget) break;
        if (candidate.title && follower && blockFitsFresh(pieces, end + 1, budget) && !blockFitsHere(pieces, end + 1, offset, budget)) {
          break;
        }
        end += 1;
        const taken = pieces[end - 1];
        const blockContinues = end < pieces.length && pieces[end].index === taken.index;
        const follow = blocks[taken.index];
        if (!blockContinues && (follow?.platesAfter?.length || follow?.picturesAfter?.length)) break;
      }
      if (end === cursor) {
        if (piece.bottom - offset > budget) {
          const limit = Math.min(piece.bottom, offset + budget);
          packed.push({ start: piece.index, end: piece.index + 1, offset, limit });
          if (limit >= piece.bottom - 1) cursor += 1;
          else piece.top = limit;
          continue;
        }
        const follower = pieces[cursor + 1];
        packed.push({
          start: piece.index,
          end: piece.index + 1,
          offset,
          limit: Math.min(follower ? follower.top : piece.bottom, offset + budget),
        });
        cursor += 1;
        continue;
      }
      const last = pieces[end - 1];
      const next = pieces[end];
      let limit = last.bottom + 1;
      if (next && next.top > limit && next.top - offset <= budget) limit = next.top;
      if (limit - offset > budget) limit = last.bottom;
      packed.push({ start: cursor === 0 ? 0 : piece.index, end: last.index + 1, offset, limit });
      cursor = end;
    }
    return packed.length > 0 ? packed : [{ start: 0, end: blocks.length, offset: 0, limit: 1 }];
  } finally {
    column.style.transform = previousTransform;
    column.style.clipPath = previousClip;
  }
}

function piecesIn(nodes: HTMLElement[], blocks: Block[], origin: number, budget: number): Piece[] {
  const pieces: Piece[] = [];
  nodes.forEach((node, index) => {
    const key = blocks[index]?.key ?? "";
    const title = key.endsWith("-title");
    const whole =
      title ||
      key === "notes" ||
      key.endsWith("-figure") ||
      /-step-\d+$/.test(key) ||
      /-line-\d+$/.test(key) ||
      /-flow-\d+$/.test(key) ||
      /-compare-\d+$/.test(key) ||
      /-sheet-\d+$/.test(key) ||
      key.endsWith("-sheet-gate") ||
      key.endsWith("-sheet-caption");
    const top = node.offsetTop;
    const bottom = top + node.offsetHeight;
    const lines = lineBoxes(node, origin).filter((line) => line.bottom > top + 0.5 && line.top < bottom + 0.5);
    if (whole && (lines.length === 0 || bottom - top <= budget)) {
      pieces.push({ index, top, bottom, title, broken: false });
      return;
    }
    if (lines.length === 0) {
      let y = top;
      while (y < bottom - 1) {
        const next = Math.min(bottom, y + budget);
        pieces.push({ index, top: y, bottom: next, title: false, broken: false });
        if (next <= y + 0.5) break;
        y = next;
      }
      return;
    }
    lines.forEach((line) => pieces.push({ index, top: line.top, bottom: line.bottom, title: false, broken: line.broken }));
  });
  return pieces;
}

function lineBoxes(node: HTMLElement, origin: number): { top: number; bottom: number; broken: boolean }[] {
  const lines: { top: number; bottom: number; broken: boolean }[] = [];
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let current = walker.nextNode();
  while (current) {
    const value = current.textContent ?? "";
    let cursor = 0;
    for (const part of value.split(/(\s+)/)) {
      const start = cursor;
      cursor += part.length;
      if (!part.trim()) continue;
      range.setStart(current, start);
      range.setEnd(current, cursor);
      const rects = [...range.getClientRects()].filter((rect) => rect.width >= 1 && rect.height >= 1);
      rects.forEach((rect, rectIndex) => {
        const top = rect.top - origin;
        const bottom = rect.bottom - origin;
        const mid = (top + bottom) / 2;
        const broken = rectIndex < rects.length - 1 || part.endsWith("-");
        const line = lines.find((item) => mid >= item.top && mid <= item.bottom);
        if (line) {
          line.top = Math.min(line.top, top);
          line.bottom = Math.max(line.bottom, bottom);
          line.broken = line.broken || broken;
        } else {
          lines.push({ top, bottom, broken });
        }
      });
    }
    current = walker.nextNode();
  }
  lines.sort((left, right) => left.top - right.top);
  const merged: { top: number; bottom: number; broken: boolean }[] = [];
  for (const line of lines) {
    const previous = merged[merged.length - 1];
    if (previous && line.top <= previous.bottom + 1) {
      previous.top = Math.min(previous.top, line.top);
      previous.bottom = Math.max(previous.bottom, line.bottom);
      previous.broken = previous.broken || line.broken;
    } else {
      merged.push({ top: line.top, bottom: line.bottom, broken: line.broken });
    }
  }
  return merged;
}

function composeLeaves(packed: PackedLeaf[], blocks: Block[], plate?: HandbookPage["plate"]): ShownLeaf[] {
  const shown: ShownLeaf[] = [];
  if (plate === "horizon") shown.push({ kind: "plate", panel: "hero" });
  if (plate === "ledger") shown.push({ kind: "plate", panel: "ledger" });
  packed.forEach((leaf, index) => {
    shown.push({ kind: "prose", leaf });
    const last = leaf.end - 1;
    const next = packed[index + 1];
    const finished = !next || next.start > last;
    if (!finished) return;
    const block = blocks[last];
    for (const panel of block?.platesAfter ?? []) shown.push({ kind: "plate", panel });
    for (const picture of block?.picturesAfter ?? []) {
      shown.push({ kind: "picture", picture, role: "section", title: block?.sectionTitle });
    }
  });
  return shown;
}

function PictureLeaf({ leaf }: { leaf: Extract<ShownLeaf, { kind: "picture" }> }) {
  const { picture, title } = leaf;
  return (
    <figure className="flex h-full min-h-0 flex-col overflow-hidden bg-[#040914]" data-handbook-picture>
      <div className="relative min-h-0 flex-1">
        <Image src={picture.src} alt={picture.alt} fill sizes="100vw" className="object-contain" />
      </div>
      <figcaption className="shrink-0 border-t border-white/10 px-4 py-3 sm:px-6">
        {title ? (
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-amber-100/80">{title}</p>
        ) : null}
        <p className="mt-1 text-sm leading-relaxed text-slate-300" aria-hidden="true">
          {picture.alt}
        </p>
      </figcaption>
    </figure>
  );
}

function samePack(left: PackedLeaf[], right: PackedLeaf[]) {
  if (left.length !== right.length) return false;
  return left.every((leaf, index) => {
    const other = right[index];
    return leaf.start === other?.start && leaf.end === other?.end && leaf.offset === other?.offset && leaf.limit === other?.limit;
  });
}

function proseBlocks(
  page: HandbookPage,
  showFeedback: boolean,
  feedbackSlug: string,
  feedbackEntries: EssayFeedbackEntry[],
  narrow: boolean,
  warm: boolean,
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
            <p
              className={`mt-4 border-l pl-4 text-base leading-relaxed text-white ${
                warm ? "border-amber-200/80" : "border-cyan-300/70"
              }`}
            >
              {page.rule}
            </p>
          ) : null}
          <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500">
            Checked {page.reviewed}
          </p>
        </div>
      ),
    },
  ];
  page.sections.forEach((section) => {
    const parts: Block[] = [
      {
        key: `${section.id}-title`,
        sectionId: section.id,
        sectionTitle: section.title,
        node: (
          <h2 className="pt-2 pb-3 font-display text-2xl font-semibold tracking-tight text-white">
            {section.title}
          </h2>
        ),
      },
      ...sectionBlocks(section, page.plate === "horizon", narrow, warm),
    ];
    const plates = page.plate === "horizon" ? PLATES_AFTER[section.id] : undefined;
    const tail = parts[parts.length - 1];
    if (plates?.length && tail) tail.platesAfter = plates;
    if (section.picture && tail) tail.picturesAfter = [section.picture];
    blocks.push(...parts);
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

function sectionBlocks(section: HandbookSection, hideBoardFigure: boolean, narrow: boolean, warm: boolean): Block[] {
  const blocks: Block[] = [];
  section.paragraphs?.forEach((paragraph, index) => {
    blocks.push({
      key: `${section.id}-p-${index}`,
      sectionId: section.id,
      sectionTitle: section.title,
      node: <p className="pb-4 text-base leading-relaxed text-slate-300">{paragraph}</p>,
    });
  });
  section.lines?.forEach((line, index) => {
    const tone = warm ? "text-amber-200" : "text-cyan-200";
    const rule = warm ? "border-amber-200/50" : "border-cyan-300/40";
    blocks.push({
      key: `${section.id}-line-${index}-title`,
      sectionId: section.id,
      sectionTitle: section.title,
      node: (
        <p className={`pt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] ${tone}`}>{line.term}</p>
      ),
    });
    blocks.push({
      key: `${section.id}-line-${index}`,
      sectionId: section.id,
      sectionTitle: section.title,
      node: <p className={`border-l pb-4 pl-4 text-base leading-relaxed text-slate-300 ${rule}`}>{line.detail}</p>,
    });
  });
  if (section.figure && !(hideBoardFigure && BOARD_FIGURES.has(section.figure.kind))) {
    if (section.figure.kind === "sheet") {
      const figure = section.figure;
      const fields = figure.steps.filter((step) => !step.gate);
      const gate = figure.steps.find((step) => step.gate);
      const group = `${section.id}-sheet`;
      fields.forEach((step, index) => {
        blocks.push({
          key: `${section.id}-sheet-${index}`,
          sectionId: section.id,
          sectionTitle: section.title,
          group,
          node: <SheetRow term={step.term} detail={step.detail} warm={warm} first={index === 0} />,
        });
      });
      if (gate) {
        blocks.push({
          key: `${section.id}-sheet-gate`,
          sectionId: section.id,
          sectionTitle: section.title,
          group,
          node: <SheetGate term={gate.term} detail={gate.detail} warm={warm} />,
        });
      }
      if (figure.caption) {
        blocks.push({
          key: `${section.id}-sheet-caption`,
          sectionId: section.id,
          sectionTitle: section.title,
          group,
          node: <p className="mt-2 pb-4 text-sm leading-relaxed text-slate-400">{figure.caption}</p>,
        });
      }
    } else if (section.figure.kind === "uses") {
      const figure = section.figure;
      const rows = figure.rows ?? [];
      const group = `${section.id}-uses`;
      blocks.push({
        key: `${section.id}-uses-title`,
        sectionId: section.id,
        sectionTitle: section.title,
        group,
        node: <UsesHead figure={figure} warm={warm} />,
      });
      rows.forEach((row, index) => {
        blocks.push({
          key: `${section.id}-line-${index}`,
          sectionId: section.id,
          sectionTitle: section.title,
          group,
          lead: <UsesHead figure={figure} warm={warm} />,
          node: <UsesRow row={row} warm={warm} />,
        });
      });
      if (figure.caption) {
        blocks.push({
          key: `${section.id}-line-${rows.length}`,
          sectionId: section.id,
          sectionTitle: section.title,
          group,
          node: <p className="mt-2 pb-4 text-sm leading-relaxed text-slate-400">{figure.caption}</p>,
        });
      }
    } else if (narrow && section.figure.kind === "compare") {
      const columns = section.figure.columns ?? [];
      columns.forEach((column, index) => {
        const last = index === columns.length - 1;
        blocks.push({
          key: `${section.id}-compare-${index}`,
          sectionId: section.id,
          sectionTitle: section.title,
          node: (
            <div className="pb-3">
              <CompareCard column={column} />
              {last && section.figure?.caption ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{section.figure.caption}</p>
              ) : null}
            </div>
          ),
        });
      });
    } else if (narrow && section.figure.kind === "flow" && !section.figure.plain) {
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
            <HandbookFigureView figure={section.figure} warm={warm} />
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
          <span className={`w-5 shrink-0 font-mono text-sm ${warm ? "text-amber-200" : "text-cyan-200"}`}>{index + 1}</span>
          <span>{step}</span>
        </div>
      ),
    });
  });
  section.closing?.forEach((paragraph, index) => {
    blocks.push({
      key: `${section.id}-close-${index}`,
      sectionId: section.id,
      sectionTitle: section.title,
      node: <p className="pb-4 text-base leading-relaxed text-slate-300">{paragraph}</p>,
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
