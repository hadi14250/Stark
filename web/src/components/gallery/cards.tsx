"use client";

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
 * ===========================================================================
 * ⚠ THE PICTURE IS A PLAIN <img> AND MUST STAY ONE. NO FRAMER IN THIS TILE.
 * ===========================================================================
 *
 * It was briefly a `motion.img` carrying `layoutId={`gl-${src}`}`, so the tile
 * could pair with the lightbox figure and grow out of its own slot. That shipped
 * and the client reported the push transition as broken within the day: "they
 * shrink to the corner and the new picture slides in from a fucked up place
 * slowly", and — the detail that gives it away — "not all pictures are the same
 * animation".
 *
 * WHY ONLY SOME. The layoutId was keyed on the image URL, and the placeholder
 * pool is shared between sub-categories by a rotating offset: loose-furniture is
 * POOL[0..7], doors is POOL[3..10]. So every adjacent woodworks tab shares FIVE
 * of its eight pictures with its neighbour, AT DIFFERENT SLOT POSITIONS. On Next,
 * Framer sees one layoutId unmount at `cell-explore` and mount at `cell-hero`,
 * and runs a shared-layout transition across the grid on its own spring — while
 * the 1.2s quartic push is running underneath it. The three tiles with no
 * counterpart pushed correctly, which is exactly what the client described, and
 * blue↔siesta (no shared URLs anywhere) looked right throughout.
 *
 * A layout-projected node inside a card that is itself being translated ±100% is
 * a fight this cannot win, and re-keying the layoutId per slot would only make
 * the collision rarer. So the expansion moved to `Lightbox`, which does the same
 * FLIP against this button's own rect from outside the stage, where it cannot
 * touch the push. See the note there before reintroducing anything animated here.
 */
export function ImageCard({
  src,
  alt,
  className,
  onOpen,
}: {
  src: string;
  alt: string;
  /** The bento slot — `hero`, `blossom`, `portraitA` … Drives the CSS. */
  className: string;
  onOpen?: (el: HTMLButtonElement) => void;
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
      <img
        draggable={false}
        className={`photo${cut ? " contain" : ""}`}
        src={src}
        alt=""
      />
    </button>
  );
}
