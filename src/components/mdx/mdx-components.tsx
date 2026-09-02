import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import Link from "next/link";
import { isValidElement } from "react";
import { ArcStatusCardDemo } from "@/components/mdx/ArcStatusCardDemo";
import { MermaidDiagram } from "@/components/mdx/MermaidDiagram";

function extractMermaidSource(children: ReactNode): string | null {
  if (!isValidElement(children)) return null;
  const props = children.props as { className?: string; children?: ReactNode };
  const className = props.className ?? "";
  if (!className.includes("language-mermaid")) return null;
  const inner = props.children;
  if (typeof inner === "string") return inner;
  if (Array.isArray(inner)) return inner.join("");
  return inner != null ? String(inner) : null;
}

function Pre({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"pre"> & { children?: ReactNode }) {
  const chart = extractMermaidSource(children);
  if (chart) return <MermaidDiagram chart={chart} />;
  return (
    <pre
      className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm text-slate-200"
      {...props}
    >
      {children}
    </pre>
  );
}

export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      className="mt-10 mb-3 text-2xl font-bold tracking-tight text-white"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 mb-2 text-xl font-semibold tracking-tight text-white"
      {...props}
    />
  ),
  p: (props) => (
    <p className="my-4 leading-relaxed text-slate-300" {...props} />
  ),
  ul: (props) => (
    <ul className="my-4 list-disc space-y-2 pl-5 text-slate-300" {...props} />
  ),
  ol: (props) => (
    <ol className="my-4 list-decimal space-y-2 pl-5 text-slate-300" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  strong: (props) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  a: ({ href = "#", ...props }) => (
    <Link
      href={href}
      className="text-neon-cyan underline-offset-4 hover:underline"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="my-6 border-l-2 border-neon-cyan/50 pl-4 italic text-slate-400"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-neon-cyan"
      {...props}
    />
  ),
  pre: Pre,
  Mermaid: ({ chart, children }: { chart?: string; children?: ReactNode }) => (
    <MermaidDiagram chart={chart ?? String(children ?? "")} />
  ),
  hr: () => <hr className="my-8 border-white/10" />,
  table: (props) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[28rem] border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-white/[0.04]" {...props} />,
  tbody: (props) => <tbody {...props} />,
  tr: (props) => <tr className="border-b border-white/10 last:border-0" {...props} />,
  th: (props) => (
    <th
      className="px-4 py-2.5 text-left font-semibold text-white first:rounded-tl-xl last:rounded-tr-xl"
      {...props}
    />
  ),
  td: (props) => (
    <td className="px-4 py-2.5 align-top leading-relaxed text-slate-300" {...props} />
  ),
  ArcStatusCardDemo,
};
