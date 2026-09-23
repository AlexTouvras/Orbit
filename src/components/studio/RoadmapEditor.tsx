"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Check } from "lucide-react";
import type {
  RoadmapMilestone,
  RoadmapStatus,
  RoadmapTrack,
  StudioRoadmap,
} from "@/lib/studio-roadmap";
import { GlassCard } from "@/components/ui/GlassCard";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30";

const TRACKS: RoadmapTrack[] = ["career", "website", "evidence"];
const STATUSES: RoadmapStatus[] = [
  "planned",
  "active",
  "evidence",
  "proven",
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {hint ? (
        <span className="mb-1.5 block text-xs text-slate-500">{hint}</span>
      ) : null}
      {children}
    </label>
  );
}

function newMilestone(): RoadmapMilestone {
  return {
    id: `m-${Date.now().toString(36)}`,
    title: "",
    track: "career",
    status: "planned",
  };
}

export function RoadmapEditor({ initial }: { initial: StudioRoadmap }) {
  const router = useRouter();
  const [form, setForm] = useState<StudioRoadmap>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function setFocusNow(value: string) {
    setForm((f) => ({ ...f, focusNow: value }));
    setStatus("idle");
    setInfo(null);
  }

  function updateMilestone(
    index: number,
    patch: Partial<RoadmapMilestone>,
  ) {
    setForm((f) => ({
      ...f,
      milestones: f.milestones.map((m, i) =>
        i === index ? { ...m, ...patch } : m,
      ),
    }));
    setStatus("idle");
    setInfo(null);
  }

  function addMilestone() {
    setForm((f) => ({
      ...f,
      milestones: [...f.milestones, newMilestone()],
    }));
    setStatus("idle");
  }

  function removeMilestone(index: number) {
    setForm((f) => ({
      ...f,
      milestones: f.milestones.filter((_, i) => i !== index),
    }));
    setStatus("idle");
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    setInfo(null);

    try {
      const res = await fetch("/api/studio/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Save failed.");
        return;
      }
      setStatus("saved");
      setInfo(data.message ?? "Saved.");
      router.refresh();
    } catch {
      setStatus("error");
      setError("Network error.");
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-6">
      <GlassCard className="space-y-4 p-5">
        <Field
          label="NOW (public on /card)"
          hint="Only this string appears on the identity HUD. No milestone titles."
        >
          <textarea
            className={`${inputClass} min-h-[4.5rem]`}
            value={form.focusNow}
            onChange={(e) => setFocusNow(e.target.value)}
            required
            maxLength={240}
          />
        </Field>
      </GlassCard>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Milestones
        </h2>
        <button
          type="button"
          onClick={addMilestone}
          className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-slate-300 hover:border-neon-cyan/40 hover:text-white"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add
        </button>
      </div>

      <ul className="space-y-4">
        {form.milestones.map((m, index) => (
          <li key={m.id}>
            <GlassCard className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <Field label="Title">
                  <input
                    className={inputClass}
                    value={m.title}
                    onChange={(e) =>
                      updateMilestone(index, { title: e.target.value })
                    }
                    required
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  className="focus-ring mt-6 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:border-red-400/40 hover:text-red-300"
                  aria-label="Remove milestone"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Track">
                  <select
                    className={inputClass}
                    value={m.track}
                    onChange={(e) =>
                      updateMilestone(index, {
                        track: e.target.value as RoadmapTrack,
                      })
                    }
                  >
                    {TRACKS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    className={inputClass}
                    value={m.status}
                    onChange={(e) =>
                      updateMilestone(index, {
                        status: e.target.value as RoadmapStatus,
                      })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Notes (private)">
                <textarea
                  className={`${inputClass} min-h-[3rem]`}
                  value={m.notes ?? ""}
                  onChange={(e) =>
                    updateMilestone(index, {
                      notes: e.target.value || undefined,
                    })
                  }
                  placeholder="Never published to /card"
                />
              </Field>
            </GlassCard>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-neon-cyan/90 px-5 text-sm font-semibold text-void disabled:opacity-60"
        >
          {status === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : status === "saved" ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : null}
          Save roadmap
        </button>
        {error ? (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        {info ? <p className="text-sm text-slate-400">{info}</p> : null}
      </div>
    </form>
  );
}
