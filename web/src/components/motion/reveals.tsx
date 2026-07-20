"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRevealOnce } from "./useRevealOnce";

/**
 * Element-specific scroll reveals: the clip wipe and the two drawn rules.
 *
 * ALL OF THESE RENDER PLAIN DIVS THAT ARE VISIBLE ON THEIR OWN. The only thing
 * scrolling does is add a class, and the class only turns an animation on — the
 * hidden pose lives inside a keyframe's `from` and nowhere else. See reveal.css
 * for the full argument; the short version is that this component wraps the
 * site's photographs, and the previous Framer-driven version left them clipped
 * to zero width whenever anything stopped the animation from completing. That
 * happened twice, for two unrelated reasons, and both times it read as broken
 * images rather than as a stalled animation.
 *
 * RTL and reduced motion are both handled in CSS (`[dir="rtl"]` and a media
 * query) rather than by branching in JS, so they cannot disagree with what is
 * rendered and there is no second code path to keep in sync.
 */

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
  const ref = useRevealOnce<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal-clip ${className ?? ""}`}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}s` }}
    >
      {children}
    </div>
  );
}

/** `draw` — a horizontal divider scales in from its start edge. */
export function DrawLine({
  className,
  style,
  delay = 0,
}: {
  className?: string;
  style?: CSSProperties;
  delay?: number;
}) {
  const ref = useRevealOnce<HTMLDivElement>();

  return (
    <div
      ref={ref}
      aria-hidden
      className={`reveal-line-x ${className ?? ""}`}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}s` }}
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
  const ref = useRevealOnce<HTMLDivElement>();

  return (
    <div
      ref={ref}
      aria-hidden
      className={`reveal-line-y ${className ?? ""}`}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}s` }}
    />
  );
}
