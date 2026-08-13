import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type OrbitVariant = "cyan" | "violet" | "blue";

const accent: Record<OrbitVariant, string> = {
  /* Brand cyan: live orbit channels (Tailwind /alpha can fall back to inherited white). */
  cyan: "orbit-accent-muted",
  violet: "text-neon-violet/25",
  blue: "text-neon-blue/25",
};

const dot: Record<OrbitVariant, string> = {
  cyan: "orbit-accent",
  violet: "text-neon-violet",
  blue: "text-neon-blue",
};

interface OrbitSignatureProps {
  variant?: OrbitVariant;
  className?: string;
  duration?: string;
}

/** Site signature — slow-drifting orbital ring. */
export function OrbitSignature({
  variant = "cyan",
  className,
  duration = "90s",
}: OrbitSignatureProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("h-full w-full", accent[variant], className)}
    >
      <g
        className="motion-safe:animate-[orbit-drift_linear_infinite]"
        style={
          duration
            ? ({ animationDuration: duration } as CSSProperties)
            : undefined
        }
      >
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="3 10"
        />
        <circle cx="100" cy="22" r="3" fill="currentColor" className={dot[variant]} />
      </g>
    </svg>
  );
}
