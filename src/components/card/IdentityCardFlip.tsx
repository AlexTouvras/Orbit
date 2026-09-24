"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArcStatusCard } from "@/components/studio/week/ArcStatusCard";
import { IdentityHud, type IdentityHudProps } from "@/components/card/IdentityHud";
import type {
  ArcNarrativeView,
  DailyQuestView,
  FitnessDay,
} from "@/lib/week-log/types";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

interface ArcPayload {
  narrative: ArcNarrativeView;
  dailyQuest: DailyQuestView | null;
  days: FitnessDay[];
}

const FLIP_BUTTON =
  "focus-ring w-full text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-violet-300/80 hover:text-violet-100";

export function IdentityCardFlip(props: IdentityHudProps) {
  const reduced = usePrefersReducedMotion();
  const [arc, setArc] = useState<ArcPayload | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancel = false;
    fetch("/api/card/arc", { credentials: "same-origin" })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data: ArcPayload | null) => {
        if (cancel || !data?.narrative?.gate) return;
        setArc({
          narrative: data.narrative,
          dailyQuest: data.dailyQuest ?? null,
          days: Array.isArray(data.days) ? data.days : [],
        });
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  useLayoutEffect(() => {
    const el = flipped ? backRef.current : frontRef.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [flipped, arc]);

  if (!arc) return <IdentityHud {...props} />;

  const flip = () => setFlipped((value) => !value);

  return (
    <div
      className="relative w-full max-w-md [perspective:1400px]"
      style={{ height: height ?? undefined }}
    >
      <div
        className={cn(
          "relative h-full [transform-style:preserve-3d]",
          !reduced &&
            "transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        <div
          ref={frontRef}
          className={cn(
            "absolute inset-x-0 top-0 [backface-visibility:hidden]",
            flipped && "pointer-events-none",
          )}
          aria-hidden={flipped}
          inert={flipped}
        >
          <IdentityHud
            {...props}
            privateAction={{ label: "Flip for stats", onClick: flip }}
          />
        </div>
        <div
          ref={backRef}
          className={cn(
            "absolute inset-x-0 top-0 [backface-visibility:hidden] [transform:rotateY(180deg)]",
            !flipped && "pointer-events-none",
          )}
          aria-hidden={!flipped}
          inert={!flipped}
        >
          <ArcStatusCard
            narrative={arc.narrative}
            dailyQuest={arc.dailyQuest}
            weekDays={arc.days}
            footer={
              <button type="button" onClick={flip} className={FLIP_BUTTON}>
                Flip for card
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
