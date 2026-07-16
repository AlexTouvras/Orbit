"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-neon-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/40";

const inputErrorClass =
  "border-red-400/50 focus:border-red-400/60 focus-visible:ring-red-400/30";

const labelClass =
  "font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400";

interface ContactFormProps {
  fallbackEmail: string;
}

type FieldErrors = Partial<
  Record<"name" | "email" | "subject" | "message", string>
>;

export function ContactForm({ fallbackEmail }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (!email.trim()) next.email = "Enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!subject.trim()) next.subject = "Add a subject.";
    if (!message.trim()) next.message = "Write a short message.";
    return next;
  }

  function focusFirstError(errors: FieldErrors) {
    if (errors.name) nameRef.current?.focus();
    else if (errors.email) emailRef.current?.focus();
    else if (errors.subject) subjectRef.current?.focus();
    else if (errors.message) messageRef.current?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      focusFirstError(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          subject: subject.trim(),
          message: message.trim(),
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
        setFieldErrors({});
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
    <form onSubmit={onSubmit} className="relative space-y-6" noValidate>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">
        Send a message
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="contact-name" className={labelClass}>
            Name <span className="text-neon-cyan">*</span>
          </label>
          <input
            ref={nameRef}
            id="contact-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) {
                setFieldErrors((f) => ({ ...f, name: undefined }));
              }
            }}
            placeholder="Your name…"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
            className={`${inputClass} ${fieldErrors.name ? inputErrorClass : ""}`}
          />
          {fieldErrors.name && (
            <p id="contact-name-error" className="text-xs text-red-400">
              {fieldErrors.name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-email" className={labelClass}>
            Email <span className="text-neon-cyan">*</span>
          </label>
          <input
            ref={emailRef}
            id="contact-email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((f) => ({ ...f, email: undefined }));
              }
            }}
            placeholder="you@company.com…"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
            className={`${inputClass} ${fieldErrors.email ? inputErrorClass : ""}`}
          />
          {fieldErrors.email && (
            <p id="contact-email-error" className="text-xs text-red-400">
              {fieldErrors.email}
            </p>
          )}
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
          placeholder="Optional…"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-subject" className={labelClass}>
          Subject <span className="text-neon-cyan">*</span>
        </label>
        <input
          ref={subjectRef}
          id="contact-subject"
          type="text"
          autoComplete="off"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            if (fieldErrors.subject) {
              setFieldErrors((f) => ({ ...f, subject: undefined }));
            }
          }}
          placeholder="What's this about?…"
          aria-invalid={Boolean(fieldErrors.subject)}
          aria-describedby={
            fieldErrors.subject ? "contact-subject-error" : undefined
          }
          className={`${inputClass} ${fieldErrors.subject ? inputErrorClass : ""}`}
        />
        {fieldErrors.subject && (
          <p id="contact-subject-error" className="text-xs text-red-400">
            {fieldErrors.subject}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className={labelClass}>
          Message <span className="text-neon-cyan">*</span>
        </label>
        <textarea
          ref={messageRef}
          id="contact-message"
          rows={6}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (fieldErrors.message) {
              setFieldErrors((f) => ({ ...f, message: undefined }));
            }
          }}
          placeholder="Tell me about the role, the stack, or what you're trying to build…"
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={
            fieldErrors.message ? "contact-message-error" : undefined
          }
          className={`${inputClass} min-h-[9rem] resize-y ${fieldErrors.message ? inputErrorClass : ""}`}
        />
        {fieldErrors.message && (
          <p id="contact-message-error" className="text-xs text-red-400">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Honeypot — hidden from humans and assistive tech */}
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
        disabled={loading}
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
