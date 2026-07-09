"use client";

import { useLocale } from "next-intl";
import { useReducedMotion } from "framer-motion";

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
 * The single source of motion truth, read by BOTH the Framer <Reveal> primitive
 * and the GSAP scroll hooks. Deciding `dir` and `reduce` at creation time is
 * what keeps RTL mirroring and reduced-motion out of every call site.
 */
export function useMotionConfig(): MotionConfig {
  const locale = useLocale();
  const reduce = useReducedMotion() ?? false;
  const dir: 1 | -1 = locale === "ar" ? -1 : 1;
  return { dir, reduce, scale: reduce ? 0 : 1 };
}
