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
          const contains =
            entry.page === pageNumber ||
            Boolean(entry.sections?.some((section) => section.page === pageNumber));
          const current = !entry.sections?.length && entry.page === pageNumber;
          return (
            <li key={entry.title}>
              <Link
                href={pagePath(handbook.slug, entry.page)}
                aria-current={current ? "page" : undefined}
                className={contentsLink(current, contains)}
              >
                <span className="w-5 shrink-0 tabular-nums text-[var(--book-muted)]">{index + 1}</span>
                <span className="min-w-0 flex-1">{entry.title}</span>
                {entry.sections?.length ? null : (
                  <span className="shrink-0 tabular-nums text-[var(--book-muted)]">{entry.page}</span>
                )}
              </Link>
              {entry.sections?.length ? (
                <ol className="mt-1 mb-2 ml-5 space-y-1 border-l border-[var(--book-rule)]">
                  {entry.sections.map((section) => {
                    const sectionCurrent = section.page === pageNumber;
                    return (
                      <li key={section.title}>
                        <Link
                          href={pagePath(handbook.slug, section.page)}
                          aria-current={sectionCurrent ? "page" : undefined}
                          className={contentsLink(sectionCurrent, sectionCurrent)}
                        >
                          <span className="min-w-0 flex-1">{section.title}</span>
                          <span className="shrink-0 tabular-nums text-[var(--book-muted)]">{section.page}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function contentsLink(current: boolean, inside: boolean) {
  return [
    "flex items-baseline gap-2 rounded-sm py-1.5 pr-1 pl-3 text-[0.95rem] leading-snug",
    current
      ? "border-l-2 border-[var(--book-accent)] font-medium text-[var(--book-ink)]"
      : inside
        ? "border-l-2 border-[var(--book-rule)] text-[var(--book-ink)]"
        : "border-l-2 border-transparent text-[var(--book-ink)] hover:border-[var(--book-rule)]",
  ].join(" ");
}
