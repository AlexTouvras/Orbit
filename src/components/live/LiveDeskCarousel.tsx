"use client";

import {
  Children,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type LiveDeskCarouselProps = {
  labels: string[];
  children: ReactNode;
  className?: string;
};

export function LiveDeskCarousel({
  labels,
  children,
  className,
}: LiveDeskCarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const labelId = useId();

  const scrollToIndex = useCallback(
    (next: number) => {
      const el = scrollerRef.current;
      if (!el || count === 0) return;
      const clamped = ((next % count) + count) % count;
      const child = el.children[clamped] as HTMLElement | undefined;
      if (!child) return;
      child.scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "nearest",
      });
      setIndex(clamped);
    },
    [count],
  );

  const go = useCallback(
    (delta: number) => {
      if (count <= 1) return;
      scrollToIndex(index + delta);
    },
    [count, index, scrollToIndex],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || count <= 1) return;

    function onScroll() {
      const list = scrollerRef.current;
      if (!list) return;
      const left = list.scrollLeft;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < list.children.length; i++) {
        const child = list.children[i] as HTMLElement;
        const dist = Math.abs(child.offsetLeft - left);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      setIndex(best);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (count <= 1) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  }

  if (count === 0) return null;

  const currentLabel = labels[index] ?? `Desk ${index + 1}`;

  return (
    <div
      className={cn("mt-8", className)}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <p id={labelId} className="sr-only">
        Live dashboards carousel
      </p>

      <div className="relative px-6 sm:px-8">
        <ul
          ref={scrollerRef}
          className="flex list-none snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth p-0 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((child, i) => (
            <li
              key={labels[i] ?? i}
              className="w-[min(100%,28rem)] shrink-0 snap-start"
              aria-current={i === index ? "true" : undefined}
            >
              {child}
            </li>
          ))}
        </ul>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="focus-ring absolute left-0 top-[38%] z-20 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-void/90 text-slate-200 shadow-lg backdrop-blur-sm transition-colors hover:border-neon-cyan/40 hover:text-neon-cyan"
              aria-label="Previous live dashboard"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="focus-ring absolute right-0 top-[38%] z-20 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-void/90 text-slate-200 shadow-lg backdrop-blur-sm transition-colors hover:border-neon-cyan/40 hover:text-neon-cyan"
              aria-label="Next live dashboard"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <div
            className="flex flex-wrap items-center justify-center gap-1.5"
            role="tablist"
            aria-label="Live dashboards"
          >
            {labels.map((label, i) => (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={label}
                onClick={() => scrollToIndex(i)}
                className={cn(
                  "focus-ring h-2.5 w-2.5 rounded-full transition-colors",
                  i === index
                    ? "bg-neon-cyan"
                    : "bg-white/20 hover:bg-white/40",
                )}
              />
            ))}
          </div>
          <p
            className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500"
            aria-live="polite"
          >
            {currentLabel} · {index + 1} / {count}
          </p>
        </div>
      ) : null}
    </div>
  );
}
