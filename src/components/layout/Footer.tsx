import Link from "next/link";
import { getEditableProfile, getResolvedSocials } from "@/lib/profile-store";

export function Footer() {
  const profile = getEditableProfile();
  const socials = getResolvedSocials();
  return (
    <footer className="relative z-10 mt-24 border-t border-white/5">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-mono text-sm tracking-widest text-slate-300">
            ORBIT<span className="text-neon-cyan">.</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {profile.name}. Built with Next.js,
            Tailwind &amp; Framer Motion.
          </p>
          <Link
            href="/newsletter"
            className="focus-ring mt-3 inline-flex min-h-11 items-center text-xs font-medium text-slate-400 transition-colors hover:text-neon-cyan sm:min-h-0"
          >
            Weekly digest
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {socials.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-neon-cyan"
            >
              <social.icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
