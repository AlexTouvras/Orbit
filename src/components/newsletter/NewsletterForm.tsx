"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-neon-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/40";

const inputErrorClass =
  "border-red-400/50 focus:border-red-400/60 focus-visible:ring-red-400/30";

const labelClass =
  "font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400";

interface NewsletterFormProps {
  variant?: "page" | "compact";
  className?: string;
}

export function NewsletterForm({
  variant = "page",
  className,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const compact = variant === "compact";
  const fieldId = compact ? "newsletter-email-compact" : "newsletter-email";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Enter your email.");
      emailRef.current?.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }
    setEmailError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, website: honeypot }),
      });

      if (res.ok) {
        setSent(true);
        setEmail("");
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 503) {
        setError(
          data.error ??
            "The digest isn't wired up yet. Check back after Resend is configured.",
        );
      } else {
        setError(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className={cn("flex flex-col items-start gap-3", className)}>
        <CheckCircle2 className="h-8 w-8 text-neon-cyan" aria-hidden />
        <div>
          <p className="text-lg font-semibold text-white">Check your inbox</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            Confirm the email to join the list. Nothing is sent until you click
            that link.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="focus-ring text-sm font-medium text-neon-cyan transition-colors hover:text-white"
        >
          Use a different address
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(compact ? "space-y-3" : "space-y-5", className)}
      noValidate
    >
      {!compact && (
        <p className={labelClass}>Subscribe</p>
      )}

      <div className={cn(compact ? "flex flex-col gap-3 sm:flex-row sm:items-end" : "space-y-2")}>
        <div className={cn("space-y-2", compact && "min-w-0 flex-1")}>
          <label htmlFor={fieldId} className={labelClass}>
            Email <span className="text-neon-cyan">*</span>
          </label>
          <input
            ref={emailRef}
            id={fieldId}
            type="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            placeholder="you@company.com…"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? `${fieldId}-error` : undefined}
            className={`${inputClass} ${emailError ? inputErrorClass : ""}`}
          />
          {emailError && (
            <p id={`${fieldId}-error`} className="text-xs text-red-400">
              {emailError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="focus-ring group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-void transition-[transform,opacity] active:scale-[0.98] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              {compact ? "Subscribe" : "Send confirmation"}
              <ArrowUpRight className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs leading-relaxed text-slate-500">
        One email a week. Confirm to join. Unsubscribe anytime. Email is stored
        with Resend, not in this repo.
      </p>
    </form>
  );
}
