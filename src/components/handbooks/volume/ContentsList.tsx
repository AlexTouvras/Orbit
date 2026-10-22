import Link from "next/link";
import type { Handbook } from "@/content/handbooks";
import { pagePath } from "@/lib/handbooks";

export function ContentsList({
  handbook,
  pageNumber,
  label = "Contents",
  showHeading = true,
}: {
  handbook: Handbook;
  pageNumber: number;
  label?: string;
  showHeading?: boolean;
}) {
  return (
    <nav aria-label={label}>
      {showHeading ? <p className="book-kicker">{label}</p> : null}
      <ol className="mt-3 space-y-1">
        {handbook.contents.map((entry, index) => {
          const onThisPage = entry.page === pageNumber;
          const inChapter =
            onThisPage || Boolean(entry.sections?.some((section) => section.page === pageNumber));
          return (
            <li key={entry.title}>
              <Link
                href={pagePath(handbook.slug, entry.page)}
                aria-current={onThisPage ? "page" : inChapter ? "true" : undefined}
                className={contentsLink(inChapter)}
              >
                <span className="w-5 shrink-0 tabular-nums text-[var(--book-muted)]">{index + 1}</span>
                <span className="min-w-0 flex-1">{entry.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function contentsLink(current: boolean) {
  return [
    "flex items-baseline gap-2 rounded-sm py-1.5 pr-1 pl-3 text-[0.95rem] leading-snug",
    current
      ? "border-l-2 border-[var(--book-accent)] font-medium text-[var(--book-ink)]"
      : "border-l-2 border-transparent text-[var(--book-ink)] hover:border-[var(--book-rule)]",
  ].join(" ");
}
