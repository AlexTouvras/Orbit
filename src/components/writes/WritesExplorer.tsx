"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PenLine } from "lucide-react";
import type { Write, WriteCategory } from "@/lib/types";
import { WriteCard } from "./WriteCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const FILTERS: ("All" | WriteCategory)[] = [
  "All",
  "Career",
  "Data",
  "AI",
  "Delivery",
  "Learning",
];

const ease = [0.22, 1, 0.36, 1] as const;

export function WritesExplorer({ writes }: { writes: Write[] }) {
  const reduced = usePrefersReducedMotion();
  const [category, setCategory] = useState<"All" | WriteCategory>("All");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: writes.length };
    for (const write of writes) {
      map[write.category] = (map[write.category] ?? 0) + 1;
    }
    return map;
  }, [writes]);

  const visibleFilters = useMemo(
    () => FILTERS.filter((f) => f === "All" || (counts[f] ?? 0) > 0),
    [counts],
  );

  const activeCategory =
    category === "All" || (counts[category] ?? 0) > 0 ? category : "All";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return writes.filter((write) => {
      const matchesCategory =
        activeCategory === "All" || write.category === activeCategory;
      const matchesQuery =
        !q ||
        write.title.toLowerCase().includes(q) ||
        write.summary.toLowerCase().includes(q) ||
        write.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [writes, activeCategory, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter articles by category"
        >
          {visibleFilters.map((f) => (
            <FilterChip
              key={f}
              active={activeCategory === f}
              onClick={() => setCategory(f)}
            >
              {f}
              {(counts[f] ?? 0) > 0 && (
                <span className="ml-1.5 tabular-nums text-slate-400">
                  {counts[f]}
                </span>
              )}
            </FilterChip>
          ))}
        </div>

        <div className="relative sm:w-72">
          <label htmlFor="writes-search" className="sr-only">
            Search articles
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="writes-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="input-mission"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <motion.div layout className="mt-8 grid gap-6 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((write) => (
              <motion.div
                key={write.slug}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease }}
              >
                <WriteCard write={write} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-16 flex flex-col items-center text-center" role="status">
          <PenLine className="h-10 w-10 text-slate-500" aria-hidden />
          <p className="mt-4 text-sm text-slate-300">
            No articles match your filters.
          </p>
        </div>
      )}
    </div>
  );
}
