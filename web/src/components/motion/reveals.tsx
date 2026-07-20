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

/**
 * EVERY VALUE IN THESE IS A PERCENTAGE, INCLUDING THE ZEROES, and that is not
 * a style preference — it is the fix for a bug that shipped three sections of
 * blank space.
 *
 * The previous pair was `inset(0 100% 0 0)` -> `inset(0 0 0 0)`. Framer
 * animates a string property like clip-path by pulling the numbers out and
 * rebuilding the string from a TEMPLATE taken from the animate target. That
 * target had no `%` in it anywhere, so every intermediate frame came out as
 * `inset(0 47 0 0)` — a bare number where CSS requires a length. The browser
 * rejects an invalid declaration and keeps the last valid one, which was the
 * fully-clipped initial state. So the animation ran perfectly, at 60fps, and
 * painted nothing but garbage the browser threw away, and the photographs
 * stayed clipped to zero width forever.
 *
 * It survived a fail-safe, a green test suite and an SSR check because none of
 * those look at rendered pixels: the rescue fired correctly, framer started
 * correctly, the markup and the image URLs were all perfect. `reveals.test.tsx`
 * now asserts the unit rule directly, since that is the actual invariant.
 */
const CLIP_OPEN = "inset(0% 0% 0% 0%)";
const CLIP_FROM_START = "inset(0% 100% 0% 0%)";
const CLIP_FROM_END = "inset(0% 0% 0% 100%)";

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
  const from = dir === -1 ? CLIP_FROM_END : CLIP_FROM_START;
  const { ref, play } = useRevealPlay({ clipPath: CLIP_OPEN });

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
