import { ArrowRight } from "lucide-react";
import type { Competency } from "@/content/profile";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrollSpot } from "@/components/story/ScrollSpot";
import { cn } from "@/lib/utils";

const STORY_ORDER = [
  "Technology Delivery",
  "Data & Analytics",
  "AI Orchestration & Automation",
] as const;

const accentText: Record<Competency["accent"], string> = {
  cyan: "text-neon-cyan",
  violet: "text-neon-violet",
  blue: "text-neon-blue",
  amber: "text-neon-amber",
};

const accentRule: Record<Competency["accent"], string> = {
  cyan: "hover:border-neon-cyan/40",
  violet: "hover:border-neon-violet/40",
  blue: "hover:border-neon-blue/40",
  amber: "hover:border-neon-amber/40",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CraftScene({ competencies }: { competencies: Competency[] }) {
  const ordered = [
    ...STORY_ORDER.map((title) => competencies.find((c) => c.title === title)),
    ...competencies.filter(
      (c) => !STORY_ORDER.includes(c.title as (typeof STORY_ORDER)[number]),
    ),
  ].filter((c): c is Competency => Boolean(c));

  return (
    <div>
      <ChapterMark
        index="02"
        eyebrow="Craft"
        title="How I ship"
        description="A sequence, not a stack. Evidence before the call. A human gate before anything publishes."
      />

      <ol className="mt-12 space-y-0 border-t border-white/10">
        {ordered.map((c, i) => {
          const Icon = c.icon;
          const body = (
            <div className="grid gap-6 py-10 sm:grid-cols-[auto_1fr] sm:gap-10 lg:grid-cols-[8rem_1fr_auto] lg:items-center">
              <p className="story-index select-none" aria-hidden>
                {pad(i + 1)}
              </p>
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-5 w-5", accentText[c.accent])} />
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {c.title}
                  </h3>
                </div>
                {c.hudVerbs ? (
                  <p
                    className={cn(
                      "mt-3 font-mono text-xs uppercase tracking-[0.18em]",
                      accentText[c.accent],
                    )}
                  >
                    {c.hudVerbs}
                  </p>
                ) : null}
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  {c.description}
                </p>
              </div>
              {c.href ? (
                <span
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 text-sm font-medium sm:min-h-0",
                    accentText[c.accent],
                  )}
                >
                  {c.hrefLabel ?? "Open"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
                </span>
              ) : null}
            </div>
          );

          if (!c.href) {
            return (
              <li key={c.title} className="border-b border-white/10">
                <ScrollSpot>{body}</ScrollSpot>
              </li>
            );
          }

          return (
            <li key={c.title} className="border-b border-white/10">
              <ScrollSpot>
                <a
                  href={c.href}
                  className={cn(
                    "focus-ring group block rounded-none border border-transparent transition-colors",
                    accentRule[c.accent],
                  )}
                >
                  {body}
                </a>
              </ScrollSpot>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
