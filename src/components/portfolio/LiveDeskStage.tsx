import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { LiveDesk } from "@/content/live-desks";
import { DeskPeekFrame } from "@/components/live/DeskPeek";
import {
  TitleStage,
  TitleStageHeader,
} from "@/components/portfolio/TitleStage";

function LiveDeskPanel({ desk }: { desk: LiveDesk }) {
  const href = `/portfolio/live/${desk.slug}`;
  return (
    <>
      <Link
        href={href}
        className="focus-ring relative mx-3 mt-3 block w-[calc(100%-1.5rem)] overflow-hidden rounded-xl border border-white/10 bg-void-800 sm:mx-5 sm:mt-5 sm:w-[calc(100%-2.5rem)]"
        aria-label={desk.question}
      >
        <span className="relative block aspect-[16/10] w-full">
          <span className="absolute inset-0">
            <DeskPeekFrame slug={desk.slug} />
          </span>
        </span>
      </Link>
      <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-end sm:justify-between sm:px-5 sm:py-4">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">
            {desk.question}
          </p>
          <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500 sm:tracking-[0.2em]">
            {desk.cadence}
            <span className="text-slate-600"> · </span>
            {desk.source}
          </p>
        </div>
        <Link
          href={href}
          className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-neon-cyan sm:min-h-0"
        >
          Open desk
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </>
  );
}

/**
 * Live desks as a title list. The short name is the title.
 * The peek and the question sit in the panel.
 * Hub keeps the peek reel.
 */
export function LiveDeskStage({
  desks,
  id,
  index,
  description,
  showIndexLink = false,
  className,
}: {
  desks: LiveDesk[];
  id?: string;
  index?: string;
  description?: string;
  showIndexLink?: boolean;
  className?: string;
}) {
  if (desks.length === 0) return null;

  const scope = id ?? "live-index";
  const panels: Record<string, ReactNode> = {};
  for (const desk of desks) {
    panels[desk.slug] = <LiveDeskPanel desk={desk} />;
  }

  return (
    <section
      id={id}
      className={id ? "scroll-mt-28" : undefined}
      aria-label="Live desks"
    >
      {index ? (
        <TitleStageHeader
          index={index}
          eyebrow="Live"
          title="Questions the desks answer"
          description={description}
          action={
            showIndexLink
              ? { href: "/portfolio/live", label: "Open live dashboards" }
              : undefined
          }
        />
      ) : null}
      <TitleStage
        items={desks.map((desk) => ({ id: desk.slug, title: desk.title }))}
        panels={panels}
        listId={`${scope}-list`}
        tabPrefix={`${scope}-tab`}
        panelId={`${scope}-panel`}
        ariaLabel="Live desks"
        className={className}
      />
    </section>
  );
}
