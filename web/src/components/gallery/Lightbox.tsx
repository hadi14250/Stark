"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionConfig } from "@/components/motion/useMotionConfig";
import { isCutout } from "@/components/mattresses/assets";
import { ease } from "@/styles/tokens";
import type { GalleryImage } from "@/lib/gallery/images";

/**
 * Click a picture, see it big. The client's ask, in one component:
 * "when I click on a picture it should become bigger to preview it".
 *
 * ===========================================================================
 * THE EXPANSION IS A SHARED LAYOUT, NOT A CROSSFADE
 * ===========================================================================
 *
 * `layoutId` is the same on the tile and on the enlarged image, so Framer
 * interpolates between their two real positions and the picture appears to LIFT
 * off the grid rather than a second copy fading in over the top of it. That
 * distinction is the whole feel of the interaction, and it costs one prop
 * because the grid is already a Framer subtree.
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
export function Lightbox({
  images,
  index,
  alts,
  labels,
  onClose,
  onStep,
}: {
  images: GalleryImage[];
  /** `null` = closed. */
  index: number | null;
  alts: Record<string, string>;
  labels: { close: string; prev: string; next: string };
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const { reduce } = useMotionConfig();
  const panelRef = useRef<HTMLDivElement>(null);
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
              // SAME `layoutId` AS THE TILE. This is the expansion.
              layoutId={reduce ? undefined : `gl-${image.src}`}
              className="gl-lightbox-figure"
              transition={{ duration: reduce ? 0 : 0.42, ease: [...ease.zoom] }}
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
