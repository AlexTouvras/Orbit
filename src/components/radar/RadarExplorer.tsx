"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SatelliteDish } from "lucide-react";
import type { NewsCategory, NewsItem } from "@/lib/types";
import { interleaveByCategory } from "@/lib/news/balance";
import { NEWS_FILTER_TONE } from "@/lib/news/category-tone";
import { NewsCard } from "./NewsCard";
import { FilterChip } from "@/components/ui/FilterChip";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const FILTERS: ("All" | NewsCategory)[] = [
  "All",
  "AI",
  "Data",
  "Analytics",
  "Delivery",
];

const ease = [0.22, 1, 0.36, 1] as const;

export function RadarExplorer({ items }: { items: NewsItem[] }) {
  const reduced = usePrefersReducedMotion();
  const [category, setCategory] = useState<"All" | NewsCategory>("All");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: items.length };
    for (const item of items) map[item.category] = (map[item.category] ?? 0) + 1;
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = items.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.contentSnippet.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
    // Single-lane filters stay newest-first; All mixes lanes so AI dailies don't dominate.
    return category === "All" ? interleaveByCategory(matched) : matched;
  }, [items, category, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter related articles by topic"
        >
          {FILTERS.map((f) => (
            <FilterChip
              key={f}
              active={category === f}
              onClick={() => setCategory(f)}
              tone={NEWS_FILTER_TONE[f]}
            >
              {f}
              <span className="ml-1.5 tabular-nums text-slate-400">
                {counts[f] ?? 0}
              </span>
            </FilterChip>
          ))}
        </div>

        <div className="relative sm:w-72">
          <label htmlFor="radar-search" className="sr-only">
            Search related articles
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="radar-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search related articles…"
            className="input-mission"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <motion.div layout className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                className="min-w-0"
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease }}
              >
                <NewsCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-16 flex flex-col items-center text-center" role="status">
          <SatelliteDish className="h-10 w-10 text-slate-500" aria-hidden />
          <p className="mt-4 text-sm text-slate-300">
            No signals match your filters.
          </p>
        </div>
      )}
    </div>
  );
}
