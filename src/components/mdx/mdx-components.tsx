import type { MDXComponents } from "mdx/types";
import Link from "next/link";

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
  pre: (props) => (
    <pre
      className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm text-slate-200"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-white/10" />,
};
