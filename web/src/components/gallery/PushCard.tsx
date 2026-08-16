"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ENTER_DUR,
  EXIT_DUR,
  PUSH_EASE,
  cellRand,
  opposite,
  orderOf,
  type CellId,
  type PushDir,
} from "@/lib/gallery/transitions/core";
import type { CardCtx, LayerSpec } from "@/lib/gallery/transitions/types";
import { pushImpl } from "@/lib/gallery/transitions/push";
import { useTransitionConfig } from "@/lib/gallery/transitions/context";
import { ShaderCrossfade } from "@/lib/gallery/transitions/webgl";

/*
 * A grid cell whose FRAME stays fixed while its content transitions. The
 * default (and the original's) behavior is the PowerPoint "Push" — see
 * lib/transitions/push.ts for the declared-config story (one quartic in-out
 * ease, exit 500ms and enter 1200ms both from t=0, no stagger).
 *
 * The card is now ENGINE-DRIVEN: with a TransitionProvider above it (the
 * editor's live config), the active TransitionImpl supplies the variants —
 * any of the catalog's effects, with live durations/ease/direction map.
 * Without a provider it behaves exactly like the shipped push slider.
 */

// Re-exports so existing imports (config defaults, textMotion) keep working.
export { ENTER_DUR, EXIT_DUR, PUSH_EASE, enterOffset, exitOffset } from "@/lib/gallery/transitions/core";
export type { PushDir } from "@/lib/gallery/transitions/core";

/**
 * What a layer's CONTENT needs for its own nested entrance (see useTextEnter):
 * the card's RESOLVED direction, and whether this is the cold page load
 * (cards don't animate there — text keyed off a push that never ran would
 * sit invisible forever).
 */
export type PushPhase = {
  dir: PushDir;
  isInitial: boolean;
};
const PushPhaseContext = createContext<PushPhase>({
  dir: "right",
  isInitial: true,
});
export const usePushPhase = () => useContext(PushPhaseContext);

/** what the variant functions receive — forwarded to EXITING layers too */
type VariantCustom = {
  spec: LayerSpec;
  enter: number;
  exit: number;
  ease: (t: number) => number;
};

// Variants read everything from `custom`, which AnimatePresence forwards to
// exiting children too — so the EXITING layer uses the CURRENT navigation's
// spec/direction (correct when switching between Next and Previous).
const variants = {
  enter: (c: VariantCustom) => ({ ...c.spec.initial }),
  center: (c: VariantCustom) => ({
    ...c.spec.animate,
    transition: c.spec.transition ?? { duration: c.enter, ease: c.ease },
  }),
  exit: (c: VariantCustom) => ({
    ...c.spec.exitTarget,
    transition: c.spec.exitTransition ?? { duration: c.exit, ease: c.ease },
  }),
};

export default function PushCard({
  contentKey,
  dir,
  reverse = false,
  cellId,
  className = "",
  style,
  children,
}: {
  /** changes when the slide changes — drives the transition */
  contentKey: string | number;
  /** fallback direction (standalone usage without the editor provider) */
  dir: PushDir;
  /** fallback reverse flag (standalone usage) */
  reverse?: boolean;
  /** which grid cell this is — keys the direction map / cascades / webgl */
  cellId?: CellId;
  className?: string;
  /**
   * Stamped on the MOVING LAYER, not the frame — pass the slide's palette
   * (themeVars) here. Each layer keeps the style it rendered with, so the
   * exiting content slides out in the OLD slide's colors while the entering
   * content carries the new ones. Putting the vars on any shared ancestor
   * instead makes the old content flip to the new palette the instant the
   * slide changes, before it has even left.
   */
  style?: CSSProperties;
  children: ReactNode;
}) {
  const t = useTransitionConfig();

  // resolved direction: live direction map (+ live reverse) when the editor
  // drives us; the static props otherwise.
  const mapDir = t && cellId ? t.dirFor(cellId) : dir;
  const rev = t ? t.reverse : reverse;
  const d = rev ? opposite(mapDir) : mapDir;

  // First render = the cold page load (AnimatePresence initial={false}).
  const mounted = useRef(false);
  const isInitial = !mounted.current;
  useEffect(() => {
    mounted.current = true;
  }, []);

  // WebGL overlay bookkeeping: shown from the render where contentKey changed
  // until the shader reports done.
  const [fxDoneKey, setFxDoneKey] = useState<string | number | null>(null);

  const phase: PushPhase = { dir: d, isInitial };

  /* ---------- grid scope: the deck-level frame animates, cards are static ---------- */
  if (t && t.impl.scope === "grid") {
    return (
      <div className={`pushcard ${className}`}>
        <div className="push-layer" style={style}>
          <PushPhaseContext.Provider value={phase}>{children}</PushPhaseContext.Provider>
        </div>
      </div>
    );
  }

  /* ---------- card scope ---------- */
  const enter = t ? t.enter : ENTER_DUR;
  const exitDur = t ? t.exit : EXIT_DUR;
  const ease = t ? t.ease : PUSH_EASE;
  const cell: CellId = cellId ?? "hero";
  const images = t && cellId ? t.imagesFor(cellId) : { from: null, to: null };

  const ctx: CardCtx = {
    dir: d,
    cellId: cell,
    order: orderOf(cell, d),
    rand: cellRand(cell, contentKey),
    enter,
    exit: exitDur,
    ease,
    images,
  };

  const impl = t ? t.impl : pushImpl;
  const spec: LayerSpec = impl.card ? impl.card(ctx) : pushImpl.card!(ctx);

  // WebGL: photo cells overlay the shader canvas (on top, z-index 5). The DOM
  // layers underneath keep the impl's OWN crossfade targets and are NOT
  // hard-swapped — a hard swap flashed the new image for the one frame before
  // the shader painted (the "snap then effect" pop). Running the graceful DOM
  // crossfade underneath means the brief pre-paint glimpse is old→new fading,
  // never an instant jump; once the shader paints (opaque) it hides the DOM,
  // and when it finishes at `enter` the settled DOM (also new by then) shows.
  const shaderKind = spec.webgl;
  const shaderEligible =
    !!shaderKind && !!images.from && !!images.to && images.from !== images.to && !isInitial;
  const showShader = shaderEligible && fxDoneKey !== contentKey;

  const custom: VariantCustom = { spec, enter, exit: exitDur, ease };

  // Clones (flair effects): copies of the EXITING content, hidden at rest,
  // revealed + animated by their own exit targets when the layer is removed
  // (nested motion elements inside a removed subtree run their exits too —
  // the same mechanism the text mini-push uses).
  const inner = (
    <PushPhaseContext.Provider value={phase}>{children}</PushPhaseContext.Provider>
  );
  const layerContent = spec.renderClones ? (
    <>
      <motion.div
        className="fx-main"
        exit={{ visibility: "hidden", transition: { duration: 0 } }}
      >
        {inner}
      </motion.div>
      {Array.from({ length: spec.renderClones }, (_, i) => {
        const c = spec.cloneTarget?.(i);
        return (
          <motion.div
            key={i}
            className="fx-clone"
            style={spec.cloneStyle?.(i)}
            exit={{
              visibility: "visible",
              ...c?.exitTarget,
              transition: c?.exitTransition ?? { duration: exitDur, ease },
            }}
          >
            {inner}
          </motion.div>
        );
      })}
    </>
  ) : (
    inner
  );

  return (
    <div className={`pushcard ${className}`} style={spec.frameStyle}>
      <AnimatePresence initial={false} mode="popLayout" custom={custom}>
        <motion.div
          key={contentKey}
          className="push-layer"
          style={{ ...style, ...spec.layerStyle }}
          custom={custom}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {layerContent}
        </motion.div>
      </AnimatePresence>
      {showShader && (
        <div className="fx-shader" aria-hidden>
          <ShaderCrossfade
            key={String(contentKey)}
            from={images.from!}
            to={images.to!}
            kind={shaderKind!}
            dir={d}
            duration={enter * 1000}
            ease={ease}
            onDone={() => setFxDoneKey(contentKey)}
          />
        </div>
      )}
    </div>
  );
}
