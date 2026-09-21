"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { GravityField } from "@/components/story/GravityField";
import { ChapterMark } from "@/components/story/ChapterMark";

function withOrbitMark(text: string) {
  const i = text.toLowerCase().indexOf("orbit");
  if (i < 0) return text;
  const end = i + "orbit".length;
  return (
    <>
      {text.slice(0, i)}
      <span className="orbit-accent font-medium">{text.slice(i, end)}</span>
      {text.slice(end)}
    </>
  );
}

export function GravityScene({ whyOrbit }: { whyOrbit: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={sceneRef}
      className="grid min-h-[min(90dvh,48rem)] items-start gap-14 lg:min-h-[min(130dvh,64rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16"
    >
      <div>
        <ChapterMark
          index="01"
          eyebrow="Gravity"
          title="The name is the operating model"
          description="A stable relationship around a center, not a prettier homepage."
        />
        <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {withOrbitMark(whyOrbit)}
        </p>
        <Link
          href="/writes/building-orbit"
          className="focus-ring group mt-8 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-neon-cyan"
        >
          Why the name
          <ArrowUpRight className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="px-10 sm:px-12 lg:sticky lg:top-28 lg:self-start">
        <GravityField containerRef={sceneRef} />
      </div>
    </div>
  );
}
