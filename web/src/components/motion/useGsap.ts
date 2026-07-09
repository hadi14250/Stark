"use client";

import { useRef, useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionConfig } from "./useMotionConfig";

type GsapSetup = (ctx: {
  /** Horizontal multiplier — multiply x/xPercent/clip-path direction by this. */
  dir: 1 | -1;
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
}) => void;

/**
 * Scoped GSAP hook for scroll-driven set-pieces (pins, wipes, marquees,
 * parallax). Returns a ref to attach to the scope element.
 *
 * - All GSAP created inside `setup` is scoped to the ref via gsap.context and
 *   auto-reverted on unmount (Strict-Mode safe).
 * - Reduced motion → `setup` never runs; no triggers are created at all.
 * - `dir` is passed in so horizontal motion mirrors correctly in RTL.
 *
 * @example
 *   const scope = useGsap(({ dir, gsap }) => {
 *     gsap.to('.marquee', { xPercent: -50 * dir, repeat: -1, ease: 'none' });
 *   });
 *   return <div ref={scope}>…</div>;
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  setup: GsapSetup,
): RefObject<T | null> {
  const scope = useRef<T>(null);
  const { dir, reduce } = useMotionConfig();

  useEffect(() => {
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => setup({ dir, gsap, ScrollTrigger }), scope);
    return () => ctx.revert();
    // setup is expected to be stable (defined inline per render is fine because
    // ctx.revert cleans up; deps intentionally track dir/reduce only).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, reduce]);

  return scope;
}
