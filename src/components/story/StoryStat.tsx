"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

function CountUp({
  to,
  suffix = "",
  fallback,
}: {
  to: number;
  suffix?: string;
  fallback: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!hydrated || reduced) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setStarted(true);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hydrated, reduced, to]);

  useEffect(() => {
    if (!started || reduced) return;
    const duration = 700;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setN(Math.round(to * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, reduced, to]);

  if (!hydrated || reduced || !started) {
    return <span ref={ref}>{fallback}</span>;
  }

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

export function StoryStat({
  label,
  value,
  hint,
  className,
  valueClassName,
  countTo,
  suffix,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
  valueClassName?: string;
  /** When set, count from 0 to this number on enter (motion-safe). */
  countTo?: number;
  suffix?: string;
}) {
  return (
    <div className={cn(className)}>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl",
          valueClassName ?? "orbit-accent",
        )}
      >
        {countTo != null ? (
          <CountUp to={countTo} suffix={suffix ?? ""} fallback={value} />
        ) : (
          value
        )}
      </p>
      {hint ? (
        <p className="mt-1 font-mono text-[0.7rem] text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
