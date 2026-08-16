/**
 * Engine core: the primitive vocabulary every transition builds on.
 * Moved out of PushCard so transition modules never import components
 * (components import the engine, one-way — PushCard re-exports these for
 * backwards compatibility).
 *
 * All timing facts are the ORIGINAL's declared config (SR7 module JSON):
 * one quartic in-out ease everywhere, exit 500ms and enter 1200ms both
 * starting at t=0, no per-card stagger — see PushCard.tsx for the full story.
 */
import type { Slide } from "@/lib/gallery/types";

export type PushDir = "up" | "down" | "left" | "right";

/** the grid cells that carry a push direction (mirrors SlideGrid + SliderControls) */
export type CellId =
  | "hero"
  | "intro"
  | "portraitA"
  | "explore"
  | "blossom"
  | "stay"
  | "portraitB"
  | "cuisine"
  | "cta"
  | "prevnext";

export const PUSH_EASE = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (1 - t) * (1 - t) * (1 - t) * (1 - t);

export const EXIT_DUR = 0.5; // declared: every tl.out is d=500ms
export const ENTER_DUR = 1.2; // declared: every tl.in is d=1200ms

/** ±100% of the moving element's own box — the original's declared travel */
export function enterOffset(dir: PushDir) {
  switch (dir) {
    case "up":
      return { x: 0, y: "100%" }; // comes up from the bottom
    case "down":
      return { x: 0, y: "-100%" }; // comes down from the top
    case "left":
      return { x: "100%", y: 0 }; // comes in from the right
    case "right":
      return { x: "-100%", y: 0 }; // comes in from the left
  }
}
export function exitOffset(dir: PushDir) {
  switch (dir) {
    case "up":
      return { x: 0, y: "-100%" };
    case "down":
      return { x: 0, y: "100%" };
    case "left":
      return { x: "-100%", y: 0 };
    case "right":
      return { x: "100%", y: 0 };
  }
}

/**
 * Mirror a push direction across the inline axis, for RTL.
 *
 * The bento is flexbox, so the LAYOUT mirrors for free under `dir="rtl"`. The
 * MOTION does not: `PushDir` is physical, so without this the cards push the
 * same absolute direction in both languages and stop agreeing with the
 * mirrored layout — "Next" pushes content the way an Arabic reader reads
 * BACKWARDS. Measured under dir=rtl in the A0a spike.
 *
 * Only the horizontal pair flips; up/down are unaffected by writing mode.
 */
export function mirrorDir(dir: PushDir, rtl: boolean): PushDir {
  if (!rtl) return dir;
  return dir === "left" ? "right" : dir === "right" ? "left" : dir;
}

export function opposite(dir: PushDir): PushDir {
  switch (dir) {
    case "up":
      return "down";
    case "down":
      return "up";
    case "left":
      return "right";
    case "right":
      return "left";
  }
}

/* ------------------------------------------------------------------ */
/* Grid geometry helpers for cascading transitions                     */
/* ------------------------------------------------------------------ */

/** approximate desktop grid position of each cell (x: 0..3, y: 0..3) */
const CELL_POS: Record<CellId, { x: number; y: number }> = {
  hero: { x: 0.5, y: 0.75 },
  explore: { x: 2, y: 0.4 },
  portraitB: { x: 3, y: 0.75 },
  blossom: { x: 2, y: 1.6 },
  intro: { x: 0, y: 2.1 },
  portraitA: { x: 1, y: 2.1 },
  cuisine: { x: 3, y: 2.3 },
  cta: { x: 0, y: 3 },
  prevnext: { x: 1, y: 3 },
  stay: { x: 2, y: 2.9 },
};

export const ALL_CELLS = Object.keys(CELL_POS) as CellId[];

const orderCache = new Map<PushDir, Record<CellId, number>>();

/**
 * Rank (0..9) of a cell along the travel direction — the wave order for
 * cascade/diagonal/flipboard effects. "right" = leftmost cell leads.
 */
export function orderOf(cellId: CellId, dir: PushDir): number {
  let map = orderCache.get(dir);
  if (!map) {
    const axis = (c: CellId) => {
      const p = CELL_POS[c];
      switch (dir) {
        case "right":
          return p.x + p.y * 0.01;
        case "left":
          return -p.x + p.y * 0.01;
        case "down":
          return p.y + p.x * 0.01;
        case "up":
          return -p.y + p.x * 0.01;
      }
    };
    const sorted = [...ALL_CELLS].sort((a, b) => axis(a) - axis(b));
    map = {} as Record<CellId, number>;
    sorted.forEach((c, i) => (map![c] = i));
    orderCache.set(dir, map);
  }
  return map[cellId];
}

/**
 * Stable pseudo-random 0..1 per (cell, slide) — Math.random is forbidden in
 * impls (both layers of a card must agree, and export replay must match).
 */
export function cellRand(cellId: CellId, key: string | number): number {
  const s = `${cellId}:${key}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0xffffffff;
}

/**
 * Which cells run the WebGL shader (null = DOM fallback instead).
 *
 * ALL EIGHT PICTURE CELLS DO, NOW. It used to be four: `cuisine` was a
 * text+photo hybrid where a full-card shader would have covered the copy, and
 * `intro` / `explore` / `stay` were pure text cards with no texture to sample.
 * The review turned all four into photographs, so the reason they were excluded
 * is gone and the whole grid dissolves as one rather than four cells shading
 * while four cross-fade.
 *
 * Each mounts its own short-lived WebGL context for the ~1.2s of a transition.
 * Eight is still well under the browser's ~16-context limit, and the context is
 * reclaimed when the canvas leaves the DOM at transition end.
 *
 * NOTE: the shader canvas MUST NOT call loseContext() on cleanup — that
 * poisons React StrictMode's remount and every shader then fails silently
 * (see ShaderCrossfade).
 *
 * The two control cells stay null: they are buttons, not pictures.
 */
export const CELL_IMAGE: Record<CellId, ((s: Slide) => string) | null> = {
  hero: (s) => s.heroImage,
  intro: (s) => s.introImage,
  portraitA: (s) => s.portraitA,
  explore: (s) => s.exploreImage,
  blossom: (s) => s.blossom,
  stay: (s) => s.stayImage,
  portraitB: (s) => s.portraitB,
  cuisine: (s) => s.cuisineImage,
  cta: null,
  prevnext: null,
};
