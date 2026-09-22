import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StorySceneProps {
  id: string;
  children: ReactNode;
  className?: string;
  /** Inner column. Hub story uses a wider frame than interior pages. */
  width?: "copy" | "stage";
  /** Nearly full viewport, used for the opening chapter. */
  viewport?: boolean;
}

/** Chapter inside the shared page column. Chrome owns the max-width. */
export function StoryScene({
  id,
  children,
  className,
  width = "stage",
  viewport = false,
}: StorySceneProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28",
        viewport ? "relative py-8 sm:py-10" : "relative py-16 sm:py-24",
        className,
      )}
    >
      <div className={cn("w-full", width === "copy" && "max-w-3xl")}>
        {children}
      </div>
    </section>
  );
}
