"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { isCutout } from "@/components/mattresses/assets";
import { ease } from "@/styles/tokens";
import type { GalleryImage } from "@/lib/gallery/images";

/**
 * Click a picture, see it big. The client's ask, in one component:
 * "when I click on a picture it should become bigger to preview it".
 *
 * ===========================================================================
 * THE EXPANSION IS A FLIP MEASURED FROM THE TILE, NOT A SHARED `layoutId`
 * ===========================================================================
 *
 * The feel is the same one: the figure starts life exactly on top of the tile
 * that opened it and travels to full size, so the picture LIFTS off the grid
 * rather than a second copy fading in over it.
 *
 * ⚠ IT USED TO BE `layoutId`, MATCHED ON THE TILE, AND THAT BROKE THE GRID.
 * Framer's shared layout pairs on the id, the id was the image URL, and the
 * placeholder pool is shared between sub-categories — so during the bento's push
 * transition a tile leaving one slot would pair with an unrelated tile arriving
 * in a different slot and animate across the grid on a spring, over the top of
 * the 1.2s push. See the long note in `cards.tsx`; the short version is that a
 * layout-projected node cannot live inside a card that is being translated
 * ±100%, and no amount of re-keying makes that safe.
 *
 * Measuring the opener's rect gets the same interaction from outside the stage,
 * where it cannot touch anything. `controls.set()` inside a layout effect
 * applies before paint, so there is no frame of the figure at full size.
 *
 * ⚠ THE FLIP IS ON OPEN AND CLOSE ONLY, NEVER ON PAGING. The layoutId version
 * re-keyed on `image.src`, so arrowing through the set re-ran a shared layout on
 * every step — and if the next picture happened to be on the grid behind, the
 * figure flew to that tile. Paging just swaps the `<Image>` inside a figure that
 * is already where it belongs.
 *
 * ===========================================================================
 * IT IS A DIALOG, SO IT BEHAVES LIKE ONE
 * ===========================================================================
 *
 * Escape closes; the backdrop closes; focus moves in on open and returns to the
 * tile that opened it on close; Tab is trapped inside while it is up; arrow
 * keys page within the sub-category. None of that is optional for something
 * that covers the page — a lightbox you cannot leave from the keyboard is a
 * trap, and the tile that opened it is the only sensible place to put focus
 * back, because that is where the reader's attention already is.
 *
 * Body scroll is locked while open: a dialog whose background scrolls under it
 * reads as broken, and on touch it steals the gesture that is trying to swipe.
 */
/**
 * The transform that parks the full-size figure on its tile.
 *
 * ⚠ ONE `scale`, NOT `scaleX` AND `scaleY`. Matching the tile's box exactly
 * needs two different factors — a 339x385 tile against a 1325x792 figure is
 * 0.32 by 0.53 — and a non-uniform scale STRETCHES THE PHOTOGRAPH for the whole
 * 0.42s of the flight. (Framer's layout projection gets away with it by applying
 * the inverse scale to every child; a hand-rolled FLIP has no such machinery.)
 * So the figure scales uniformly and lands its CENTRE on the tile's centre: the
 * picture is never distorted, and it still visibly grows out of that slot, which
 * is the whole of what the interaction has to say.
 */
type Flip = { x: number; y: number; scale: number };

/** Seconds. The expansion, and the collapse back into the grid. */
const GROW = 0.42;
const SHRINK = 0.3;

export function Lightbox({
  images,
  index,
  alts,
  labels,
  opener,
  onClose,
  onStep,
}: {
  images: GalleryImage[];
  /** `null` = closed. */
  index: number | null;
  alts: Record<string, string>;
  labels: { close: string; prev: string; next: string };
  /**
   * The tile that opened this — the box the figure grows out of.
   *
   * A REF OBJECT, NOT A CALLBACK. A callback prop is a new identity on every
   * parent render, so listing it in the FLIP's deps would replay the expansion
   * whenever anything above re-rendered, and omitting it would be a lint error
   * over a stale closure. The shell already holds this exact ref for focus
   * restore, and a ref is stable by construction.
   */
  opener?: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const { reduce } = useMotionConfig();
  const panelRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const figure = useAnimationControls();
  /** The measured start transform, kept so `exit` can run it in reverse. */
  const [flip, setFlip] = useState<Flip | null>(null);
  const open = index !== null;
  const image = open ? images[index] : undefined;

  /** Keyboard: escape, arrows, and a Tab trap. */
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        // RTL reverses which arrow means "forward" — read the document rather
        // than assuming, so the keyboard matches what the eye expects.
        const rtl = document.documentElement.dir === "rtl";
        const forward = rtl ? e.key === "ArrowLeft" : e.key === "ArrowRight";
        onStep(forward ? 1 : -1);
        return;
      }
      if (e.key !== "Tab") return;
      // THE TRAP. Three controls, all inside the panel; without this, Tab walks
      // out into the page underneath, which is still rendered and still
      // focusable behind an opaque backdrop.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>("button");
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [open, onClose, onStep],
  );

  /**
   * THE EXPANSION. Measure the tile and the figure's final box, put the figure
   * on the tile, then let it travel.
   *
   * `useLayoutEffect` and `controls.set()` are both load-bearing: they apply
   * before the browser paints, so the figure is never seen at full size for a
   * frame. Doing this with an `initial` prop cannot work — the final box is only
   * knowable once the figure is in the document.
   *
   * ⚠ DEPS ARE `open` AND `reduce` ONLY. Adding `index` would re-run the whole
   * expansion on every arrow-key page, which is the bug the layoutId version
   * had. Paging changes the picture inside a figure that is already in place.
   */
  useLayoutEffect(() => {
    if (!open) return;
    const el = figureRef.current;
    const from = opener?.current?.getBoundingClientRect();
    const to = el?.getBoundingClientRect();
    // No tile to grow from (keyboard-opened after a re-render, or a zero-sized
    // measurement mid-layout), and reduced motion, both land here: the figure
    // simply appears at full size, which the backdrop's fade already covers.
    if (reduce || !from || !to || !from.width || !from.height || !to.width || !to.height) {
      setFlip(null);
      figure.set({ x: 0, y: 0, scale: 1 });
      return;
    }
    const f: Flip = {
      // Centre onto centre — `x`/`y` translate before the scale, which is about
      // the element's own middle, so this is the offset between the two centres.
      x: from.left + from.width / 2 - (to.left + to.width / 2),
      y: from.top + from.height / 2 - (to.top + to.height / 2),
      // `min`, so the shrunk figure starts INSIDE its tile rather than
      // overhanging it on the axis the two boxes disagree about.
      scale: Math.min(from.width / to.width, from.height / to.height),
    };
    setFlip(f);
    figure.set(f);
    figure.start({
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: GROW, ease: [...ease.zoom] },
    });
  }, [open, reduce, opener, figure]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the panel itself rather than the close button: the reader opened a
    // picture, so the picture is what should be announced, not "Close".
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onKeyDown]);

  return (
    <AnimatePresence>
      {open && image && (
        <motion.div
          className="gl-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          onClick={onClose}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={alts[image.altKey] ?? ""}
            tabIndex={-1}
            className="gl-lightbox-panel"
            // The panel swallows clicks so only the backdrop closes. Without
            // this, clicking the picture you just opened closes it again.
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              ref={figureRef}
              className="gl-lightbox-figure"
              animate={figure}
              // Back into the tile it came from. The grid behind has not moved
              // while the dialog was up, so the measurement is still true.
              exit={
                flip
                  ? { ...flip, opacity: 0, transition: { duration: SHRINK, ease: [...ease.zoom] } }
                  : { opacity: 0, transition: { duration: reduce ? 0 : 0.2 } }
              }
            >
              <Image
                src={image.src}
                alt={alts[image.altKey] ?? ""}
                fill
                sizes="92vw"
                className={isCutout(image.src) ? "object-contain" : "object-contain"}
                priority
              />
            </motion.div>

            <button type="button" className="gl-lightbox-close" onClick={onClose}>
              <span className="sr-only">{labels.close}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Paging within the sub-category. Wrapping is handled by the
                caller, so these are always enabled and never dead-end. */}
            <button
              type="button"
              className="gl-lightbox-nav gl-lightbox-prev"
              onClick={() => onStep(-1)}
            >
              <span className="sr-only">{labels.prev}</span>
              <Chevron dir="prev" />
            </button>
            <button
              type="button"
              className="gl-lightbox-nav gl-lightbox-next"
              onClick={() => onStep(1)}
            >
              <span className="sr-only">{labels.next}</span>
              <Chevron dir="next" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "next" ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
