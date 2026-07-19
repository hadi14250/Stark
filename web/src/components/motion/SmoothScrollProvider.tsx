"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * Owns Lenis smooth-scroll.
 *
 * This used to drive Lenis off `gsap.ticker` and sync it with ScrollTrigger,
 * which was the correct architecture WHEN there were GSAP scroll set-pieces to
 * keep in sync: one RAF loop rather than two competing ones,
 * `ScrollTrigger.update` on Lenis's virtual scroll so pins do not jump, and
 * `lagSmoothing(0)` so GSAP does not violently catch up after a backgrounded
 * tab.
 *
 * None of those set-pieces survived into the built pages — GSAP's only
 * remaining consumer was the home-page marquee, which is CSS now — so GSAP was
 * removed and this runs its own RAF. The three problems the ticker solved do
 * not arise with a single animation source.
 *
 * Reduced motion: skip Lenis entirely and leave native scrolling in place. No
 * smoothing, no RAF loop at all.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Full cleanup so React Strict-Mode's double mount cannot leave two Lenis
    // instances fighting over the same scroll.
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
