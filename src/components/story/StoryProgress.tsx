"use client";

import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

export type StoryChapter = {
  id: string;
  label: string;
};

export function StoryProgress({ chapters }: { chapters: StoryChapter[] }) {
  const [active, setActive] = useState(chapters[0]?.id ?? "");
  const { scrollYProgress } = useScroll();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const nodes = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav
      aria-label="Story chapters"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4"
    >
      <div className="pointer-events-auto relative overflow-hidden rounded-full border border-white/10 bg-void/80 px-2 py-1.5 backdrop-blur-md">
        {!reduced ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 origin-left bg-white/10"
            style={{ scaleX: scrollYProgress, width: "100%" }}
          />
        ) : null}
        <ol className="relative flex items-center gap-1">
          {chapters.map((chapter) => {
            const isActive = chapter.id === active;
            return (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  aria-label={chapter.label}
                  aria-current={isActive ? "true" : undefined}
                  title={chapter.label}
                  className={cn(
                    "focus-ring flex items-center gap-2 rounded-full px-2 py-1.5 text-left transition-colors",
                    isActive ? "text-white" : "text-slate-500 hover:text-slate-200",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                      isActive ? "orbit-accent-bg" : "bg-white/25",
                    )}
                    aria-hidden
                  />
                  <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.18em] xl:inline">
                    {chapter.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
