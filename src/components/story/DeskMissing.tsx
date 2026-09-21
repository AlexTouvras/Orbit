import { BackLink } from "@/components/ui/BackLink";
import { DeskStoryHeader } from "@/components/story/DeskStoryHeader";

export function DeskMissing({
  question,
  command,
}: {
  question: string;
  command: string;
}) {
  return (
    <article className="space-y-6">
      <BackLink fallbackHref="/portfolio/live" label="Live dashboards" />
      <DeskStoryHeader question={question} kicker="Snapshot missing" />
      <p className="max-w-xl text-slate-300">
        No snapshot on disk. Run{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-neon-cyan">
          {command}
        </code>{" "}
        then reload.
      </p>
    </article>
  );
}
