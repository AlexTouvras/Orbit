import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Portfolio Open follow-up: flagship system teaser with one enter CTA.
 * Sits directly under the Portfolio title — not a workshop card.
 */
export function FlagshipTeaser() {
  return (
    <section
      id="flagship"
      aria-labelledby="flagship-teaser-title"
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 border-y border-white/10 bg-white/[0.02]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:gap-12 sm:py-14">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-neon-cyan/90">
            Orbit flagship
          </p>
          <h2
            id="flagship-teaser-title"
            className="mt-4 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white"
          >
            Interactive Decision Storytelling
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            A system for turning complex data, AI, analytics, and business
            problems into interactive experiences that help people understand
            and decide — see the mechanism, interrogate the evidence, reach the
            cut.
          </p>
        </div>
        <Link
          href="/stories"
          className="orbit-accent-bg orbit-accent-glow orbit-accent-cta-glow focus-ring group inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-xl px-5 py-3 text-sm font-semibold text-void transition-[transform,box-shadow] active:scale-[0.98] sm:self-end"
        >
          Enter the system
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
