/**
 * The transition-engine contract. Every effect in the catalog is a
 * TransitionImpl: a pure function from a context to a LayerSpec that
 * PushCard (per-card scope) or GridTransitionFrame (grid scope) feeds to
 * framer-motion.
 *
 * RULES for implementations (family modules):
 *  - Pure and cheap: called on every render, no side effects, no DOM reads.
 *  - SERIALIZABLE targets only — numbers, strings, keyframe arrays. No
 *    functions inside targets. Easing comes from ctx.ease (or per-target
 *    `steps(n)`-style strings where framer supports them). This is what lets
 *    the Export generator replay the same programs in vanilla WAAPI.
 *  - No Math.random / Date.now — use ctx.rand and ctx.order.
 *  - Respect ctx.enter / ctx.exit / ctx.ease: the user tunes these live and
 *    every transition must follow.
 */
import type { CSSProperties } from "react";
import type { TargetAndTransition, Transition } from "framer-motion";
import type { CellId, PushDir } from "./core";

/** a framer target restricted (by convention) to serializable values */
export type Target = TargetAndTransition;

export interface CardCtx {
  /** resolved travel direction for this card (direction map + reverse applied) */
  dir: PushDir;
  cellId: CellId;
  /** 0..9 rank of this cell along `dir` — wave order for cascades */
  order: number;
  /** stable per-(cell,slide) pseudo-random 0..1 */
  rand: number;
  /** resolved motion (seconds / easing fn) */
  enter: number;
  exit: number;
  ease: (t: number) => number;
  /** this cell's photo on the outgoing/incoming slide (null on text cards) */
  images: { from: string | null; to: string | null };
}

/** grid-scope context — one layer for the whole deck */
export type GridCtx = Omit<CardCtx, "cellId" | "order" | "images">;

export interface LayerSpec {
  /** incoming layer: initial → animate; outgoing layer: → exitTarget */
  initial: Target;
  animate: Target;
  exitTarget: Target;
  /** defaults: { duration: ctx.enter, ease: ctx.ease } */
  transition?: Transition;
  /** defaults: { duration: ctx.exit, ease: ctx.ease } */
  exitTransition?: Transition;
  /** stamped on the moving .push-layer (maskImage, backfaceVisibility, …) */
  layerStyle?: CSSProperties;
  /** stamped on the fixed .pushcard frame (perspective, …) */
  frameStyle?: CSSProperties;
  /**
   * Stacking: set zIndex INSIDE the targets when order matters
   * (cover: incoming targets carry zIndex 2; uncover: outgoing exitTarget
   * carries zIndex 2 and holds via exitTransition{duration: ctx.enter}).
   */
  /**
   * Flair effects: render N absolutely-positioned copies of the EXITING
   * content (doors=2, glitch=3, shatter=12). Copies are visibility:hidden at
   * rest; on exit each copy plays cloneTarget(i) (which should set
   * visibility:"visible") while the main child follows exitTarget (usually
   * an instant hide). Clones inherit the card's palette/layer box.
   */
  renderClones?: number;
  cloneStyle?: (i: number) => CSSProperties;
  cloneTarget?: (i: number) => { exitTarget: Target; exitTransition?: Transition };
  /**
   * WebGL effects: photo cells overlay a ShaderCrossfade canvas for the
   * transition instead of animating DOM layers (which hard-swap beneath it).
   * Text cells must ALSO get sane DOM targets (crossfade) — the spec's
   * initial/animate/exitTarget are used wherever the shader can't run.
   */
  webgl?: "displace-ripple" | "displace-sweep";
  /**
   * Grid scope only: an extra decor layer above the moving grids (curtain
   * panel, fade-through veil). Re-mounted per navigation; plays initial →
   * animate once.
   */
  overlayLayer?: {
    style: CSSProperties;
    initial: Target;
    animate: Target;
    transition?: Transition;
  };
}

export interface TransitionImpl {
  scope: "card" | "grid";
  /** does the direction map / reverse-on-prev apply */
  directional: boolean;
  /** per-card variants (scope "card") */
  card?: (ctx: CardCtx) => LayerSpec;
  /** whole-deck variants (scope "grid") */
  grid?: (ctx: GridCtx) => LayerSpec;
  /** "push": text keeps its nested mini-push; "static": text rides the card */
  textMode: "push" | "static";
}
