"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Left and right move between chapters when focus is not in a control. */
export function ChapterKeys({
  previous,
  next,
}: {
  previous: string | null;
  next: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("a, button, input, textarea, select, summary, [data-book-scroll]")
      ) {
        return;
      }
      if (window.getSelection()?.toString()) return;
      const href = event.key === "ArrowLeft" ? previous : next;
      if (!href) return;
      event.preventDefault();
      router.push(href);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous, router]);

  return null;
}
