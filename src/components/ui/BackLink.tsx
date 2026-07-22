"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  /** Used when there is no same-origin history (direct link / new tab). */
  fallbackHref: string;
  label?: string;
}

/**
 * Prefer browser back when the previous page was on this site
 * (e.g. Home → Selected work → essay). Otherwise fall through to fallbackHref.
 */
export function BackLink({
  fallbackHref,
  label = "Go back",
}: BackLinkProps) {
  const router = useRouter();

  function onClick() {
    if (typeof window === "undefined") {
      router.push(fallbackHref);
      return;
    }

    const referrer = document.referrer;
    try {
      if (referrer && new URL(referrer).origin === window.location.origin) {
        router.back();
        return;
      }
    } catch {
      // ignore malformed referrer
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring group inline-flex min-h-11 items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
    >
      <ArrowLeft className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-x-0.5" />
      {label}
    </button>
  );
}
