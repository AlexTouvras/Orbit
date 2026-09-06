import Link from "next/link";
import { fitnessSheetHref } from "@/lib/week-log/topics";

export function FitnessSheetNav({
  weekId,
  active,
}: {
  weekId: string;
  active: "status" | "codex";
}) {
  const sheets = [
    { id: "status" as const, label: "Status", hint: "This week's HUD and plan" },
    { id: "codex" as const, label: "Codex", hint: "Long-term native units" },
  ];
  return (
    <nav aria-label="Fitness sheets" className="mb-6 flex gap-2">
      {sheets.map((sheet) => {
        const selected = active === sheet.id;
        return (
          <Link
            key={sheet.id}
            href={fitnessSheetHref(sheet.id, weekId)}
            className={
              selected
                ? "rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 px-3 py-1.5 text-sm text-neon-cyan"
                : "rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:border-white/30 hover:text-white"
            }
            title={sheet.hint}
          >
            {sheet.label}
          </Link>
        );
      })}
    </nav>
  );
}
