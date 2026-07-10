"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30";

const labelClass =
  "font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400";

interface ContactFormProps {
  fallbackEmail: string;
}

export function ContactForm({ fallbackEmail }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          subject,
          message,
          website: honeypot,
        }),
      });

      if (res.ok) {
        setSent(true);
        setName("");
        setEmail("");
        setCompany("");
        setSubject("");
        setMessage("");
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status === 503) {
        setError(
          data.error ??
            "The form isn't wired up yet. Use the direct email in the sidebar.",
        );
      } else {
        setError(data.error ?? "Something went wrong. Try again or email directly.");
      }
    } catch {
      setError("Network error. Try again or email directly.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-4 py-4">
        <CheckCircle2 className="h-10 w-10 text-neon-cyan" aria-hidden />
        <div>
          <p className="text-lg font-semibold text-white">Message sent</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Thanks for reaching out — I&apos;ll reply as soon as I can.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="focus-ring text-sm font-medium text-neon-cyan transition-colors hover:text-white"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">
        Send a message
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="contact-name" className={labelClass}>
            Name <span className="text-neon-cyan">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-email" className={labelClass}>
            Email <span className="text-neon-cyan">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-company" className={labelClass}>
          Company
        </label>
        <input
          id="contact-company"
          type="text"
          autoComplete="organization"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Optional"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-subject" className={labelClass}>
          Subject <span className="text-neon-cyan">*</span>
        </label>
        <input
          id="contact-subject"
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What's this about?"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className={labelClass}>
          Message <span className="text-neon-cyan">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me about the role, the stack, or what you're trying to build…"
          className={`${inputClass} resize-y min-h-[9rem]`}
        />
      </div>

      {/* Honeypot — hidden from humans, bots often fill it */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">
          {error}{" "}
          <a
            href={`mailto:${fallbackEmail}`}
            className="underline decoration-red-400/50 underline-offset-2 hover:text-red-300"
          >
            Email directly
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !name || !email || !subject || !message}
        className="focus-ring group inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-void transition-[transform,opacity] active:scale-[0.98] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            Send message
            <ArrowUpRight className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
