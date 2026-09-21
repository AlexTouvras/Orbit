import { cn } from "@/lib/utils";

export function StoryStat({
  label,
  value,
  hint,
  className,
  valueClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn(className)}>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl",
          valueClassName ?? "orbit-accent",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 font-mono text-[0.7rem] text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
