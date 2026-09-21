import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 3–5 figures that answer the desk question before any click. */
export function DeskCast({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-6 border-y border-white/10 py-6 sm:grid-cols-3 lg:grid-cols-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
