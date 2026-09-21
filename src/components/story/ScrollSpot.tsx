"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/** Brightens the row in the middle of the viewport as you scroll past it. Copy stays readable. */
export function ScrollSpot({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOn(Boolean(entry?.isIntersecting)),
      { rootMargin: "-38% 0px -38% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      data-spot={on || reduced ? "on" : "off"}
      className={cn(
        "motion-safe:transition-[opacity,transform] motion-safe:duration-500",
        on || reduced ? "opacity-100" : "opacity-45 motion-safe:scale-[0.99]",
        className,
      )}
    >
      {children}
    </div>
  );
}
