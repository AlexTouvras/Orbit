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
import { ScrollRail, ScrollRailCard } from "@/components/story/ScrollRail";
import { useHydrated } from "@/lib/use-hydrated";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function PowerBiShowcase({ reports }: { reports: PowerBiReport[] }) {
  const hydrated = useHydrated();
  const [lightbox, setLightbox] = useState<{
    report: PowerBiReport;
    pageIndex: number;
  } | null>(null);

  const open = useCallback((report: PowerBiReport, pageIndex: number) => {
    setLightbox({ report, pageIndex });
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

  if (!reports.length) return null;

  const repoUrl = reports.find((r) => r.repoUrl)?.repoUrl;
  const page = lightbox
    ? (lightbox.report.pages[lightbox.pageIndex] ?? lightbox.report.pages[0])
    : undefined;
  const pageCount = lightbox?.report.pages.length ?? 0;

  const overlay =
    lightbox && page && hydrated
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${lightbox.report.title} — ${page.label}`}
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
                  {page.label} · {lightbox.pageIndex + 1} / {pageCount}
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
                  alt={`${lightbox.report.title} — ${page.label}`}
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
      <ScrollRail
        length={reports.length}
        header={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <ChapterMark
              index="03"
              eyebrow="Analytics"
              title="Power BI"
              description="Report pages from my Power BI portfolio — browse pages, enlarge for detail."
            />
            {repoUrl ? (
              <Link
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-medium text-slate-300 hover:text-neon-cyan"
              >
                View repo
                <ExternalLink className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" />
              </Link>
            ) : null}
          </div>
        }
      >
        {reports.map((report, i) => (
          <PowerBiRailCard
            key={report.id}
            report={report}
            index={i}
            onEnlarge={open}
          />
        ))}
      </ScrollRail>
      {overlay}
    </section>
  );
}

function PowerBiRailCard({
  report,
  index,
  onEnlarge,
}: {
  report: PowerBiReport;
  index: number;
  onEnlarge: (report: PowerBiReport, pageIndex: number) => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageCount = report.pages.length;
  const page: PowerBiReportPage | undefined =
    report.pages[pageIndex] ?? report.pages[0];
  if (!page) return null;

  function onPreviewKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onEnlarge(report, pageIndex);
    }
  }

  return (
    <ScrollRailCard className="w-[min(88vw,52rem)]">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="relative px-6 pt-6 sm:px-8 sm:pt-8">
          <p className="story-index absolute right-4 top-2 select-none" aria-hidden>
            {pad(index + 1)}
          </p>
          <h3 className="relative font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {report.title}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            {report.summary}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onEnlarge(report, pageIndex)}
          onKeyDown={onPreviewKey}
          className="focus-ring group relative mx-6 mt-5 block overflow-hidden rounded-xl border border-white/10 bg-void-800 text-left sm:mx-8"
          aria-label={`Enlarge ${report.title} — ${page.label}`}
        >
          <span className="relative block aspect-[16/10] w-full">
            {/* Native img: large report PNGs skip the image optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.src}
              alt={`${report.title} — ${page.label}`}
              className="h-full w-full object-contain object-top"
              loading={index === 0 && pageIndex === 0 ? "eager" : "lazy"}
            />
          </span>
          <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-void/80 px-2.5 py-1.5 text-xs text-slate-200 opacity-90 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <Expand className="h-3.5 w-3.5" aria-hidden />
            Enlarge
          </span>
        </button>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 px-6 py-5 sm:px-8">
          <div className="min-w-0">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
              {page.label}
              {pageCount > 1 ? ` · ${pageIndex + 1} / ${pageCount}` : ""}
            </p>
            <p className="mt-1 max-w-md text-sm text-slate-400">{page.caption}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
      </article>
    </ScrollRailCard>
  );
}
