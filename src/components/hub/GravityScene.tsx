import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GravityField } from "@/components/story/GravityField";
import { ChapterMark } from "@/components/story/ChapterMark";
import { Reveal } from "@/components/ui/Reveal";

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
  return (
    <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
      <Reveal>
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
      </Reveal>
      <Reveal delay={0.08} className="px-10 sm:px-12">
        <GravityField />
      </Reveal>
    </div>
  );
}
