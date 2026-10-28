"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Expand, ExternalLink, X } from "lucide-react";
import type { PowerBiReport, PowerBiReportPage } from "@/content/power-bi-reports";
import {
  TitleStage,
  TitleStageHeader,
} from "@/components/portfolio/TitleStage";
import { useHydrated } from "@/lib/use-hydrated";

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
      <TitleStageHeader
        index="03"
        eyebrow="Analytics"
        title="Power BI"
        action={
          repoUrl
            ? { href: repoUrl, label: "View repo", external: true }
            : undefined
        }
      />

      <TitleStage
        items={reports.map((item) => ({ id: item.id, title: item.title }))}
        selectedId={report.id}
        onSelect={selectReport}
        listId="pbi-report-list"
        tabPrefix="pbi-tab"
        panelId="pbi-report"
        ariaLabel="Reports"
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
      </TitleStage>
      {overlay}
    </section>
  );
}
