import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StoryReveal } from "@/components/story/StoryReveal";

/** Primary visual of a live desk — map, tape, mix, or board. */
export function DeskPicture({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <StoryReveal>
      <section aria-label={label} className={cn(className)}>
        {children}
      </section>
    </StoryReveal>
  );
}
