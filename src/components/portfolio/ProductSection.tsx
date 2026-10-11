import { ExternalLink, FolderGit2 } from "lucide-react";
import { products } from "@/content/products";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrollRail, ScrollRailCard } from "@/components/story/ScrollRail";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "./StatusBadge";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function ProductCard({
  index,
}: {
  index: number;
}) {
  const product = products[index];
  if (!product) return null;

  return (
    <article className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-9">
      <p className="story-index absolute right-4 top-2 select-none" aria-hidden>
        {pad(index + 1)}
      </p>
      <div className="shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={product.status} />
          {product.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} tone="neutral">
              {tag}
            </Badge>
          ))}
        </div>
        <h3 className="relative mt-4 font-display text-xl font-semibold leading-tight tracking-tight text-white sm:mt-6 sm:text-3xl">
          {product.name}
        </h3>
      </div>
      <p className="mt-3 min-h-0 shrink text-sm leading-relaxed text-slate-300 sm:mt-4 sm:text-base">
        {product.description}
      </p>
      <div className="mt-auto flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/8 pt-3 text-sm sm:pt-5">
        <a
          href={product.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex min-h-11 items-center gap-1.5 font-medium text-neon-cyan sm:min-h-0"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          Open
        </a>
        <a
          href={product.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex min-h-11 items-center gap-1.5 text-slate-300 transition-colors hover:text-white sm:min-h-0"
        >
          <FolderGit2 className="h-3.5 w-3.5" aria-hidden />
          Code
        </a>
      </div>
    </article>
  );
}

/** Portfolio chapter for installable products. One product stays in the column; two or more use the workshop reel. */
export function ProductSection() {
  if (products.length === 0) return null;

  const header = (
    <ChapterMark
      index="01"
      eyebrow="Products"
      title="Products I ship"
      description="A page or a command a stranger can open."
    />
  );

  if (products.length === 1) {
    return (
      <section id="products" className="scroll-mt-28">
        {header}
        <div className="mt-8 w-[min(40rem,100%)]">
          <ProductCard index={0} />
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="scroll-mt-28">
      <ScrollRail fit length={products.length} header={header}>
        {products.map((product, i) => (
          <ScrollRailCard key={product.id} className="h-full min-h-0">
            <ProductCard index={i} />
          </ScrollRailCard>
        ))}
      </ScrollRail>
    </section>
  );
}
