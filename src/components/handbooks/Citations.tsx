import { BookLink } from "@/components/handbooks/volume/BookLink";
import type { PageReference } from "@/lib/handbook-citations";

/** Small numbers that open the matching work in the reference list. */
export function CiteMarks({ marks }: { marks: number[] }) {
  if (!marks.length) return null;
  return (
    <>
      {marks.map((n) => (
        <a key={n} href={`#ref-${n}`} className="book-cite" aria-label={`Reference ${n}`}>
          {n}
        </a>
      ))}
    </>
  );
}

export function ReferenceItem({ item }: { item: PageReference }) {
  return (
    <>
      <span aria-hidden="true" className="pt-0.5 tabular-nums text-[var(--book-muted)]">
        {item.n}
      </span>
      <span className="min-w-0">
        <BookLink href={item.href}>{item.label}</BookLink>
      </span>
    </>
  );
}
