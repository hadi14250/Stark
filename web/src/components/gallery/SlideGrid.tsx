import type { Slide } from "@/lib/gallery/types";
import { themeVars } from "@/lib/gallery/theme";
import type { CellId, PushDir } from "@/lib/gallery/transitions/core";
import { ImageCard } from "./cards";
import PushCard from "./PushCard";

/**
 * The slide layout. The grid FRAME is fixed; each card runs its own transition
 * when the active slide changes (see PushCard). The dir passed here is the
 * original's declared per-card map — it is the FALLBACK for standalone use;
 * with the TransitionProvider present, PushCard reads the LIVE direction map
 * from the config store via its cellId.
 *
 * ===========================================================================
 * THE LAYOUT IS UNTOUCHED. THE CONTENTS ARE ALL PICTURES.
 * ===========================================================================
 *
 * Three of these eight slots held copy — `intro` a headline and paragraph,
 * `explore` and `stay` a label and a line each, and `cuisine` was copy above a
 * photo. The review replaced them with pictures "the same size", so the cells,
 * their classes, their grid positions and their push directions are all exactly
 * what they were; only what sits inside them changed. That is deliberate: the
 * bento proportions are the design, and they are what the client asked to keep.
 *
 * `cellId` is what binds a slot to its direction and its shader texture, so the
 * names stay even where they no longer describe the content — see types.ts.
 */
export default function SlideGrid({
  slide,
  controls,
  reverse = false,
  onOpen,
}: {
  slide: Slide;
  controls: React.ReactNode;
  /** fallback reverse flag (standalone use — the provider overrides it) */
  reverse?: boolean;
  /** Opens the lightbox at the given index within the sub-category. */
  onOpen?: (index: number, el: HTMLButtonElement) => void;
}) {
  const key = slide.id;
  // Per-card push direction. The slide's palette rides each moving layer
  // (PushCard `style`) so exiting cards keep their OLD colors while sliding
  // out instead of re-resolving against the already-flipped stage vars.
  const palette = themeVars(slide.theme);
  const P = (
    dir: PushDir,
    cellId: CellId,
    className: string,
    node: React.ReactNode
  ) => (
    <PushCard
      contentKey={key}
      dir={dir}
      reverse={reverse}
      cellId={cellId}
      className={className}
      style={palette}
    >
      {node}
    </PushCard>
  );

  /**
   * The slot's picture, wired to the lightbox at its own index.
   *
   * The index is the slot's position in the manifest — `toSlide` fills the
   * slots in manifest order — so opening the fifth slot opens the lightbox on
   * the fifth picture, and paging from there walks the sub-category's full set
   * rather than only the eight on screen.
   */
  const cell = (i: number, src: string, className: string) => (
    <ImageCard
      src={src}
      alt={slide.alt}
      className={className}
      onOpen={(el) => onOpen?.(i, el)}
    />
  );

  return (
    <div className="grid">
      {/* COLUMN 1 */}
      <div className="col col1">
        {P("right", "hero", "cell-hero", cell(0, slide.heroImage, "hero"))}
        <div className="introrow">
          {P("left", "intro", "cell-intro", cell(1, slide.introImage, "introcard"))}
          {P("up", "portraitA", "cell-portraitA", cell(2, slide.portraitA, "portraitA"))}
        </div>
        {/* controls bar — Previous | Next, each transitioning on its own;
            SliderControls owns those inner PushCards. This div is just the
            grid cell + bottom-pinning wrapper. */}
        <div className="cell-controls">{controls}</div>
      </div>

      {/* COLUMNS 2 + 3 — on desktop they are two of the three grid columns;
          on mobile the .masonry wrapper sits them side by side as the lower
          two-column bento (each stack flows at its own height). */}
      <div className="masonry">
        {/* COLUMN 2 */}
        <div className="col col2">
          {P("down", "explore", "cell-explore", cell(3, slide.exploreImage, "explore"))}
          {P("right", "blossom", "cell-blossom", cell(4, slide.blossom, "blossom"))}
          {P("up", "stay", "cell-stay", cell(5, slide.stayImage, "stay"))}
        </div>

        {/* COLUMN 3 */}
        <div className="col col3">
          {P("down", "portraitB", "cell-portraitB", cell(6, slide.portraitB, "portraitB"))}
          {P("left", "cuisine", "cell-cuisine", cell(7, slide.cuisineImage, "cuisine"))}
        </div>
      </div>
    </div>
  );
}
