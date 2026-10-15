import type { HandbookMark } from "@/content/handbooks";

const CYAN = "#67e8f9";
const RED = "#fb7185";

export function IconPaths({
  name,
  tone = "cyan",
}: {
  name?: HandbookMark;
  tone?: "cyan" | "red" | "ok" | "pass" | "ink";
}) {
  const stroke =
    tone === "red" ? RED : tone === "pass" ? "#34d399" : tone === "ink" ? "#052e16" : tone === "ok" ? "#5eead4" : CYAN;
  const props = {
    fill: "none",
    stroke,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "code") return <path d="M8 8 4 12l4 4M16 8l4 4-4 4M13 6l-2 12" {...props} />;
  if (name === "gear") {
    return (
      <path
        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-4.5.7 2.2a6 6 0 0 1 2.1.9l2.1-1 1.5 2.6-1.6 1.6a6 6 0 0 1 0 2.4l1.6 1.6-1.5 2.6-2.1-1a6 6 0 0 1-2.1.9L12 20l-.7-2.2a6 6 0 0 1-2.1-.9l-2.1 1-1.5-2.6 1.6-1.6a6 6 0 0 1 0-2.4L5.6 9.7 7.1 7.1l2.1 1a6 6 0 0 1 2.1-.9L12 4Z"
        {...props}
      />
    );
  }
  if (name === "check") return <path d="m5 12 5 5L20 7" {...props} />;
  if (name === "merge") {
    return (
      <>
        <circle cx="7" cy="6" r="2" {...props} />
        <circle cx="17" cy="18" r="2" {...props} />
        <path d="M7 8v4a6 6 0 0 0 6 6h2" {...props} />
      </>
    );
  }
  if (name === "pulse") return <path d="M3 12h4l2-5 4 10 2-5h6" {...props} />;
  if (name === "refresh") return <path d="M20 12a8 8 0 1 1-2.2-5.5M20 4v5h-5" {...props} />;
  if (name === "alert") return <path d="M12 4 4 19h16L12 4Zm0 6v4" {...props} />;
  if (name === "cross") return <path d="M6 6l12 12M18 6 6 18" {...props} />;
  if (name === "pause") return <path d="M9 6v12M15 6v12" {...props} />;
  if (name === "search") return <path d="m16 16 4 4M11 17a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z" {...props} />;
  if (name === "wrench") return <path d="M14 7a4 4 0 0 0-5 5L4 17l3 3 5-5a4 4 0 0 0 5-5l-3 3-2-2 2-3Z" {...props} />;
  if (name === "play") return <path d="m8 6 10 6-10 6V6Z" {...props} />;
  if (name === "clock") return <path d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" {...props} />;
  if (name === "bolt") return <path d="m13 3-8 10h6l-1 8 8-10h-6l1-8Z" {...props} />;
  if (name === "shield") return <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" {...props} />;
  if (name === "flag") return <path d="M6 4v16M6 5h10l-2 3 2 3H6" {...props} />;
  return <circle cx="12" cy="12" r="3" {...props} />;
}
