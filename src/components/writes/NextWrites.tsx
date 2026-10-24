import Link from "next/link";
import type { Write } from "@/lib/types";

type NextWrite = Pick<Write, "slug" | "title" | "summary" | "category" | "readingTime">;

export function NextWrites({
  writes,
  related,
}: {
  writes: NextWrite[];
  related: boolean;
}) {
  if (writes.length === 0) return null;

  return (
    <nav aria-label="Next essays" className="mt-16 border-t border-white/8 pt-10">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
        Read next
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        {related ? "Same topic, then shared tags." : "Other essays."}
      </p>
      <ol className="mt-4 divide-y divide-white/8 border-y border-white/8">
        {writes.map((write) => (
          <li key={write.slug}>
            <Link
              href={`/writes/${write.slug}`}
              className="focus-ring group block py-5"
            >
              <p className="font-mono text-xs text-slate-400">
                {write.category}
                <span aria-hidden="true"> · </span>
                {write.readingTime} min
              </p>
              <p className="mt-2 text-lg font-semibold leading-snug text-white group-hover:text-neon-cyan">
                {write.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {write.summary}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
