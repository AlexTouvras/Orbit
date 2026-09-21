import Link from "next/link";
import { cn } from "@/lib/utils";

const satellites = [
  { label: "products", href: "/portfolio", slot: "top" },
  { label: "essays", href: "/writes", slot: "right" },
  { label: "signals", href: "/radar", slot: "bottom" },
  { label: "projects", href: "/#selected-work", slot: "left" },
] as const;

const slotClass: Record<(typeof satellites)[number]["slot"], string> = {
  top: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  right: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
  bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  left: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
};

/** Brand metaphor as a diagram: center of gravity with what orbits it. */
export function GravityField({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-md",
        className,
      )}
      aria-hidden={false}
    >
      <div
        className="pointer-events-none absolute inset-[8%] rounded-full border border-dashed border-white/15 motion-safe:animate-[orbit-drift_80s_linear_infinite]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[26%] rounded-full border border-white/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[44%] rounded-full border border-white/8"
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="max-w-[7.5rem] text-center font-display text-lg font-semibold leading-tight tracking-tight text-white sm:text-xl">
          how I
          <br />
          <span className="orbit-accent">build</span>
        </p>
      </div>
      {satellites.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "focus-ring absolute rounded-full border border-white/15 bg-void/90 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-200 backdrop-blur-sm transition-colors hover:border-neon-cyan/40 hover:text-neon-cyan",
            slotClass[item.slot],
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
