import type { Metadata } from "next";
import Link from "next/link";
import { getEditableProfile } from "@/lib/profile-store";
import { isNewsletterTestMode } from "@/lib/newsletter/config";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { NewsletterHero } from "@/components/newsletter/NewsletterHero";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Orbit weekly digest: this week's Write, a few Related articles, and one highlight from each Ravens beat.",
  alternates: { canonical: "/newsletter" },
};

export default function NewsletterPage() {
  const profile = getEditableProfile();
  const testing = isNewsletterTestMode();

  return (
    <div className="space-y-16 sm:space-y-20">
      <NewsletterHero avatarUrl={profile.avatarUrl} />

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <GlassCard>
          {testing ? (
            <div className="space-y-3">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                Private test
              </p>
              <p className="text-lg font-semibold text-white">
                Subscribe is closed while I test the digest
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                Tuesday&apos;s roundup currently mails only me. Public subscribe
                opens when I drop the test-to address.
              </p>
            </div>
          ) : (
            <NewsletterForm />
          )}
        </GlassCard>

        <div className="space-y-8">
          <SectionHeading
            eyebrow="What you get"
            title="A roundup, not a new essay"
            description="Writes stay one-question posts on the Blog. This is the short version: titles, a line of context, and links."
          />
          <ul className="space-y-3 text-sm leading-relaxed text-slate-300">
            <li>
              <Link href="/writes" className="text-neon-cyan hover:underline">
                Writes
              </Link>{" "}
              published in the last seven days
            </li>
            <li>
              Four{" "}
              <Link href="/radar" className="text-neon-cyan hover:underline">
                Related articles
              </Link>
              , balanced across Analytics, Data, Delivery, and AI
            </li>
            <li>
              One Ravens highlight per beat that moved this week (AI, data,
              career, food, fitness, finance, content, parenting, security)
            </li>
            <li>Tuesday cadence, after Monday&apos;s Write has time to ship</li>
            <li>
              Prefer RSS?{" "}
              <a href="/feed.xml" className="text-neon-cyan hover:underline">
                /feed.xml
              </a>{" "}
              is the Blog feed (essays, not this digest)
            </li>
          </ul>
        </div>
      </section>

      <section className="max-w-2xl">
        <SectionHeading eyebrow="Privacy" title="What I keep, and for how long" />
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-300">
          <p>
            <strong className="font-medium text-white">{profile.name}</strong>{" "}
            sends this digest from Orbit ({profile.email}). The only personal
            data is your email address, stored with Resend as the list of
            record — never committed to git.
          </p>
          <p>
            Lawful basis is consent. Confirming the email is how you opt in.
            You stay on the list until you unsubscribe (every send includes a
            link). No open tracking, no segments, no selling the list.
          </p>
        </div>
      </section>
    </div>
  );
}
