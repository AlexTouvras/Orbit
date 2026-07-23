"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  RefreshCw,
  Check,
  Star,
  FolderGit2,
  ExternalLink,
} from "lucide-react";
import {
  STATUS_ORDER,
  STATUS_META,
  ACTIVITY_META,
  type ProjectStatus,
  type ProjectActivity,
  type PublishedProject,
  type ScannedProject,
} from "@/lib/project-status";
import { GlassCard } from "@/components/ui/GlassCard";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30";

interface Row extends PublishedProject {
  detectedLanguage: string;
  activity: ProjectActivity;
  lastActivity: string | null;
  publish: boolean;
  onDisk: boolean;
}

function rowFromScan(s: ScannedProject): Row {
  return {
    id: s.id,
    name: s.current?.name ?? s.name,
    description: s.current?.description ?? s.description,
    status: s.current?.status ?? "wip",
    tags: s.current?.tags ?? s.detectedTags,
    repoUrl: s.current?.repoUrl ?? s.repoUrl,
    liveUrl: s.current?.liveUrl ?? "",
    caseStudyUrl: s.current?.caseStudyUrl ?? "",
    featured: s.current?.featured ?? false,
    sourcePath: s.sourcePath,
    order: s.current?.order ?? 0,
    detectedLanguage: s.detectedLanguage,
    activity: s.activity,
    lastActivity: s.lastActivity,
    publish: s.published,
    onDisk: true,
  };
}

function rowFromPublished(p: PublishedProject): Row {
  return {
    ...p,
    detectedLanguage: "",
    activity: "unknown",
    lastActivity: null,
    publish: true,
    onDisk: false,
  };
}

export function ProjectsManager({
  initialPublished,
}: {
  initialPublished: PublishedProject[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() =>
    initialPublished.map(rowFromPublished),
  );
  const [scanning, setScanning] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async () => {
    setScanning(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/projects/scan");
      if (!res.ok) throw new Error("Scan failed");
      const data = (await res.json()) as { scanned: ScannedProject[] };
      const scannedRows = data.scanned.map(rowFromScan);
      const scannedPaths = new Set(scannedRows.map((r) => r.sourcePath));
      // Keep previously-published rows that the scan no longer finds on disk.
      setRows((prev) => {
        const keptOffline = prev
          .filter((r) => r.publish && !scannedPaths.has(r.sourcePath))
          .map((r) => ({ ...r, onDisk: false }));
        return [...scannedRows, ...keptOffline];
      });
    } catch {
      setError("Could not scan local projects.");
    } finally {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    // Defer so the initial scan's setState doesn't run synchronously in the effect.
    const t = setTimeout(() => {
      void scan();
    }, 0);
    return () => clearTimeout(t);
  }, [scan]);

  function update<K extends keyof Row>(id: string, key: K, value: Row[K]) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    );
    setSaveState("idle");
  }

  async function save() {
    setSaveState("saving");
    setError(null);
    const projects = rows
      .filter((r) => r.publish)
      .map((r, i) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        status: r.status,
        tags: r.tags,
        repoUrl: r.repoUrl,
        liveUrl: r.liveUrl,
        caseStudyUrl: r.caseStudyUrl,
        featured: r.featured,
        sourcePath: r.sourcePath,
        order: i,
      }));
    try {
      const res = await fetch("/api/studio/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? null);
        setSaveState("saved");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Save failed.");
      setSaveState("error");
    } catch {
      setError("Network error.");
      setSaveState("error");
    }
  }

  const publishedCount = rows.filter((r) => r.publish).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={scan}
          disabled={scanning}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-neon-cyan/50 hover:text-neon-cyan disabled:opacity-50"
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {scanning ? "Scanning…" : "Rescan local projects"}
        </button>
        <span className="text-sm text-slate-400">
          {rows.length} found · {publishedCount} published
        </span>
        <button
          type="button"
          onClick={save}
          disabled={saveState === "saving"}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-neon-cyan px-5 py-2.5 text-sm font-semibold text-void transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveState === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          {saveState === "saved" && <Check className="h-4 w-4" />}
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "Saved"
              : "Save & publish"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {rows.length === 0 && !scanning && (
        <GlassCard className="p-8 text-center text-sm text-slate-400">
          No projects found. Click “Rescan local projects”.
        </GlassCard>
      )}

      <div className="space-y-4">
        {rows.map((row) => (
          <GlassCard
            key={row.id}
            className={`p-5 transition-opacity ${row.publish ? "" : "opacity-60"}`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={row.publish}
                  onChange={(e) => update(row.id, "publish", e.target.checked)}
                  className="h-4 w-4 accent-neon-cyan"
                />
                <span className="text-sm font-medium text-white">Publish</span>
              </label>

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <FolderGit2 className="h-3.5 w-3.5" />
                {row.detectedLanguage || "—"}
              </span>

              <span
                className={`rounded-full border px-2 py-0.5 text-xs ${ACTIVITY_META[row.activity].tone === "green" ? "border-emerald-400/30 text-emerald-300" : "border-white/10 text-slate-400"}`}
              >
                {ACTIVITY_META[row.activity].label}
                {row.lastActivity
                  ? ` · ${new Date(row.lastActivity).toLocaleDateString()}`
                  : ""}
              </span>

              {!row.onDisk && (
                <span className="rounded-full border border-amber-400/30 px-2 py-0.5 text-xs text-amber-300">
                  not on disk
                </span>
              )}

              <button
                type="button"
                onClick={() => update(row.id, "featured", !row.featured)}
                className={`ml-auto inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                  row.featured
                    ? "border-neon-cyan/40 text-neon-cyan"
                    : "border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <Star
                  className={`h-3.5 w-3.5 ${row.featured ? "fill-neon-cyan" : ""}`}
                />
                Featured
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                className={inputClass}
                value={row.name}
                onChange={(e) => update(row.id, "name", e.target.value)}
                placeholder="Project name"
              />
              <select
                value={row.status}
                onChange={(e) =>
                  update(row.id, "status", e.target.value as ProjectStatus)
                }
                className={inputClass}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s} className="bg-void">
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              className={`${inputClass} mt-3 min-h-16 resize-y`}
              value={row.description}
              onChange={(e) => update(row.id, "description", e.target.value)}
              placeholder="Short description"
            />

            <input
              className={`${inputClass} mt-3`}
              value={row.tags.join(", ")}
              onChange={(e) =>
                update(
                  row.id,
                  "tags",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
              placeholder="Tags (comma-separated)"
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  className={inputClass}
                  value={row.repoUrl}
                  onChange={(e) => update(row.id, "repoUrl", e.target.value)}
                  placeholder="Repository URL"
                />
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  className={inputClass}
                  value={row.liveUrl}
                  onChange={(e) => update(row.id, "liveUrl", e.target.value)}
                  placeholder="Research / live URL"
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  className={inputClass}
                  value={row.caseStudyUrl}
                  onChange={(e) =>
                    update(row.id, "caseStudyUrl", e.target.value)
                  }
                  placeholder="Case study URL (e.g. /writes/...)"
                />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
