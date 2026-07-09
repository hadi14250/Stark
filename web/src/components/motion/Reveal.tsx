"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ease, duration } from "@/styles/tokens";
import { useMotionConfig } from "./useMotionConfig";

type RevealProps = {
  children: ReactNode;
  /** Horizontal offset in px (mirrored for RTL). Positive = enters from end side. */
  x?: number;
  /** Vertical offset in px. Direction-agnostic. */
  y?: number;
  /** Delay in seconds (use for staggered groups). */
  delay?: number;
  /** Framer ease name from the token set. */
  easeName?: keyof typeof ease;
  className?: string;
  /** Render as a different element/tag if needed (defaults to div). */
  as?: "div" | "section" | "li" | "span";
};

/**
 * Component-level scroll reveal (Framer Motion). Replaces the demos'
 * data-reveal / data-delay pattern one-to-one.
 *
 * - Reduced motion → renders children in final state, no transform.
 * - RTL → the x offset is mirrored via `dir`, so cards that slide in from the
 *   start edge in English slide from the correct edge in Arabic.
 *
 * Boundary rule: <Reveal> (Framer) owns component reveals. GSAP owns
 * scroll-driven set-pieces. Never animate the same element/property with both.
 */
export function Reveal({
  children,
  x = 0,
  y = 24,
  delay = 0,
  easeName = "wood",
  className,
  as = "div",
}: RevealProps) {
  const { dir, reduce } = useMotionConfig();

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, x: x * dir, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: duration.reveal,
        ease: [...ease[easeName]],
        delay,
      }}
    >
      {children}
    </MotionTag>
  );
}
