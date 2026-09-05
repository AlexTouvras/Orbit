"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import type {
  FitnessCourseView,
  LiftIntent,
  LiftStyle,
  RaceEffort,
} from "@/lib/week-log/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "min-h-12 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30 disabled:cursor-not-allowed disabled:opacity-50";

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
    <label className="block min-w-0">
      <span className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function CourseStrip({ initial }: { initial: FitnessCourseView }) {
  const router = useRouter();
  const [timeEfficient, setTimeEfficient] = useState(initial.timeEfficient);
  const [raceDate, setRaceDate] = useState(initial.raceDate ?? "");
  const [raceEffort, setRaceEffort] = useState<RaceEffort>(initial.raceEffort);
  const [liftIntent, setLiftIntent] = useState<LiftIntent>(initial.liftIntent);
  const [liftStyle, setLiftStyle] = useState<LiftStyle>(initial.liftStyle);
  const [gtgOptional, setGtgOptional] = useState(initial.gtgOptional);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const preview = useMemo(() => {
    const stamp = raceDate || null;
    let phase = "open";
    let expired = false;
    let days: number | null = null;
    if (stamp) {
      const [y, m, d] = stamp.split("-").map(Number);
      const event = Date.UTC(y, m - 1, d);
      const now = new Date();
      const start = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      days = Math.round((event - start) / 86_400_000);
      if (days < 0) {
        expired = true;
        phase = "open";
      } else if (days <= 7) phase = "taper";
      else if (days <= 21) phase = "sharpen";
      else phase = "build";
    }
    const future = Boolean(stamp) && !expired;
    return { phase, expired, days, future };
  }, [raceDate]);

  const hypertrophyBlocked =
    liftIntent === "hypertrophy" &&
    (timeEfficient ||
      (preview.future && raceEffort === "peak") ||
      preview.phase === "sharpen" ||
      preview.phase === "taper");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/studio/week/fitness/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeEfficient,
          raceDate: raceDate || null,
          raceEffort,
          liftIntent,
          liftStyle,
          gtgOptional,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        warnings?: string[];
      };
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Could not apply course.");
        return;
      }
      setStatus("saved");
      const extra = data.warnings?.length ? ` ${data.warnings.join(" ")}` : "";
      setInfo(`${data.message ?? "Saved."}${extra}`);
      router.refresh();
    } catch {
      setStatus("error");
      setError("Network error.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
          Course
        </p>
        <p className="text-xs text-slate-500">
          {preview.expired
            ? "Expired — set the next race or leave empty"
            : preview.future
              ? `${preview.phase} · ${preview.days} day${preview.days === 1 ? "" : "s"} out`
              : "Open block — no A-race"}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Life window">
          <select
            className={fieldClass}
            value={timeEfficient ? "short" : "full"}
            onChange={(e) => setTimeEfficient(e.target.value === "short")}
          >
            <option value="full">Full week</option>
            <option value="short">Short windows</option>
          </select>
        </Field>

        <Field
          label="Event date"
          hint={preview.expired ? "This date has passed. Pick the next race or clear it." : undefined}
        >
          <input
            type="date"
            className={fieldClass}
            value={raceDate}
            onChange={(e) => setRaceDate(e.target.value)}
          />
        </Field>

        <Field
          label="Race stance"
          hint={preview.future ? undefined : "Shown once a future date is set."}
        >
          <select
            className={fieldClass}
            value={raceEffort}
            disabled={!preview.future}
            onChange={(e) => setRaceEffort(e.target.value as RaceEffort)}
          >
            <option value="peak">Peak</option>
            <option value="test">Test</option>
            <option value="skip">Skip</option>
          </select>
        </Field>

        <Field label="Lift intent">
          <select
            className={fieldClass}
            value={liftIntent}
            onChange={(e) => setLiftIntent(e.target.value as LiftIntent)}
          >
            <option value="maintenance">Maintain</option>
            <option value="strength">Strength</option>
            <option value="hypertrophy">Hypertrophy</option>
          </select>
        </Field>

        <Field label="Lift density">
          <select
            className={fieldClass}
            value={liftStyle}
            onChange={(e) => setLiftStyle(e.target.value as LiftStyle)}
          >
            <option value="simplified">Focus (2 mains)</option>
            <option value="standard">Standard (~4)</option>
            <option value="full">Full template</option>
          </select>
        </Field>

        <Field label="Sunday extras">
          <select
            className={fieldClass}
            value={gtgOptional ? "gtg" : "rest"}
            onChange={(e) => setGtgOptional(e.target.value === "gtg")}
          >
            <option value="rest">Rest</option>
            <option value="gtg">Grease-the-groove</option>
          </select>
        </Field>
      </div>

      {hypertrophyBlocked ? (
        <p className="mt-3 text-sm text-amber-200/90">
          Hypertrophy is blocked with Short windows, a Peak race, or during
          sharpen/taper. Apply will refuse it.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className={cn(
            "inline-flex min-h-12 items-center gap-2 rounded-lg bg-neon-cyan px-4 text-sm font-medium text-slate-950",
            "transition-transform duration-150 ease-out hover:brightness-110 active:scale-[0.97]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
            "disabled:cursor-wait disabled:opacity-70",
          )}
        >
          {status === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "saved" ? (
            <Check className="h-4 w-4" />
          ) : null}
          Apply to this week
        </button>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {info ? <p className="text-sm text-slate-300">{info}</p> : null}
      </div>
    </form>
  );
}
