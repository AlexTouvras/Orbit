import { cn } from "@/lib/utils";

export function StoryStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="orbit-accent mt-1 font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
        {value}
      </p>
    </div>
  );
}
