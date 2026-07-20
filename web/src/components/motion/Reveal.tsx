"use client";

import type { ReactNode } from "react";
import { useRevealOnce } from "./useRevealOnce";

export { isOnScreen } from "./useRevealPlay";

type RevealProps = {
  children: ReactNode;
  /** Horizontal offset in px. Mirrored for RTL by the CSS, not here. */
  x?: number;
  /** Vertical offset in px. Direction-agnostic. */
  y?: number;
  /** Delay in seconds (use for staggered groups). */
  delay?: number;
  /** Scale to enter from. 1 = no scale. */
  scale?: number;
  /** Blur to enter from, in px. 0 = none. */
  blur?: number;
  /**
   * Accepted and ignored. The easing is a single curve in reveal.css now, so
   * that every reveal on the site moves the same way; kept in the signature so
   * existing call sites do not have to change to say nothing.
   */
  easeName?: string;
  className?: string;
  /** Render as a different element/tag if needed (defaults to div). */
  as?: "div" | "section" | "li" | "span";
};

/**
 * The site's general-purpose scroll reveal: a lift and a fade.
 *
 * RENDERS A PLAIN, VISIBLE ELEMENT. Entering the viewport adds a class; the
 * class starts an animation whose `from` is the hidden pose. Nothing here can
 * leave content invisible — see reveal.css for why that is a hard architectural
 * rule on this codebase rather than a preference.
 *
 * The offsets are passed to CSS as custom properties instead of being baked
 * into a transform here, so one keyframe serves every call site.
 */
export function Reveal({
  children,
  x = 0,
  y = 40,
  delay = 0,
  scale = 1,
  blur = 0,
  className,
  as = "div",
}: RevealProps) {
  const ref = useRevealOnce<HTMLElement>({ amount: 0.15 });
  const Tag = as;

  return (
    <Tag
      // One tag union, one ref type; the element is whatever `as` says.
      ref={ref as React.Ref<never>}
      className={`reveal-fade ${className ?? ""}`}
      style={
        {
          "--reveal-delay": `${delay}s`,
          "--reveal-x": `${x}px`,
          "--reveal-y": `${y}px`,
          "--reveal-scale": scale,
          "--reveal-blur": `${blur}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
