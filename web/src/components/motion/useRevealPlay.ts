"use client";

import { useEffect, useRef, useState } from "react";
import type { TargetAndTransition, VariantLabels } from "framer-motion";
import { useEntrance } from "./EntranceGate";
import { useMotionConfig } from "./useMotionConfig";

/**
 * How long to wait before assuming the viewport observer is never going to
 * fire for an element that is ALREADY ON SCREEN.
 *
 * The rect check is the whole point. A previous version forced every reveal
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
export function isOnScreen(
  rect: { top: number; bottom: number },
  viewportH: number,
): boolean {
  return rect.top < viewportH && rect.bottom > 0;
}

/**
 * The one implementation of "when is this reveal allowed to play".
 *
 * IT EXISTS BECAUSE THE VARIANTS DRIFTED APART AND ONE OF THEM SHIPPED BROKEN.
 * `Reveal` had both halves of this — the entrance gate, so a reveal does not
 * play behind the preloader's curtain, and the fail-safe above, because a
 * viewport observer that never fires is a real condition on this site and not
 * a hypothetical. `ClipReveal`, `DrawLine` and `DrawLineY` had neither. They
 * were also unused, so nothing exercised them.
 *
 * The first time one was put on screen, it did exactly what an unrescued
 * `whileInView` does when the observer stays silent: the element kept its
 * initial state forever. For a fade that means invisible; for `ClipReveal` it
 * meant `clip-path: inset(0 100% 0 0)` — a section of photographs, present and
 * correct in the DOM, clipped to zero width. It read as "the images are
 * broken" rather than "the animation did not run", which is why it was not
 * obvious from the markup.
 *
 * So the rule is now structural rather than remembered: any reveal that holds
 * an initial state gets its play signal from here, and `reveals.test.tsx`
 * fails if one grows its own.
 *
 * Returns the props to spread onto the motion element. `shown` is whatever
 * "finished" means for that particular reveal.
 */
export function useRevealPlay<T extends HTMLElement = HTMLDivElement>(
  /** The finished state: a target object, or a variant label. */
  shown: TargetAndTransition | VariantLabels,
) {
  const { reduce } = useMotionConfig();
  // While the preloader's curtain is up, hold the initial state. Otherwise the
  // hero's staged entrance plays behind an opaque panel and is over before the
  // curtain lifts — which is exactly what used to happen.
  const { ready } = useEntrance();
  const ref = useRef<T>(null);
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

  return {
    ref,
    /** Spread onto the motion element, after `initial`. */
    play: !ready
      ? {} // gated: hold `initial` until the curtain is gone
      : forced
        ? { animate: shown }
        : { whileInView: shown },
  };
}
