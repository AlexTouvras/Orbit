import { cn } from "@/lib/utils";

/** Original monogram for an employer or school. Not a trademarked logo. */
export function PlaceMark({
  mark,
  size = "md",
}: {
  mark: string;
  size?: "md" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] font-display font-semibold leading-none tracking-tight text-white transition-colors group-hover:border-neon-cyan/50",
        size === "lg" ? "h-16 w-16" : "h-12 w-12",
        mark.length > 3
          ? size === "lg"
            ? "text-xs"
            : "text-[0.6rem]"
          : size === "lg"
            ? "text-sm"
            : "text-[0.7rem]",
      )}
    >
      {mark}
    </span>
  );
}
