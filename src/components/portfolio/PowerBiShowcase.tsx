"use client";

import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  ExternalLink,
  X,
} from "lucide-react";
import type { PowerBiReport } from "@/content/power-bi-reports";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function PowerBiShowcase({ reports }: { reports: PowerBiReport[] }) {
  const [reportIndex, setReportIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const report = reports[reportIndex] ?? reports[0];
  const pageCount = report?.pages.length ?? 0;
  const page = report?.pages[pageIndex] ?? report?.pages[0];

  const selectReport = useCallback((index: number) => {
    setReportIndex(index);
    setPageIndex(0);
  }, []);

  const goPage = useCallback(
    (delta: number) => {
      if (pageCount === 0) return;
      setPageIndex((i) => (i + delta + pageCount) % pageCount);
    },
    [pageCount],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPage(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goPage(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPage, lightboxOpen]);

  if (!reports.length || !report || !page) return null;

  function onPreviewKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setLightboxOpen(true);
    }
  }

  const lightbox =
    lightboxOpen && mounted
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${report.title} — ${page.label}`}
            className="fixed inset-0 z-[100] flex flex-col bg-void/95 backdrop-blur-sm"
            onClick={() => setLightboxOpen(false)}
          >
            <div
              className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {report.title}
                </p>
                <p className="truncate font-mono text-xs text-slate-400">
                  {page.label} · {pageIndex + 1} / {pageCount}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="focus-ring inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-200 hover:border-white/30"
                aria-label="Close enlarged view"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {pageCount > 1 && (
                <button
                  type="button"
                  onClick={() => goPage(-1)}
                  className="focus-ring absolute left-2 top-1/2 z-10 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-void/70 text-white sm:left-4"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              <div className="flex h-full max-h-[calc(100dvh-8rem)] w-full max-w-6xl items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.src}
                  alt={`${report.title} — ${page.label}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              {pageCount > 1 && (
                <button
                  type="button"
                  onClick={() => goPage(1)}
                  className="focus-ring absolute right-2 top-1/2 z-10 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-void/70 text-white sm:right-4"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            <p
              className="border-t border-white/10 px-4 py-3 text-center text-sm text-slate-300 sm:px-6"
              onClick={(e) => e.stopPropagation()}
            >
              {page.caption}
            </p>
          </div>,
          document.body,
        )
      : null;

  return (
    <section id="power-bi" className="scroll-mt-28" aria-label="Power BI reports">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Analytics"
            title="Power BI"
            description="Report pages from my Power BI portfolio — pick a report, browse pages, enlarge for detail."
          />
          {report.repoUrl && (
            <Link
              href={report.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-neon-cyan"
            >
              View repo
              <ExternalLink className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </Reveal>

      {/* Mobile report chips */}
      <div
        className="mt-8 flex gap-2 overflow-x-auto pb-1 lg:hidden"
        role="tablist"
        aria-label="Power BI reports"
      >
        {reports.map((r, i) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={i === reportIndex}
            onClick={() => selectReport(i)}
            className={cn(
              "focus-ring inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-xs font-medium transition-[color,background-color,border-color]",
              i === reportIndex
                ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                : "border-white/10 text-slate-300 hover:border-white/20 hover:text-white",
            )}
          >
            {r.title}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(12rem,16rem)_1fr] lg:gap-8">
        {/* Desktop side list */}
        <nav
          className="hidden lg:block"
          aria-label="Power BI reports"
        >
          <ul className="space-y-1">
            {reports.map((r, i) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => selectReport(i)}
                  className={cn(
                    "focus-ring w-full rounded-xl border px-4 py-3 text-left transition-[color,background-color,border-color]",
                    i === reportIndex
                      ? "border-neon-cyan/40 bg-neon-cyan/10 text-white"
                      : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white",
                  )}
                  aria-current={i === reportIndex ? "true" : undefined}
                >
                  <span className="block text-sm font-semibold">{r.title}</span>
                  <span className="mt-1 block text-xs leading-snug text-slate-400">
                    {r.summary}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="lg:hidden text-sm text-slate-300">{report.summary}</p>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 lg:mt-0">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                {page.label}
              </p>
              <p className="mt-1 max-w-xl text-sm text-slate-300">{page.caption}</p>
            </div>
            <p className="font-mono text-xs tabular-nums text-slate-500">
              {pageIndex + 1} / {pageCount}
            </p>
          </div>

          <div className="relative mt-4">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              onKeyDown={onPreviewKey}
              className="focus-ring group relative block w-full overflow-hidden rounded-xl border border-white/10 bg-void-800 text-left"
              aria-label={`Enlarge ${page.label}`}
            >
              <span className="relative block aspect-[16/10] w-full">
                {/* Native img: large report PNGs skip the image optimizer. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.src}
                  alt={`${report.title} — ${page.label}`}
                  className="h-full w-full object-contain object-top"
                  loading={reportIndex === 0 && pageIndex === 0 ? "eager" : "lazy"}
                />
              </span>
              <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-void/80 px-2.5 py-1.5 text-xs text-slate-200 opacity-90 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <Expand className="h-3.5 w-3.5" aria-hidden />
                Enlarge
              </span>
            </button>

            {pageCount > 1 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goPage(-1)}
                  className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition-colors hover:border-neon-cyan/40 hover:text-neon-cyan"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div
                  className="flex flex-wrap justify-center gap-1.5"
                  role="tablist"
                  aria-label="Report pages"
                >
                  {report.pages.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={i === pageIndex}
                      aria-label={p.label}
                      onClick={() => setPageIndex(i)}
                      className={cn(
                        "focus-ring h-2.5 w-2.5 rounded-full transition-colors",
                        i === pageIndex
                          ? "bg-neon-cyan"
                          : "bg-white/20 hover:bg-white/40",
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => goPage(1)}
                  className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition-colors hover:border-neon-cyan/40 hover:text-neon-cyan"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightbox}
    </section>
  );
}
