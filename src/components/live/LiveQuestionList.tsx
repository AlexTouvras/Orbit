import Link from "next/link";
import type { LiveDesk } from "@/content/live-desks";
import { ScrollSpot } from "@/components/story/ScrollSpot";

export function LiveQuestionList({ desks }: { desks: LiveDesk[] }) {
  if (desks.length === 0) return null;

  return (
    <ul className="border-t border-white/10">
      {desks.map((desk) => (
        <li key={desk.slug} className="border-b border-white/10">
          <ScrollSpot>
            <Link
              href={`/portfolio/live/${desk.slug}`}
              className="focus-ring group block py-8"
            >
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-neon-cyan">
              {desk.title}
            </span>
            <span className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
              <span className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-3xl">
                {desk.question}
              </span>
              <span className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                {desk.cadence}
              </span>
            </span>
          </Link>
          </ScrollSpot>
        </li>
      ))}
    </ul>
  );
}
