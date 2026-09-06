import Link from "next/link";
import type { ReactNode } from "react";
import { currentIsoWeekId } from "@/lib/iso-week";
import { weekHref, type WeekTopicSlug } from "@/lib/week-log/topics";

function weekLabel(weekId: string, isCurrent: boolean): string {
  if (isCurrent) return "This week in Helsinki";
  const current = currentIsoWeekId();
  if (weekId > current) return "Upcoming week";
  return "Earlier week";
}

const navBtn =
  "focus-ring rounded-lg border px-3 py-2 text-sm transition-colors";
const navBtnActive =
  "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan cursor-default";
const navBtnIdle =
  "border-white/10 text-slate-300 hover:border-white/30 hover:text-white";
const navBtnDisabled =
  "cursor-not-allowed border-white/5 text-slate-600";

function NavButton({
  href,
  disabled,
  active,
  children,
}: {
  href?: string;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
}) {
  const className = [
    navBtn,
    disabled ? navBtnDisabled : active ? navBtnActive : navBtnIdle,
  ].join(" ");

  if (disabled || active || !href) {
    return (
      <span
        aria-current={active ? "page" : undefined}
        aria-disabled={disabled ? true : undefined}
        className={className}
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function WeekNav({
  weekId,
  range,
  prevWeekId,
  nextWeekId,
  isCurrent,
  topic,
  innerSheet,
}: {
  weekId: string;
  range: string;
  prevWeekId: string | null;
  nextWeekId: string | null;
  isCurrent: boolean;
  topic?: WeekTopicSlug | null;
  innerSheet?: string | null;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-400">
          {weekId}
        </p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
          {range}
        </p>
        <p className="mt-1 text-sm text-slate-400">{weekLabel(weekId, isCurrent)}</p>
      </div>
      <nav aria-label="ISO week" className="flex gap-2">
        <NavButton
          href={prevWeekId ? weekHref(topic, prevWeekId, innerSheet) : undefined}
          disabled={!prevWeekId}
        >
          Previous
        </NavButton>
        <NavButton href={weekHref(topic, null, innerSheet)} active={isCurrent}>
          This week
        </NavButton>
        <NavButton
          href={nextWeekId ? weekHref(topic, nextWeekId, innerSheet) : undefined}
          disabled={!nextWeekId}
        >
          Next
        </NavButton>
      </nav>
    </div>
  );
}
