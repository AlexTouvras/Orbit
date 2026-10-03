import Image from "next/image";
import { cn } from "@/lib/utils";

/** Institution mark beside an employer or school name. */
export function PlaceMark({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-white transition-colors group-hover:border-neon-cyan/50",
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="48px"
        className="object-contain p-1.5"
      />
    </span>
  );
}
