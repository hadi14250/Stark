"use client";

import { useLocale } from "next-intl";
import { useMediaQuery } from "./useMediaQuery";

export type MotionConfig = {
  /** Horizontal multiplier: 1 for LTR, -1 for RTL. Multiply every x/xPercent
   *  transform, clip-path wipe direction and marquee travel by this. */
  dir: 1 | -1;
  /** True when the user prefers reduced motion. */
  reduce: boolean;
  /** 1 when motion is on, 0 when reduced — convenient scalar for travel/opacity. */
  scale: 0 | 1;
};

/**
 * The single source of motion truth, read by <Reveal>, <Parallax> and the
 * gallery stage. Deciding `dir` and `reduce` once, here, is what keeps RTL
 * mirroring and reduced-motion handling out of every call site.
 *
 * THIS USED TO CALL FRAMER'S `useReducedMotion()`, AND IT BROKE HYDRATION ON
 * EVERY ROUTE — but only for the people who had asked for reduced motion, which
 * is why it survived so long. That hook answers from `matchMedia` on the
 * client's first render while the server had no way to know, so a visitor with
 * the OS setting on got "server rendered HTML didn't match" on /, /woodworks,
 * /mattresses and /gallery, React threw the tree away and rebuilt it, and
 * Framer followed up with "target ref is defined but not hydrated" because the
 * elements its scroll listeners had measured no longer existed.
 *
 * `useMediaQuery` is the same query through `useSyncExternalStore`, whose third
 * argument is an explicit SERVER snapshot that React also uses for the
 * hydrating render. Server and first client render therefore agree by
 * construction, and the real value arrives in a re-render once hydration is
 * done.
 *
 * The one-frame consequence is that a reduced-motion visitor is briefly
 * described as `reduce: false`. Nothing moves in that window: globals.css
 * neutralises animation and transition durations under the same media query,
 * so CSS has already stopped the motion before this value catches up. What this
 * flag actually decides is which TREE renders — a `layoutId` marker versus a
 * static bar, a scrubbed band versus a placed one — and getting that wrong for
 * one frame costs a re-render, whereas getting it wrong during hydration cost
 * the whole page.
 */
export function useMotionConfig(): MotionConfig {
  const locale = useLocale();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const dir: 1 | -1 = locale === "ar" ? -1 : 1;
  return { dir, reduce, scale: reduce ? 0 : 1 };
}
