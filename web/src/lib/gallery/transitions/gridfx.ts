/**
 * Grid-scope family: fade-through, conveyor, deck-cards, coverflow, curtain.
 * The whole deck transitions as ONE layer inside GridTransitionFrame's
 * clipped frame (per-card PushCards render statically inside it), and
 * overlayLayer is the decor plane above both grid layers — the fade-through
 * veil and the curtain panel. gridDir is horizontal in today's UI, but every
 * directional effect resolves all four PushDirs.
 */
import { enterOffset, exitOffset, opposite, type PushDir } from "./core";
import type { GridCtx, LayerSpec, Target, TransitionImpl } from "./types";

// Fade Through — decks crossfade with a dip: a var(--bg) veil pulses over the
// stage so everything sinks to the theme background before the new slide fades up.
const fadeThroughImpl: TransitionImpl = {
  scope: "grid",
  directional: false,
  textMode: "static",
  grid: (ctx: GridCtx): LayerSpec => ({
    initial: { opacity: 0, zIndex: 2 },
    animate: { opacity: [0, 0, 1], zIndex: 2 },
    exitTarget: { opacity: 0, zIndex: 1 },
    // incoming holds invisible through the dip, then fades up
    transition: { duration: ctx.enter, ease: ctx.ease, times: [0, 0.4, 1] },
    overlayLayer: {
      style: { background: "var(--bg)" },
      initial: { opacity: 0 },
      animate: { opacity: [0, 1, 0] },
      transition: { duration: ctx.enter, ease: ctx.ease, times: [0, 0.45, 1] },
    },
  }),
};

// Conveyor — the whole bento rides off as one plate while the next rides in
// alongside it: the exit shares the enter's clock so both move in lockstep.
const conveyorImpl: TransitionImpl = {
  scope: "grid",
  directional: true,
  textMode: "push",
  grid: (ctx: GridCtx): LayerSpec => ({
    initial: { ...enterOffset(ctx.dir) },
    animate: { x: 0, y: 0 },
    exitTarget: { ...exitOffset(ctx.dir) },
    exitTransition: { duration: ctx.enter, ease: ctx.ease },
  }),
};

/** where the old deck gets tossed: 60% along the travel axis, 4% drift across it */
function tossOffset(dir: PushDir): Target {
  switch (dir) {
    case "left":
      return { x: "-60%", y: "4%" };
    case "right":
      return { x: "60%", y: "4%" };
    case "up":
      return { x: "4%", y: "-60%" };
    case "down":
      return { x: "4%", y: "60%" };
  }
}

// Card Deck — the old grid is tossed off with a slight spin (fading only at
// the very end) while the next scales up from the dimmed stack beneath it.
const deckCardsImpl: TransitionImpl = {
  scope: "grid",
  directional: true,
  textMode: "static",
  grid: (ctx: GridCtx): LayerSpec => ({
    initial: { scale: 0.9, filter: "brightness(0.65)", zIndex: 1 },
    animate: { scale: 1, filter: "brightness(1)", zIndex: 1 },
    exitTarget: {
      ...tossOffset(ctx.dir),
      rotate: ctx.dir === "left" ? -6 : 6,
      opacity: [1, 1, 1, 0], // evenly spaced: hold, hold, fade at the very end
      zIndex: 2,
    },
    // default transitions: toss over ctx.exit, rise over ctx.enter
  }),
};

/** the angled off-stage pose on the side the deck enters from (exit side = opposite) */
function coverflowPose(dir: PushDir): Target {
  switch (dir) {
    case "left":
      return { x: "45%", y: "0%", rotateX: 0, rotateY: -35 }; // off right, facing center
    case "right":
      return { x: "-45%", y: "0%", rotateX: 0, rotateY: 35 }; // off left, facing center
    case "up":
      return { x: "0%", y: "45%", rotateX: 35, rotateY: 0 }; // off bottom, facing center
    case "down":
      return { x: "0%", y: "-45%", rotateX: -35, rotateY: 0 }; // off top, facing center
  }
}

// Coverflow — the deck swings away in perspective (fading late in the swing)
// while the next swings in at the mirrored angle from the other side.
const coverflowImpl: TransitionImpl = {
  scope: "grid",
  directional: true,
  textMode: "static",
  grid: (ctx: GridCtx): LayerSpec => ({
    initial: { ...coverflowPose(ctx.dir), scale: 0.92, zIndex: 2 },
    animate: { x: "0%", y: "0%", rotateX: 0, rotateY: 0, scale: 1, zIndex: 2 },
    exitTarget: {
      ...coverflowPose(opposite(ctx.dir)),
      scale: 0.92,
      opacity: [1, 1, 1, 0], // evenly spaced: fade only in the last third
      zIndex: 1,
    },
    frameStyle: { perspective: "1200px" },
    layerStyle: { backfaceVisibility: "hidden", willChange: "transform" },
  }),
};

/** the panel's start pose and three sweep keyframes along the travel direction */
function curtainSweep(dir: PushDir): { from: Target; sweep: Target } {
  switch (dir) {
    case "left":
      return { from: { x: "102%" }, sweep: { x: ["102%", "0%", "-102%"] } };
    case "right":
      return { from: { x: "-102%" }, sweep: { x: ["-102%", "0%", "102%"] } };
    case "up":
      return { from: { y: "102%" }, sweep: { y: ["102%", "0%", "-102%"] } };
    case "down":
      return { from: { y: "-102%" }, sweep: { y: ["-102%", "0%", "102%"] } };
  }
}

// Curtain — an accent panel sweeps across the stage and the slide hard-swaps
// behind it at the covered midpoint (both layers flip instantly at t=0.5).
const curtainImpl: TransitionImpl = {
  scope: "grid",
  directional: true,
  textMode: "static",
  grid: (ctx: GridCtx): LayerSpec => {
    const panel = curtainSweep(ctx.dir);
    return {
      initial: { opacity: 0, zIndex: 1 },
      animate: { opacity: [0, 0, 1], zIndex: 1 },
      exitTarget: { opacity: [1, 1, 0], zIndex: 2 },
      // hold → instant swap at half: flat segments, so "linear" (no easing to see)
      transition: { duration: ctx.enter, ease: "linear", times: [0, 0.5, 0.5] },
      // outgoing holds visible until the swap and is only removed once the
      // panel has fully cleared (exit rides the enter's clock)
      exitTransition: { duration: ctx.enter, ease: "linear", times: [0, 0.5, 0.5] },
      overlayLayer: {
        style: { background: "var(--accent)" },
        initial: { ...panel.from },
        animate: { ...panel.sweep },
        transition: { duration: ctx.enter, ease: ctx.ease, times: [0, 0.5, 1] },
      },
    };
  },
};

export const IMPLS: Record<string, TransitionImpl> = {
  "fade-through": fadeThroughImpl,
  conveyor: conveyorImpl,
  "deck-cards": deckCardsImpl,
  coverflow: coverflowImpl,
  curtain: curtainImpl,
};
