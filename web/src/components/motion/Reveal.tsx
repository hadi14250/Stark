"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ease, duration } from "@/styles/tokens";
import { useMotionConfig } from "./useMotionConfig";
import { useEntrance } from "./EntranceGate";

/**
 * How long to wait before assuming the viewport observer is never going to
 * fire for an element that is ALREADY ON SCREEN.
 *
 * The rect check is the whole point. A previous version forced every Reveal
 * visible 1500ms after mount, unconditionally — which meant that 1.5 seconds
 * after page load the entire document, including everything far below the
 * fold, was already revealed. Scrolling then animated nothing, anywhere, on
 * any page. A fail-safe that fires for off-screen elements does not rescue a
 * broken observer, it replaces a working one.
 */
const FAILSAFE_MS = 2000;

/**
 * Whether the fail-safe is allowed to reveal this element.
 *
 * Exported and pure so the rule can be asserted directly — it is the whole
 * difference between "a rescue for a broken observer" and "a timer that
 * pre-reveals the entire document", and the second one silently removed every
 * scroll animation from the site.
 */
export function isOnScreen(rect: { top: number; bottom: number }, viewportH: number): boolean {
  return rect.top < viewportH && rect.bottom > 0;
}

type RevealProps = {
  children: ReactNode;
  /** Horizontal offset in px (mirrored for RTL). Positive = enters from end side. */
  x?: number;
  /** Vertical offset in px. Direction-agnostic. */
  y?: number;
  /** Delay in seconds (use for staggered groups). */
  delay?: number;
  /** Framer ease name from the token set. */
  easeName?: keyof typeof ease;
  /** Scale to enter from. 1 = no scale. */
  scale?: number;
  /** Blur to enter from, in px. 0 = none. */
  blur?: number;
  className?: string;
  /** Render as a different element/tag if needed (defaults to div). */
  as?: "div" | "section" | "li" | "span";
};

/**
 * Component-level scroll reveal (Framer Motion).
 *
 * - Reduced motion → renders children in final state, no transform.
 * - RTL → the x offset is mirrored via `dir`, so cards that slide in from the
 *   start edge in English slide from the correct edge in Arabic.
 *
 * Boundary rule: <Reveal> (Framer) owns component reveals. CSS owns ambient
 * loops. Never animate the same element/property with both.
 */
export function Reveal({
  children,
  x = 0,
  y = 40,
  delay = 0,
  easeName = "zoom",
  scale = 1,
  blur = 0,
  className,
  as = "div",
}: RevealProps) {
  const { dir, reduce } = useMotionConfig();
  // While the preloader's curtain is up, hold the initial state. Otherwise the
  // hero's staged entrance plays behind an opaque panel and is over before the
  // curtain lifts — which is exactly what used to happen.
  const { ready } = useEntrance();
  const ref = useRef<HTMLElement>(null);
  const [forced, setForced] = useState(false);

  useEffect(() => {
    if (reduce || !ready) return;
    const t = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      // ONLY rescue what is actually on screen. Anything below the fold keeps
      // waiting for the observer, which is what makes scrolling feel alive.
      if (isOnScreen(el.getBoundingClientRect(), window.innerHeight)) setForced(true);
    }, FAILSAFE_MS);
    return () => window.clearTimeout(t);
  }, [reduce, ready]);

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];
  const shown = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  };

  return (
    <MotionTag
      // @ts-expect-error — motion's per-tag ref types don't unify across the
      // `as` union; the element is whatever `as` says and the rect read is safe.
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        x: x * dir,
        y,
        scale,
        filter: blur ? `blur(${blur}px)` : "blur(0px)",
      }}
      {...(!ready
        ? {} // gated: hold `initial` until the curtain is gone
        : forced
          ? { animate: shown }
          : { whileInView: shown })}
      // -12% bottom margin: fire when the element is properly into the
      // viewport rather than the instant its first pixel appears, so the
      // motion is seen rather than finishing off-screen.
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: duration.reveal,
        ease: [...ease[easeName]],
        delay,
      }}
    >
      {children}
    </MotionTag>
  );
}
