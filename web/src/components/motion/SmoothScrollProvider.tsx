"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Owns Lenis smooth-scroll and syncs it with GSAP ScrollTrigger.
 *
 * The four things this gets right (each a common failure):
 *  1. Single RAF loop — Lenis is driven off gsap.ticker (seconds→ms), so there
 *     is no second requestAnimationFrame competing with GSAP.
 *  2. lenis.on('scroll', ScrollTrigger.update) keeps ScrollTrigger's cached
 *     scroll position in sync with Lenis's virtual scroll (pins don't jump).
 *  3. lagSmoothing(0) stops GSAP "catching up" with a violent jump after a tab
 *     is backgrounded.
 *  4. Full cleanup (ticker.remove + lenis.destroy + kill triggers) so React 18/19
 *     Strict-Mode double-mount doesn't leave two Lenis instances fighting.
 *
 * Reduced motion: when the user prefers reduced motion we skip Lenis entirely
 * and leave native scrolling in place (no smoothing, no ticker hijack).
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduce) {
      // No smooth scroll; ScrollTrigger still works off native scroll.
      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000); // gsap ticker time is in seconds; Lenis wants ms
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}
