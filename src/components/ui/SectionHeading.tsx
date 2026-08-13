import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="orbit-accent mb-2 font-mono text-xs uppercase tracking-[0.3em]">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-section font-bold tracking-tight text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
