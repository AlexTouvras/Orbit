import type { ReactNode } from "react";

/** Source, lag, and what this desk is not. */
export function DeskClose({ children }: { children: ReactNode }) {
  return (
    <footer className="border-t border-white/10 pt-6 text-sm leading-relaxed text-slate-400">
      {children}
    </footer>
  );
}
