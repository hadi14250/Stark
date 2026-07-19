"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { ease } from "@/styles/tokens";
import { useMotionConfig } from "@/components/motion/useMotionConfig";

/**
 * Element-specific scroll reveals that the shared <Reveal> (up/left/right/scale)
 * doesn't cover — the handoff's `clip`, `draw`, and `drawy` variants. Same
 * boundary rule as <Reveal>: Framer owns component reveals; GSAP owns
 * scroll-driven set-pieces. All three resolve to their final visible state under
 * reduced motion, and mirror their origin for RTL.
 *
 * Timings match the handoff's `.dc.html` (clip 1.5s, draw 1s, drawy 1.1s),
 * easing `cubic-bezier(.22,.7,.2,1)` ≈ our `ease.line`/`ease.zoom`.
 */

const EASE = [...ease.zoom] as [number, number, number, number];

/** `clip` — the hero branch "grows" in from its trailing edge. */
export function ClipReveal({
  children,
  className,
  style,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
}) {
  const { dir, reduce } = useMotionConfig();
  // LTR grows left→right (reveal from the right edge); RTL mirrors.
  const from = dir === -1 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";

  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ clipPath: from }}
      whileInView={{ clipPath: "inset(0 0 0 0)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** `draw` — a horizontal divider/line scales in from its start edge. */
export function DrawLine({
  className,
  style,
  delay = 0,
}: {
  className?: string;
  style?: CSSProperties;
  delay?: number;
}) {
  const { dir, reduce } = useMotionConfig();
  const origin = dir === -1 ? "right center" : "left center";

  if (reduce) {
    return <div className={className} style={style} aria-hidden />;
  }

  return (
    <motion.div
      aria-hidden
      className={className}
      style={{ ...style, transformOrigin: origin }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1, ease: EASE, delay }}
    />
  );
}

/** `drawy` — a vertical timeline line scales in from the top (mobile process). */
export function DrawLineY({
  className,
  style,
  delay = 0,
}: {
  className?: string;
  style?: CSSProperties;
  delay?: number;
}) {
  const { reduce } = useMotionConfig();

  if (reduce) {
    return <div className={className} style={style} aria-hidden />;
  }

  return (
    <motion.div
      aria-hidden
      className={className}
      style={{ ...style, transformOrigin: "top center" }}
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    />
  );
}
