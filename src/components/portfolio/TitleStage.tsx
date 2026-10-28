"use client";

import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { ChapterMark } from "@/components/story/ChapterMark";
import { cn } from "@/lib/utils";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export type TitleStageItem = { id: string; title: string };

/**
 * Portfolio title list shared with Power BI.
 * From 640px up the titles sit in a column and the chosen item stays beside them.
 * On a phone the titles are one row you slide, and the item is full width under that row.
 */
export function TitleStage({
  items,
  listId,
  tabPrefix,
  panelId,
  ariaLabel,
  selectedId: selectedIdProp,
  onSelect,
  panels,
  children,
  className,
}: {
  items: TitleStageItem[];
  listId: string;
  tabPrefix: string;
  panelId: string;
  ariaLabel: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Server-rendered bodies, one per id. Used when the panel cannot be chosen in the client. */
  panels?: Record<string, ReactNode>;
  children?: ReactNode;
  className?: string;
}) {
  const firstId = items[0]?.id ?? "";
  const [uncontrolledId, setUncontrolledId] = useState(firstId);
  const [horizontal, setHorizontal] = useState(false);
  const selectedId =
    selectedIdProp !== undefined ? selectedIdProp : uncontrolledId;

  const select = useCallback(
    (id: string) => {
      if (selectedIdProp === undefined) setUncontrolledId(id);
      onSelect?.(id);
    },
    [onSelect, selectedIdProp],
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setHorizontal(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const list = document.getElementById(listId);
    const tab = document.getElementById(`${tabPrefix}-${selectedId}`);
    if (!list || !tab) return;
    const listBox = list.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    if (tabBox.left < listBox.left + 4) {
      list.scrollLeft -= listBox.left + 4 - tabBox.left;
    } else if (tabBox.right > listBox.right - 4) {
      list.scrollLeft += tabBox.right - (listBox.right - 4);
    }
    if (tabBox.top < listBox.top) {
      list.scrollTop -= listBox.top - tabBox.top;
    } else if (tabBox.bottom > listBox.bottom) {
      list.scrollTop += tabBox.bottom - listBox.bottom;
    }
  }, [selectedId, horizontal, listId, tabPrefix]);

  function onListKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!items.length) return;
    const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
    const back = e.key === "ArrowUp" || e.key === "ArrowLeft";
    if (!forward && !back) return;
    e.preventDefault();
    const index = items.findIndex((item) => item.id === selectedId);
    const next = forward
      ? items[(index + 1) % items.length]
      : items[(index - 1 + items.length) % items.length];
    if (!next) return;
    select(next.id);
    document.getElementById(`${tabPrefix}-${next.id}`)?.focus();
  }

  if (!items.length || !selectedId) return null;

  const activeId = items.some((item) => item.id === selectedId)
    ? selectedId
    : firstId;

  return (
    <div
      className={cn(
        "mt-8 grid min-w-0 grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-[minmax(0,12.5rem)_minmax(0,1fr)] sm:items-stretch sm:gap-6 md:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)]",
        className,
      )}
    >
      <div className="relative min-w-0">
        <div
          id={listId}
          role="tablist"
          aria-label={ariaLabel}
          aria-orientation={horizontal ? "horizontal" : "vertical"}
          onKeyDown={onListKey}
          className="flex w-full min-w-0 snap-x snap-mandatory flex-nowrap gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain p-1 [scrollbar-width:none] sm:snap-none sm:flex-col sm:overflow-x-hidden sm:overflow-y-visible [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => {
            const selected = item.id === activeId;
            return (
              <button
                key={item.id}
                id={`${tabPrefix}-${item.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(item.id)}
                className={
                  selected
                    ? "focus-ring inline-flex min-h-11 w-max shrink-0 snap-start items-center whitespace-nowrap rounded-xl border border-neon-cyan/40 bg-white/[0.06] px-3 py-1.5 text-left sm:flex sm:min-h-0 sm:w-full sm:whitespace-normal"
                    : "focus-ring inline-flex min-h-11 w-max shrink-0 snap-start items-center whitespace-nowrap rounded-xl border border-transparent px-3 py-1.5 text-left hover:border-white/10 hover:bg-white/[0.03] sm:flex sm:min-h-0 sm:w-full sm:whitespace-normal"
                }
              >
                <span className="flex items-baseline gap-2 sm:min-w-0">
                  <span className="shrink-0 font-mono text-[0.65rem] tabular-nums text-slate-500">
                    {pad(index + 1)}
                  </span>
                  <span className="whitespace-nowrap font-display text-sm font-semibold leading-snug tracking-tight text-white sm:min-w-0 sm:whitespace-normal sm:break-words">
                    {item.title}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-1 right-0 w-8 bg-gradient-to-l from-void to-transparent sm:hidden"
        />
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${tabPrefix}-${activeId}`}
        className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
      >
        {panels
          ? items.map((item) => (
              <div key={item.id} hidden={item.id !== activeId}>
                {panels[item.id]}
              </div>
            ))
          : children}
      </div>
    </div>
  );
}

export function TitleStageHeader({
  index,
  eyebrow,
  title,
  description,
  action,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: { href: string; label: string; external?: boolean };
}) {
  const reserve =
    action && action.label.length > 12
      ? "[&>p:first-child]:max-w-[calc(100%-12.5rem)]"
      : action
        ? "[&>p:first-child]:max-w-[calc(100%-6.5rem)]"
        : undefined;

  return (
    <div className="relative">
      <ChapterMark
        className={reserve}
        index={index}
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      {action ? (
        <Link
          href={action.href}
          {...(action.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="focus-ring group absolute right-0 top-0 z-30 inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-medium text-slate-300 hover:text-neon-cyan"
        >
          {action.label}
          {action.external ? (
            <ExternalLink className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
          )}
        </Link>
      ) : null}
    </div>
  );
}
