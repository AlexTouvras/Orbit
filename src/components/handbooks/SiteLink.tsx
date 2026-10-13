import Link from "next/link";
import type { ReactNode } from "react";

const className =
  "focus-ring text-neon-cyan underline-offset-4 hover:underline";

/** Field-card sheets are static HTML. Client navigation leaves them half-loaded. */
export function SiteLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
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
