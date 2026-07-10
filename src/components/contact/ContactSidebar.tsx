import Link from "next/link";
import { MapPin, Mail } from "lucide-react";
import type { ResolvedSocial } from "@/lib/profile-store";
import { profile } from "@/content/profile";

interface ContactSidebarProps {
  email: string;
  location: string;
  socials: ResolvedSocial[];
}

export function ContactSidebar({ email, location, socials }: ContactSidebarProps) {
  const externalSocials = socials.filter((s) => !s.href.startsWith("mailto:"));

  return (
    <aside className="flex flex-col gap-8 lg:border-l lg:border-white/8 lg:pl-10">
      <div className="space-y-3">
        <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-neon-violet">
          Direct email
        </h2>
        <a
          href={`mailto:${email}`}
          className="focus-ring inline-flex items-center gap-2 text-base text-white transition-colors hover:text-neon-cyan"
        >
          <Mail className="h-4 w-4 shrink-0 text-neon-cyan" aria-hidden />
          {email}
        </a>
      </div>

      <div className="space-y-3">
        <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-neon-violet">
          Based in
        </h2>
        <div className="space-y-1 text-sm text-slate-300">
          <p className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-neon-cyan" aria-hidden />
            {location}
          </p>
          <p className="text-slate-400">Remote friendly</p>
        </div>
      </div>

      {externalSocials.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-neon-violet">
            Elsewhere
          </h2>
          <ul className="space-y-2">
            {externalSocials.map((social) => (
              <li key={social.label}>
                <Link
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring text-sm text-slate-300 transition-colors hover:text-neon-cyan"
                >
                  {social.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="border-t border-white/8 pt-8 font-display text-base italic leading-relaxed text-slate-400">
        {profile.contactBlurb}
      </p>
    </aside>
  );
}
