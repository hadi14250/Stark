"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { ease } from "@/styles/tokens";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { useRevealPlay } from "@/components/motion/useRevealPlay";

/**
 * Element-specific scroll reveals that the shared <Reveal> (up/left/right/scale)
 * doesn't cover — the handoff's `clip`, `draw`, and `drawy` variants. All three
 * resolve to their final visible state under reduced motion, and mirror their
 * origin for RTL.
 *
 * Timings match the handoff's `.dc.html` (clip 1.5s, draw 1s, drawy 1.1s),
 * easing `cubic-bezier(.22,.7,.2,1)` ≈ our `ease.line`/`ease.zoom`.
 *
 * ALL THREE GET THEIR PLAY SIGNAL FROM `useRevealPlay`, which is not optional
 * decoration. Each of these holds an initial state until told to animate, and
 * a bare `whileInView` has no answer for an observer that never fires — the
 * element simply keeps that initial state forever. These three shipped without
 * it for months without anyone noticing, because none of them was used; the
 * first `ClipReveal` put on a page rendered a grid of photographs clipped to
 * zero width, which reads as broken images rather than as a stalled animation.
 * See useRevealPlay.ts.
 */

const EASE = [...ease.zoom] as [number, number, number, number];

/** `clip` — the element "grows" in from its trailing edge. */
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
  const { ref, play } = useRevealPlay({ clipPath: "inset(0 0 0 0)" });

  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ clipPath: from }}
      {...play}
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
  const { ref, play } = useRevealPlay({ scaleX: 1 });

  if (reduce) {
    return <div className={className} style={style} aria-hidden />;
  }

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={className}
      style={{ ...style, transformOrigin: origin }}
      initial={{ scaleX: 0 }}
      {...play}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1, ease: EASE, delay }}
    />
  );
}

/** `drawy` — a vertical timeline line scales in from the top. */
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
  const { ref, play } = useRevealPlay({ scaleY: 1 });

  if (reduce) {
    return <div className={className} style={style} aria-hidden />;
  }

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={className}
      style={{ ...style, transformOrigin: "top center" }}
      initial={{ scaleY: 0 }}
      {...play}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    />
  );
}
