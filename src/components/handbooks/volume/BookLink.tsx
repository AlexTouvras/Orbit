import Link from "next/link";
import type { ReactNode } from "react";

/** Ink link for the volume. Field-card sheets stay full page loads. */
export function BookLink({ href, children }: { href: string; children: ReactNode }) {
  const className = "book-link";
  if (href.endsWith(".html") || href.startsWith("http")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
