import { ArrowUpRight } from "lucide-react";
import { PlaceMark } from "@/components/about/PlaceMark";
import { cn } from "@/lib/utils";

/** Employer or school title. One press opens the institution's site. */
export function PlaceLink({
  href,
  name,
  logo,
  className,
}: {
  href: string;
  name: string;
  logo: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "focus-ring group flex min-h-12 min-w-0 items-center gap-3 rounded-xl",
        className,
      )}
    >
      <PlaceMark src={logo} />
      <h3 className="min-w-0 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {name}
      </h3>
      <ArrowUpRight
        className="h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-neon-cyan"
        aria-hidden
      />
      <span className="sr-only"> (official site)</span>
    </a>
  );
}
