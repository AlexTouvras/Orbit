import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  as: Tag = "div",
  hover = false,
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        "glass rounded-2xl p-6",
        hover && "glass-hover cursor-pointer",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
