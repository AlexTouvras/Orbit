"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Check } from "lucide-react";
import type { EditableProfile } from "@/lib/profile-store";
import { GlassCard } from "@/components/ui/GlassCard";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export function ProfileEditor({ initial }: { initial: EditableProfile }) {
  const router = useRouter();
  const [form, setForm] = useState<EditableProfile>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof EditableProfile>(key: K, value: EditableProfile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setStatus("idle");
  }

  function updateSocial(index: number, key: "label" | "href", value: string) {
    setForm((f) => ({
      ...f,
      socials: f.socials.map((s, i) =>
        i === index ? { ...s, [key]: value } : s,
      ),
    }));
    setStatus("idle");
  }

  function addSocial() {
    setForm((f) => ({ ...f, socials: [...f.socials, { label: "", href: "" }] }));
  }

  function removeSocial(index: number) {
    setForm((f) => ({
      ...f,
      socials: f.socials.filter((_, i) => i !== index),
    }));
  }

  async function onSave() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/studio/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? null);
        setStatus("saved");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Save failed.");
      setStatus("error");
    } catch {
      setError("Network error.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="mb-4 text-sm font-mono uppercase tracking-[0.2em] text-slate-500">
          Identity
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="Handle">
            <input
              className={inputClass}
              value={form.handle}
              onChange={(e) => set("handle", e.target.value)}
            />
          </Field>
          <Field label="Role">
            <input
              className={inputClass}
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            />
          </Field>
          <Field label="Location">
            <input
              className={inputClass}
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
          <Field label="GitHub username">
            <input
              className={inputClass}
              value={form.githubUsername}
              onChange={(e) => set("githubUsername", e.target.value)}
            />
          </Field>
          <Field label="GitHub repo allowlist">
            <textarea
              className={`${inputClass} min-h-16 resize-y font-mono text-xs`}
              value={form.githubRepoAllowlist.join("\n")}
              onChange={(e) =>
                set(
                  "githubRepoAllowlist",
                  e.target.value
                    .split(/[\n,]+/)
                    .map((n) => n.trim())
                    .filter(Boolean),
                )
              }
              placeholder={"one-repo-per-line\npowerbi-portfolio"}
              spellCheck={false}
            />
          </Field>
          <Field label="Email">
            <input
              className={inputClass}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Resume URL">
            <input
              className={inputClass}
              value={form.resumeUrl}
              onChange={(e) => set("resumeUrl", e.target.value)}
            />
          </Field>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Repo allowlist: only these public repos appear on Portfolio. Leave
          empty to show the newest non-fork repos.
        </p>

        <div className="mt-4 space-y-4">
          <Field label="Tagline">
            <textarea
              className={`${inputClass} min-h-20 resize-y`}
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
            />
          </Field>
          <Field label="Summary">
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
            />
          </Field>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-slate-500">
            Social links
          </h2>
          <button
            type="button"
            onClick={addSocial}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-neon-cyan/50 hover:text-neon-cyan"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {form.socials.map((social, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={`${inputClass} sm:w-40`}
                placeholder="Label (e.g. GitHub)"
                value={social.label}
                onChange={(e) => updateSocial(i, "label", e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="https://…"
                value={social.href}
                onChange={(e) => updateSocial(i, "href", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeSocial(i)}
                aria-label="Remove"
                className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-400 transition-colors hover:border-red-500/40 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {form.socials.length === 0 && (
            <p className="text-sm text-slate-500">No social links yet.</p>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Known labels (GitHub, LinkedIn, X, Email) get matching icons; others
          use a globe.
        </p>
      </GlassCard>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={status === "saving"}
          className="inline-flex items-center gap-2 rounded-xl bg-neon-cyan px-5 py-3 text-sm font-semibold text-void transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "saved" && <Check className="h-4 w-4" />}
          {status === "saving"
            ? "Saving…"
            : status === "saved"
              ? "Saved"
              : "Save changes"}
        </button>
        {status === "error" && error && (
          <span className="text-sm text-red-400">{error}</span>
        )}
        {status === "saved" && (
          <span className="text-sm text-slate-400">
            Live site updated.
          </span>
        )}
      </div>
    </div>
  );
}
