/** Server-safe session border accent from Arc icon id (no "use client"). */
export function arcDayAccent(icon: string | null | undefined): string {
  switch (icon) {
    case "boss":
      return "border-l-red-500/60";
    case "gate":
      return "border-l-neon-cyan/50";
    case "forge":
      return "border-l-violet-500/50";
    case "quest":
      return "border-l-amber-500/40";
    case "patrol":
      return "border-l-slate-500/40";
    case "scout":
      return "border-l-blue-500/35";
    default:
      return "border-l-white/10";
  }
}
