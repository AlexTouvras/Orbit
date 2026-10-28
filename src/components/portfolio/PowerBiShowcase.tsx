"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  ExternalLink,
  X,
} from "lucide-react";
import type { PowerBiReport, PowerBiReportPage } from "@/content/power-bi-reports";
import { ChapterMark } from "@/components/story/ChapterMark";
import { useHydrated } from "@/lib/use-hydrated";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function PowerBiShowcase({ reports }: { reports: PowerBiReport[] }) {
  const hydrated = useHydrated();
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? "");
  const [pageIndex, setPageIndex] = useState(0);
  const [lightbox, setLightbox] = useState<{
    report: PowerBiReport;
    pageIndex: number;
  } | null>(null);

  const report =
    reports.find((item) => item.id === selectedId) ?? reports[0];
  const pageCount = report?.pages.length ?? 0;
  const page: PowerBiReportPage | undefined =
    report?.pages[pageIndex] ?? report?.pages[0];

  const selectReport = useCallback((id: string) => {
    setSelectedId(id);
    setPageIndex(0);
  }, []);

  const open = useCallback((next: PowerBiReport, index: number) => {
    setLightbox({ report: next, pageIndex: index });
  }, []);

  const close = useCallback(() => setLightbox(null), []);

  const goPage = useCallback((delta: number) => {
    setLightbox((current) => {
      if (!current) return current;
      const count = current.report.pages.length;
      if (count === 0) return current;
      return {
        ...current,
        pageIndex: (current.pageIndex + delta + count) % count,
      };
    });
  }, []);

  useEffect(() => {
    const list = document.getElementById("pbi-report-list");
    const tab = document.getElementById(`pbi-tab-${selectedId}`);
    if (!list || !tab) return;
    const listBox = list.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    if (tabBox.top < listBox.top) {
      list.scrollTop -= listBox.top - tabBox.top;
    } else if (tabBox.bottom > listBox.bottom) {
      list.scrollTop += tabBox.bottom - listBox.bottom;
    }
  }, [selectedId]);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        close();
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
  }, [close, goPage, lightbox]);

  function onListKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!report) return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const index = reports.findIndex((item) => item.id === report.id);
    const next =
      e.key === "ArrowDown"
        ? reports[(index + 1) % reports.length]
        : reports[(index - 1 + reports.length) % reports.length];
    if (!next) return;
    selectReport(next.id);
    document.getElementById(`pbi-tab-${next.id}`)?.focus();
  }

  if (!reports.length || !report || !page) return null;

  const repoUrl = reports.find((item) => item.repoUrl)?.repoUrl;
  const lightPage = lightbox
    ? (lightbox.report.pages[lightbox.pageIndex] ?? lightbox.report.pages[0])
    : undefined;
  const lightCount = lightbox?.report.pages.length ?? 0;

  const overlay =
    lightbox && lightPage && hydrated
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${lightbox.report.title} — ${lightPage.label}`}
            className="fixed inset-0 z-[100] flex flex-col bg-void/95 backdrop-blur-sm"
            onClick={close}
          >
            <div
              className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {lightbox.report.title}
                </p>
                <p className="truncate font-mono text-xs text-slate-400">
                  {lightPage.label} · {lightbox.pageIndex + 1} / {lightCount}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
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
              {lightCount > 1 && (
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
                  src={lightPage.src}
                  alt={`${lightbox.report.title} — ${lightPage.label}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              {lightCount > 1 && (
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
          </div>,
          document.body,
        )
      : null;

  return (
    <section id="power-bi" className="scroll-mt-28" aria-label="Power BI reports">
      <div className="relative">
        <ChapterMark
          className="[&>p:first-child]:max-w-[calc(100%-6.5rem)]"
          index="03"
          eyebrow="Analytics"
          title="Power BI"
        />
        {repoUrl ? (
          <Link
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring group absolute right-0 top-0 z-30 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-slate-300 hover:text-neon-cyan"
          >
            View repo
            <ExternalLink className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>

      <div className="mt-8 grid grid-cols-[8.75rem_minmax(0,1fr)] items-stretch gap-3 sm:mt-10 sm:grid-cols-[12.5rem_minmax(0,1fr)] sm:gap-6 md:grid-cols-[17.5rem_minmax(0,1fr)]">
        <div className="relative min-h-[14rem] min-w-0">
        <div
          id="pbi-report-list"
          role="tablist"
          aria-label="Reports"
          aria-orientation="vertical"
          onKeyDown={onListKey}
          className="absolute inset-0 flex flex-col gap-0.5 overflow-y-auto overscroll-y-contain p-1"
        >
          {reports.map((item, index) => {
            const selected = item.id === report.id;
            return (
              <button
                key={item.id}
                id={`pbi-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="pbi-report"
                tabIndex={selected ? 0 : -1}
                onClick={() => selectReport(item.id)}
                className={
                  selected
                    ? "focus-ring min-w-0 rounded-xl border border-neon-cyan/40 bg-white/[0.06] px-3 py-1.5 text-left"
                    : "focus-ring min-w-0 rounded-xl border border-transparent px-3 py-1.5 text-left hover:border-white/10 hover:bg-white/[0.03]"
                }
              >
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="shrink-0 font-mono text-[0.65rem] tabular-nums text-slate-500">
                    {pad(index + 1)}
                  </span>
                  <span className="min-w-0 font-display text-sm font-semibold leading-snug tracking-tight text-white">
                    {item.title}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        </div>

        <div
          id="pbi-report"
          role="tabpanel"
          aria-labelledby={`pbi-tab-${report.id}`}
          className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
        >
          <button
            type="button"
            onClick={() => open(report, pageIndex)}
            className="focus-ring group relative mx-3 mt-3 block w-[calc(100%-1.5rem)] overflow-hidden rounded-xl border border-white/10 bg-void-800 text-left sm:mx-5 sm:mt-5 sm:w-[calc(100%-2.5rem)]"
            aria-label={`Enlarge ${report.title} — ${page.label}`}
          >
            <span className="relative block aspect-[16/10] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.src}
                alt={`${report.title} — ${page.label}`}
                className="absolute inset-0 h-full w-full object-contain object-top"
              />
            </span>
            <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-void/80 px-2.5 py-1.5 text-xs text-slate-200 opacity-90 backdrop-blur-sm">
              <Expand className="h-3.5 w-3.5" aria-hidden />
              Enlarge
            </span>
          </button>

          <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
            <p className="min-w-0 truncate font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-500 sm:tracking-[0.2em]">
              {page.label}
              {pageCount > 1 ? ` · ${pageIndex + 1} / ${pageCount}` : ""}
            </p>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {report.liveUrl ? (
                <Link
                  href={report.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex min-h-11 items-center gap-1 text-sm font-medium text-neon-cyan sm:min-h-0"
                >
                  Open live board
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : null}
              {pageCount > 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPageIndex((i) => (i - 1 + pageCount) % pageCount)
                    }
                    className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 text-slate-200 hover:border-neon-cyan/40 hover:text-neon-cyan"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageIndex((i) => (i + 1) % pageCount)}
                    className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 text-slate-200 hover:border-neon-cyan/40 hover:text-neon-cyan"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {overlay}
    </section>
  );
}
