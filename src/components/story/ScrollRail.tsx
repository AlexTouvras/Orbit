"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * Horizontal reel: native vertical scroll translates the track to the right
 * (sticky + translateX). Reduced motion keeps a swipe rail. Wheel is never captured.
 */
export function ScrollRail({
  header,
  children,
  length = 3,
  className,
}: {
  header?: ReactNode;
  children: ReactNode;
  length?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const live = !reduced;

  const sceneRef = useRef<HTMLDivElement>(null);
  const portRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxX, setMaxX] = useState(() => Math.max(0, length - 1) * 720);

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxX]);

  useEffect(() => {
    if (!live) return;
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
    window.addEventListener("resize", measure);
    const id = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [live, length]);

  return (
    <div
      ref={sceneRef}
      className={className}
      data-scroll-rail={live ? "linked" : "swipe"}
      style={live ? { height: `calc(100dvh - 9rem + ${maxX}px)` } : undefined}
    >
      <div
        className={
          live
            ? "sticky top-24 flex h-[calc(100dvh-9rem)] flex-col justify-center overflow-hidden"
            : undefined
        }
      >
        {header}
        <div
          ref={portRef}
          className={live ? "mt-10 overflow-hidden" : "story-rail mt-12"}
        >
          <motion.div
            ref={trackRef}
            className="flex w-max flex-nowrap gap-5"
            style={live ? { x } : undefined}
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
    <div className={cn("w-[min(82vw,46rem)] shrink-0", className)}>
      {children}
    </div>
  );
}
