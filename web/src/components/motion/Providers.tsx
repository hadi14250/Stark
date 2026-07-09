"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { SmoothScrollProvider } from "./SmoothScrollProvider";

/**
 * Client provider tree mounted inside the [locale] layout. Wraps children in:
 *  - MotionConfig(reducedMotion="user") so Framer respects the OS setting.
 *  - SmoothScrollProvider (Lenis + GSAP ScrollTrigger sync).
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </MotionConfig>
  );
}
