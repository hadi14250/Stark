"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ease, duration } from "@/styles/tokens";
import { useMotionConfig } from "./useMotionConfig";
import { useRevealPlay } from "./useRevealPlay";

// The gate + fail-safe that used to live here are now in useRevealPlay, shared
// with ClipReveal/DrawLine/DrawLineY — which had gone without them and shipped
// a section of photographs clipped to zero width. Re-exported because
// Reveal.test.tsx pins the fail-safe's rule directly.
export { isOnScreen } from "./useRevealPlay";

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
  /** Scale to enter from. 1 = no scale. */
  scale?: number;
  /** Blur to enter from, in px. 0 = none. */
  blur?: number;
  className?: string;
  /** Render as a different element/tag if needed (defaults to div). */
  as?: "div" | "section" | "li" | "span";
};

/**
 * Component-level scroll reveal (Framer Motion).
 *
 * - Reduced motion → renders children in final state, no transform.
 * - RTL → the x offset is mirrored via `dir`, so cards that slide in from the
 *   start edge in English slide from the correct edge in Arabic.
 *
 * Boundary rule: <Reveal> (Framer) owns component reveals. CSS owns ambient
 * loops. Never animate the same element/property with both.
 */
export function Reveal({
  children,
  x = 0,
  y = 40,
  delay = 0,
  easeName = "zoom",
  scale = 1,
  blur = 0,
  className,
  as = "div",
}: RevealProps) {
  const { dir, reduce } = useMotionConfig();
  const shown = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  };
  const { ref, play } = useRevealPlay(shown);

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];

  return (
    <MotionTag
      // @ts-expect-error — motion's per-tag ref types don't unify across the
      // `as` union; the element is whatever `as` says and the rect read is safe.
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        x: x * dir,
        y,
        scale,
        filter: blur ? `blur(${blur}px)` : "blur(0px)",
      }}
      {...play}
      // -12% bottom margin: fire when the element is properly into the
      // viewport rather than the instant its first pixel appears, so the
      // motion is seen rather than finishing off-screen.
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -12% 0px" }}
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
