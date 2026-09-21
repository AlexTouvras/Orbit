"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

const LG = "(min-width: 1024px)";

function subscribeLg(callback: () => void) {
  const mq = window.matchMedia(LG);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function useLgUp() {
  return useSyncExternalStore(
    subscribeLg,
    () => window.matchMedia(LG).matches,
    () => false,
  );
}

/**
 * Case-study reel. On large screens, native vertical scroll drives the track
 * to the right (sticky + translateX). Phone / reduced motion: swipe rail.
 * The wheel is never captured.
 */
export function ScrollRail({
  header,
  children,
  className,
}: {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const lg = useLgUp();
  const linked = hydrated && !reduced && lg;

  const sceneRef = useRef<HTMLDivElement>(null);
  const portRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxX, setMaxX] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxX]);

  useEffect(() => {
    if (!linked) return;
    const port = portRef.current;
    const track = trackRef.current;
    if (!port || !track) return;

    const measure = () => {
      const next = Math.max(0, track.scrollWidth - port.clientWidth);
      setMaxX((prev) => (prev === next ? prev : next));
    };

    const ro = new ResizeObserver(measure);
    ro.observe(port);
    ro.observe(track);
    return () => ro.disconnect();
  }, [linked]);

  if (!linked) {
    return (
      <div className={className}>
        {header}
        <div className="story-rail mt-12">{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={sceneRef}
      className={className}
      style={{ height: `calc(100dvh - 9rem + ${maxX}px)` }}
    >
      <div className="sticky top-24 flex h-[calc(100dvh-9rem)] flex-col justify-center overflow-hidden">
        {header}
        <div ref={portRef} className="mt-12 overflow-hidden">
          <motion.div
            ref={trackRef}
            className="flex w-max gap-5"
            style={{ x }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function ScrollRailCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-[min(85vw,34rem)] shrink-0 sm:w-[min(72vw,38rem)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
