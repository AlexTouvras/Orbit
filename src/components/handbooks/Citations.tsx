import type { ReactNode } from "react";
import { BookLink } from "@/components/handbooks/volume/BookLink";
import { SiteLink } from "@/components/handbooks/SiteLink";
import type { PageReference } from "@/lib/handbook-citations";

/** Small numbers that open the matching work in the reference list. */
export function CiteMarks({ marks, tone }: { marks: number[]; tone: "paper" | "leaf" }) {
  if (!marks.length) return null;
  return (
    <>
      {marks.map((n) => (
        <a
          key={n}
          href={`#ref-${n}`}
          className={tone === "paper" ? "book-cite" : "leaf-cite focus-ring"}
          aria-label={`Reference ${n}`}
        >
          {n}
        </a>
      ))}
    </>
  );
}

export function ReferenceItem({
  item,
  tone,
}: {
  item: PageReference;
  tone: "paper" | "leaf";
}) {
  const link: ReactNode =
    tone === "paper" ? (
      <BookLink href={item.href}>{item.label}</BookLink>
    ) : (
      <SiteLink href={item.href}>{item.label}</SiteLink>
    );
  return (
    <>
      <span
        aria-hidden="true"
        className={tone === "paper" ? "pt-0.5 tabular-nums text-[var(--book-muted)]" : "w-6 shrink-0 pt-0.5 font-mono text-sm text-slate-400"}
      >
        {item.n}
      </span>
      <span className="min-w-0">{link}</span>
    </>
  );
}
