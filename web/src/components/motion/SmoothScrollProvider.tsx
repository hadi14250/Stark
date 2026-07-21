"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * Owns Lenis smooth-scroll.
 *
 * IT WAS THE LAG. The client's report was "the website is so laggy when
 * scrolling", and this file was the cause — not the animations, and not the
 * frame budget. At `lerp: 0.1` Lenis moves the page one tenth of the remaining
 * distance per frame, so a wheel notch takes roughly twenty frames to settle.
 * The frames are all rendering on time (a headless trace shows a clean 17ms
 * throughout), which is exactly why this is easy to misdiagnose: nothing is
 * dropping, the page is simply arriving late on purpose. Every scroll-linked
 * effect on the site then reads that lagged position, so the parallax and the
 * pinned Process scrub trail the wheel too and the whole page feels heavy.
 *
 * `lerp: 0.14` with `duration` unset and a `wheelMultiplier` of 1 settles in
 * about eight frames instead of twenty — still smoothed, no longer floaty.
 *
 * ⚠ IF IT STILL FEELS SLOW, DELETE THIS PROVIDER. Native scrolling is instant
 * and every scroll-linked effect on the site works fine without Lenis; they
 * read `window.scrollY` either way. Smooth-scroll is a taste, not a
 * requirement, and it is the first thing to remove rather than the last.
 *
 * Reduced motion: skip Lenis entirely and leave native scrolling in place. No
 * smoothing, no RAF loop at all.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.14,
      smoothWheel: true,
      // Touch devices already have momentum scrolling in the OS. Smoothing on
      // top of it is what makes a phone feel like it is fighting your thumb.
      syncTouch: false,
    });

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
