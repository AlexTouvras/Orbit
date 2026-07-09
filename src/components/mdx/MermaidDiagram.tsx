"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const MERMAID_CONFIG = {
  startOnLoad: false,
  securityLevel: "strict" as const,
  theme: "base" as const,
  themeVariables: {
    darkMode: "true",
    background: "#05060f",
    primaryColor: "#0c0f24",
    primaryTextColor: "#e2e8f0",
    primaryBorderColor: "#22d3ee",
    secondaryColor: "#080a18",
    tertiaryColor: "#05060f",
    lineColor: "#64748b",
    textColor: "#e2e8f0",
    mainBkg: "#0c0f24",
    nodeBorder: "#22d3ee",
    clusterBkg: "#080a18",
    titleColor: "#e2e8f0",
    edgeLabelBackground: "#05060f",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  },
  flowchart: {
    htmlLabels: true,
    curve: "basis" as const,
  },
};

export function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    let cancelled = false;
    const source = chart.trim();
    if (!source) return;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize(MERMAID_CONFIG);
        const { svg } = await mermaid.render(`mermaid-${id}`, source);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Diagram failed to render");
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="my-8 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
        <p className="font-mono text-xs text-rose-300">Mermaid render error: {error}</p>
        <pre className="mt-3 overflow-x-auto font-mono text-xs text-slate-400">{chart}</pre>
      </div>
    );
  }

  return (
    <figure className="my-8 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4">
      <div
        ref={containerRef}
        className={`mermaid flex justify-center [&_svg]:max-w-full ${reduced ? "" : "motion-safe:[&_svg]:transition-opacity"}`}
        aria-label="Architecture diagram"
      />
    </figure>
  );
}
