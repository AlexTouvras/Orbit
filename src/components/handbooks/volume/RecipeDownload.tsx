import type { HandbookRecipeLink } from "@/content/handbooks";

/** Download link for a book's machine recipe. */
export function RecipeDownload({
  recipe,
  className = "mt-8",
  compact = false,
}: {
  recipe: HandbookRecipeLink;
  className?: string;
  /** Inline link for the cover CTA row (no kicker block). */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <a
        href={recipe.href}
        download={recipe.filename}
        className={["book-link inline-flex items-baseline gap-1.5", className].filter(Boolean).join(" ")}
      >
        <span aria-hidden="true">↓</span>
        <span>{recipe.label}</span>
      </a>
    );
  }

  return (
    <div className={className}>
      <p className="book-kicker">Agent recipe</p>
      <a
        href={recipe.href}
        download={recipe.filename}
        className="book-link mt-3 inline-flex items-baseline gap-2 text-[0.95rem] leading-snug"
      >
        <span aria-hidden="true">↓</span>
        <span>{recipe.label}</span>
      </a>
      <p className="mt-2 text-[0.85rem] leading-snug text-[var(--book-muted)]">
        Markdown for agents. Stages, pass lines, and hard stops.
      </p>
    </div>
  );
}
