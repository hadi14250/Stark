"use client";

import {
  ENTER_DUR,
  EXIT_DUR,
  PUSH_EASE,
  enterOffset,
  exitOffset,
} from "@/lib/gallery/transitions/core";
import { useTransitionConfig } from "@/lib/gallery/transitions/context";
import { usePushPhase } from "./PushCard";

/**
 * Text entrance — a nested mini-push INSIDE the card's push, built to the
 * original's declared config (every text layer in the SR7 module JSON):
 *
 *   in:  from ±100% of the TEXT'S OWN box, along the card's own axis,
 *        t=250ms, d=1200ms, power3.inOut — same curve and duration as the
 *        card, just starting a beat later.
 *   out: to the opposite edge of its own box, t=0, d=500ms — a double-speed
 *        peel out of its own mask.
 *
 * The travel is the text's OWN span inside its own .tmask (see cards.tsx);
 * because both run the same in-out but the text starts late, the text always
 * slides relative to a still-moving parent — that drift IS the "parallax".
 *
 * LIVE CONFIG: with the editor's TransitionProvider present, delay/stagger/
 * durations/ease come from the store, and the active transition's textMode
 * decides whether the mini-push runs at all — non-push effects (fades, wipes,
 * flips…) set textMode "static" and the copy simply rides its card.
 */
export const TEXT_DELAY = 0.25;

/** cold load: no push ran, so the copy just fades up in place */
const INITIAL_FADE = 0.4;
const INITIAL_LAG = 0.12;
const INITIAL_STEP = 0.05;

/**
 * Motion props for one line of text. `order` staggers the cold-load fade
 * and, when the editor's line-stagger is non-zero, the push delay too
 * (declared default is a FLAT 250ms — stagger 0).
 */
export function useTextEnter(order = 0) {
  const { dir, isInitial } = usePushPhase();
  const t = useTransitionConfig();

  if (isInitial) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, x: 0, y: 0 },
      transition: {
        duration: INITIAL_FADE,
        // `as const` is required, not cosmetic: framer-motion 12 narrowed
        // Transition["ease"] from `string` to the `Easing` union, and without
        // it TS widens this literal to `string` — which fails at all 8
        // `motion.*` call sites in cards.tsx.
        ease: "easeOut" as const,
        delay: INITIAL_LAG + order * INITIAL_STEP,
      },
    };
  }

  // Grid-scope transitions move the WHOLE deck as one layer — nested per-line
  // exits inside it are visually redundant and, worse, exit-props appearing on
  // frozen children mid-exit wedge AnimatePresence's completion bookkeeping.
  // Text always rides the deck in grid scope.
  const mode = !t ? "push" : t.impl.scope === "grid" ? "static" : t.impl.textMode;
  if (mode === "static") {
    // the card's own transition carries the copy — no nested motion
    return {
      initial: { opacity: 1, x: 0, y: 0 },
      animate: { opacity: 1, x: 0, y: 0 },
    };
  }

  const enter = t ? t.enter : ENTER_DUR;
  const exit = t ? t.exit : EXIT_DUR;
  const ease = t ? t.ease : PUSH_EASE;
  const delay = (t ? t.textDelay : TEXT_DELAY) + order * (t ? t.textStagger : 0);

  return {
    initial: { opacity: 1, ...enterOffset(dir) },
    animate: { opacity: 1, x: 0, y: 0 },
    // Exit fires when this line's layer is removed by AnimatePresence — nested
    // motion elements inside the exiting card layer run their own exit too.
    exit: {
      ...exitOffset(dir),
      transition: { duration: exit, ease },
    },
    transition: {
      duration: enter,
      ease,
      delay,
    },
  };
}
