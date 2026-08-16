"use client";

import { motion } from "framer-motion";
import { isCutout } from "@/components/mattresses/assets";

/**
 * One picture in one bento slot.
 *
 * ===========================================================================
 * THERE IS ONLY ONE CARD NOW
 * ===========================================================================
 *
 * There were four: `HeroCard` (photo with the project title and subtitle
 * overlaid bottom-left), `TextCard` (a coloured card of label / headline /
 * body / line), `CuisineCard` (a hybrid — copy on top, photo pinned beneath),
 * and `ImageCard`. The review collapsed them into the last one: "remove all
 * text and put pictures … if there's only a text container replace it with a
 * picture that's the same size".
 *
 * The per-line entrance machinery went with them. Each text line used to sit in
 * its own `.tmask` (overflow:hidden) so copy emerged from its own edge rather
 * than appearing mid-air — a mini-push inside the card, driven by `useTextEnter`
 * in textMotion.ts. With no text there is nothing to mask, and a photograph
 * already gets its entrance from the card-level push in `PushCard`.
 *
 * ===========================================================================
 * EVERY TILE IS A BUTTON, AND THAT IS THE CLICK-TO-ENLARGE
 * ===========================================================================
 *
 * "When I click on a picture it should become bigger to preview it." A `<button>`
 * rather than a div with an onClick, so it is reachable by Tab, fires on Enter
 * and Space, and announces itself as actionable — the lightbox is the only way
 * to see a picture at size, so keyboard users cannot be locked out of it.
 *
 * `layoutId` pairs the tile with the lightbox figure, which is what makes the
 * picture grow out of its own slot instead of fading in over the middle of the
 * screen. It is dropped under reduced motion: a full-screen shared-layout
 * animation is exactly the kind of large-area movement that setting asks for
 * less of.
 */
export function ImageCard({
  src,
  alt,
  className,
  onOpen,
  reduce,
}: {
  src: string;
  alt: string;
  /** The bento slot — `hero`, `blossom`, `portraitA` … Drives the CSS. */
  className: string;
  onOpen?: (el: HTMLButtonElement) => void;
  reduce?: boolean;
}) {
  // A cut-out is a product on a flat ground, not a photograph: it must be
  // contained inside the slot rather than cropped to fill it, or the mattress
  // loses its own edges — which is the whole point of a cut-out.
  const cut = isCutout(src);

  return (
    <button
      type="button"
      className={`card image hoverable ${className}${cut ? " cutout" : ""}`}
      onClick={(e) => onOpen?.(e.currentTarget)}
    >
      {/* The accessible name. Not rendered — see the note on `alt` in types.ts. */}
      <span className="sr-only">{alt}</span>
      <motion.img
        layoutId={reduce ? undefined : `gl-${src}`}
        draggable={false}
        className={`photo${cut ? " contain" : ""}`}
        src={src}
        alt=""
      />
    </button>
  );
}
