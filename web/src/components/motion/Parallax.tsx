"use client";

import type { CSSProperties, ReactNode } from "react";
import { useGsap } from "./useGsap";

/**
 * Scroll-linked vertical parallax for a decorative layer.
 *
 * NOT a port of the handoff's loop. That one read `getBoundingClientRect()` on
 * the same element it then translated, so each frame measured a position it had
 * itself displaced — the realised factor is `f/(1+f)`, not `f`. (At the
 * handoff's `data-plx="0.12"` the actual travel is ~0.107.) ScrollTrigger
 * measures against a transform-independent baseline, batches its reads and
 * writes, and handles RTL, so the `factor` here means what it says.
 *
 * Reduced motion: `useGsap` never runs setup, so the layer simply sits still.
 */
export function Parallax({
  children,
  /** Fraction of the scrolled distance to travel. Negative moves against. */
  factor = 0.12,
  className,
  style,
}: {
  children: ReactNode;
  factor?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const scope = useGsap(({ gsap, ScrollTrigger }) => {
    const el = scope.current?.firstElementChild;
    if (!el) return;
    gsap.to(el, {
      yPercent: factor * 100,
      ease: "none",
      scrollTrigger: {
        trigger: scope.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    ScrollTrigger.refresh();
  });

  return (
    <div ref={scope} className={className} style={style} aria-hidden>
      <div>{children}</div>
    </div>
  );
}
