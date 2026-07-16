"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

/** Fades/slides content in when it scrolls into view. Visible on SSR. */
export function Reveal({ children, className, delay = 0, once = true }: RevealProps) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();

  if (!hydrated || reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** Wrap a list; direct <StaggerItem> children animate in sequence. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();

  if (!hydrated || reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

/** A single staggered child. Use inside <Stagger>. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();

  if (!hydrated || reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
