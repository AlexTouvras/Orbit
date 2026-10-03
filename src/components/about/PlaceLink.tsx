import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PlaceMark } from "@/components/about/PlaceMark";
import { cn } from "@/lib/utils";

/** Pressable employer or school title. Opens the place note. */
export function PlaceLink({
  href,
  name,
  mark,
  className,
}: {
  href: string;
  name: string;
  mark: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-ring group flex min-h-12 min-w-0 items-center gap-3 rounded-xl",
        className,
      )}
    >
      <PlaceMark mark={mark} />
      <h3 className="min-w-0 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {name}
      </h3>
      <ArrowUpRight
        className="h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-neon-cyan"
        aria-hidden
      />
    </Link>
  );
}
