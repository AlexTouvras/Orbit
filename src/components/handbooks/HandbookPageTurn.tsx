"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function HandbookPageTurn({
  previous,
  next,
}: {
  previous: string | null;
  next: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "ArrowLeft" && previous) {
        event.preventDefault();
        router.push(previous);
      }
      if (event.key === "ArrowRight" && next) {
        event.preventDefault();
        router.push(next);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous, router]);

  return null;
}
