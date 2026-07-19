import type { Slide } from "@/lib/gallery/types";
import { themeVars } from "@/lib/gallery/theme";
import type { CellId, PushDir } from "@/lib/gallery/transitions/core";
import { HeroCard, ImageCard, TextCard, CuisineCard } from "./cards";
import PushCard from "./PushCard";

/**
 * The slide layout. The grid FRAME is fixed; each card runs its own
 * transition when the active slide changes (see PushCard). The dir passed
 * here is the original's declared per-card map — it is the FALLBACK for
 * standalone use; with the editor's TransitionProvider present, PushCard
 * reads the LIVE direction map from the config store via its cellId.
 */
export default function SlideGrid({
  slide,
  controls,
  reverse = false,
}: {
  slide: Slide;
  controls: React.ReactNode;
  /** fallback reverse flag (standalone use — the provider overrides it) */
  reverse?: boolean;
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

  return (
    <div className="grid">
      {/* COLUMN 1 */}
      <div className="col col1">
        {P("right", "hero", "cell-hero", <HeroCard slide={slide} />)}
        <div className="introrow">
          {P(
            "left",
            "intro",
            "cell-intro",
            <TextCard
              className="introcard"
              headline={slide.headline}
              body={slide.paragraph}
            />
          )}
          {P(
            "up",
            "portraitA",
            "cell-portraitA",
            <ImageCard src={slide.portraitA} alt={slide.city} className="portraitA" />
          )}
        </div>
        {/* controls bar — its two halves (CTA / prev-next) each transition on
            their own; SliderControls owns those inner PushCards. This div is
            just the grid cell + bottom-pinning wrapper. */}
        <div className="cell-controls">{controls}</div>
      </div>

      {/* COLUMNS 2 + 3 — on desktop they are two of the three grid columns;
          on mobile the .masonry wrapper sits them side by side as the lower
          two-column bento (each stack flows at its own height). */}
      <div className="masonry">
        {/* COLUMN 2 */}
        <div className="col col2">
          {P(
            "down",
            "explore",
            "cell-explore",
            <TextCard className="explore" label="Explore" line={slide.exploreLine} />
          )}
          {P(
            "right",
            "blossom",
            "cell-blossom",
            <ImageCard src={slide.blossom} alt={slide.city} className="blossom" />
          )}
          {P(
            "up",
            "stay",
            "cell-stay",
            <TextCard className="stay" label="Stay" line={slide.stayLine} />
          )}
        </div>

        {/* COLUMN 3 */}
        <div className="col col3">
          {P(
            "down",
            "portraitB",
            "cell-portraitB",
            <ImageCard src={slide.portraitB} alt={slide.city} className="portraitB" />
          )}
          {P("left", "cuisine", "cell-cuisine", <CuisineCard slide={slide} />)}
        </div>
      </div>
    </div>
  );
}
