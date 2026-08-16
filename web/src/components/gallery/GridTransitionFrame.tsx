"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { cellRand } from "@/lib/gallery/transitions/core";
import type { LayerSpec } from "@/lib/gallery/transitions/types";
import { useTransitionConfig } from "@/lib/gallery/transitions/context";

/**
 * Grid-scope transitions (conveyor, deck-cards, coverflow, curtain,
 * fade-through): ONE clipped frame around the whole bento animates while the
 * per-card PushCards render statically inside it (they detect grid scope via
 * the same context and skip their own AnimatePresence).
 *
 * The optional overlayLayer (curtain panel, fade-through veil) re-mounts per
 * navigation and plays initial → animate once above both grid layers.
 */

type VariantCustom = {
  spec: LayerSpec;
  enter: number;
  exit: number;
  ease: (t: number) => number;
};

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

export default function GridTransitionFrame({
  contentKey,
  children,
}: {
  contentKey: string | number;
  children: ReactNode;
}) {
  const t = useTransitionConfig();

  // cold load: the deck appears without transitioning (matches the cards)
  const mounted = useRef(false);
  const isInitial = !mounted.current;
  useEffect(() => {
    mounted.current = true;
  }, []);

  if (!t || t.impl.scope !== "grid" || !t.impl.grid) {
    return <>{children}</>;
  }

  const spec = t.impl.grid({
    dir: t.gridDir,
    rand: cellRand("hero", contentKey),
    enter: t.enter,
    exit: t.exit,
    ease: t.ease,
  });
  const custom: VariantCustom = { spec, enter: t.enter, exit: t.exit, ease: t.ease };

  return (
    <div className="gridframe" style={spec.frameStyle}>
      {/* mode "sync", NOT popLayout: every .grid-layer is absolutely positioned
          by CSS (the frame is the sizing box), so popLayout's out-of-flow
          machinery isn't needed — and its exit bookkeeping wedged when the
          exiting subtree re-rendered mid-exit (leaked zombie layers). */}
      <AnimatePresence initial={false} mode="sync" custom={custom}>
        <motion.div
          key={contentKey}
          className="grid-layer"
          style={spec.layerStyle}
          custom={custom}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      {spec.overlayLayer && !isInitial && (
        <motion.div
          key={`fx-${contentKey}`}
          className="grid-overlay"
          style={spec.overlayLayer.style}
          // framer's initial/animate prop types are narrower than
          // TargetAndTransition — the values are plain targets, cast is safe
          initial={spec.overlayLayer.initial as never}
          animate={spec.overlayLayer.animate as never}
          transition={
            spec.overlayLayer.transition ?? { duration: t.enter, ease: t.ease }
          }
        />
      )}
    </div>
  );
}
