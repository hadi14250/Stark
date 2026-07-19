/**
 * The transition registry, trimmed for Stark.
 *
 * The handoff shipped 39 effects across 8 family modules. Stark keeps three:
 * `push` (the shipping card-scope effect), `fade-through` (the one grid-scope
 * effect we use) and `crossfade`. Unbounded transition variety is the exact
 * problem this redesign exists to fix, and the dropped families are dead
 * bundle weight. `getImpl` falls back to `push` for unknown ids, so a stale
 * id can never blank the stage.
 */
import type { TransitionImpl } from "./types";
import { IMPLS as PUSH } from "./push";
import { IMPLS as GRIDFX } from "./gridfx";

/* ------------------------------------------------------------------ */
/* Reduced-motion overrides (not catalog entries): applied by          */
/* PushSlider when the OS prefers reduced motion, per                  */
/* config.motion.reducedMotion.                                        */
/* ------------------------------------------------------------------ */

export const REDUCED_FADE_IMPL: TransitionImpl = {
  scope: "card",
  directional: false,
  textMode: "static",
  card: () => ({
    initial: { opacity: 0, zIndex: 2 },
    animate: { opacity: 1, zIndex: 2 },
    exitTarget: { opacity: 0, zIndex: 1 },
    transition: { duration: 0.3, ease: "easeOut" },
    exitTransition: { duration: 0.3, ease: "easeOut" },
  }),
};

export const INSTANT_IMPL: TransitionImpl = {
  scope: "card",
  directional: false,
  textMode: "static",
  card: () => ({
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exitTarget: { opacity: 0 },
    transition: { duration: 0 },
    exitTransition: { duration: 0 },
  }),
};

const REGISTRY: Record<string, TransitionImpl> = {
  ...PUSH,
  "fade-through": GRIDFX["fade-through"],
  crossfade: REDUCED_FADE_IMPL,
};

export function hasImpl(id: string): boolean {
  return id in REGISTRY;
}

/** unknown ids fall back to push so a stale saved config can never blank the stage */
export function getImpl(id: string): TransitionImpl {
  return REGISTRY[id] ?? REGISTRY.push;
}
