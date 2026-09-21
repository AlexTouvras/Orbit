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

/** Full-bleed chapter. Padding lives here so AppChrome can drop the max-width column. */
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
        "scroll-mt-28 px-4 sm:px-8 lg:px-12",
        viewport
          ? "relative flex min-h-[calc(100dvh-5.5rem)] flex-col justify-center overflow-hidden py-16 sm:py-20"
          : "relative py-20 sm:py-28",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto w-full",
          width === "copy" ? "max-w-3xl" : "max-w-6xl",
        )}
      >
        {children}
      </div>
    </section>
  );
}
