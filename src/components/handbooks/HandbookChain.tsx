import { ArrowDown } from "lucide-react";
import { CHAIN_LINKS, type ChainLinkId } from "@/content/handbooks";
import { cn } from "@/lib/utils";

export function HandbookChain({
  lead,
  support,
}: {
  lead: ChainLinkId;
  support?: ChainLinkId;
}) {
  return (
    <ol className="mt-8 max-w-md space-y-2" aria-label="The chain">
      {CHAIN_LINKS.map((link, index) => {
        const role =
          link.id === lead ? "Leading" : link.id === support ? "Supporting" : null;
        return (
          <li key={link.id}>
            {index > 0 ? (
              <div className="flex justify-center py-1 text-slate-500" aria-hidden>
                <ArrowDown className="h-4 w-4" />
              </div>
            ) : null}
            <div
              className={cn(
                "rounded-xl border px-4 py-3",
                role === "Leading" && "border-neon-cyan/50 bg-neon-cyan/10",
                role === "Supporting" && "border-white/25 bg-white/5",
                !role && "border-white/10 bg-white/[0.03]",
              )}
            >
              {role ? (
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                  {role}
                </p>
              ) : (
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-600">
                  Link
                </p>
              )}
              <p className="mt-1 font-display text-lg font-semibold text-white">
                {link.label}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
