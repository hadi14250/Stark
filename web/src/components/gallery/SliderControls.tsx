"use client";

import type { Slide } from "@/lib/gallery/types";
import { themeVars } from "@/lib/gallery/theme";
import PushCard from "./PushCard";

/**
 * The control bar: PREVIOUS and NEXT.
 *
 * ===========================================================================
 * WHAT PREV/NEXT MOVE THROUGH CHANGED. THE BUTTONS DID NOT.
 * ===========================================================================
 *
 * They used to page PROJECTS — the third level of tabs. The client asked for
 * two levels and for "the next and previous [to] move us through the subtab",
 * so they now page SUB-CATEGORIES: Doors → Built-in Joinery → Cladding, and on
 * past the end of Woodworks into blue rather than dead-ending.
 *
 * ===========================================================================
 * THE THIRD BUTTON IS GONE
 * ===========================================================================
 *
 * The bar was a 2-column grid: a filled CTA on the left reading "View details",
 * which opened the ten-field DetailOverlay, and PREVIOUS|NEXT on the right. The
 * review removed the overlay ("remove the view details button"), so the CTA has
 * nothing left to open. Its grid column goes with it — leaving an empty half-bar
 * would read as a card that failed to load. `.controls-wrap` handles the
 * one-child case; see gallery-stage.css.
 *
 * The slide's palette is stamped onto each PushCard's MOVING LAYER (the `style`
 * prop), NOT onto the shared .controls-wrap — per-layer palettes are what keep
 * the exiting buttons in the OLD slide's colors while they leave.
 *
 * Previous/Next each get their OWN PushCard (not one shared frame) so every
 * corner is clipped at the button's own radius mid-slide.
 */
export default function SliderControls({
  slide,
  contentKey,
  reverse = false,
  prevDisabled = false,
  nextDisabled = false,
  labels,
  onPrev,
  onNext,
}: {
  slide: Slide;
  /** changes when the slide changes — drives the inner transitions */
  contentKey: string | number;
  /** fallback reverse flag (standalone use — the provider overrides it) */
  reverse?: boolean;
  /** loop=false bounds: disable at the ends */
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  /**
   * Localised. These were the literal strings "Previous" and "Next" in the
   * markup, which shipped English into the Arabic build on every slide.
   */
  labels: { prev: string; next: string };
  onPrev: () => void;
  onNext: () => void;
}) {
  const palette = themeVars(slide.theme);
  return (
    <div className="controls-wrap controls-wrap--nav">
      {/* PREVIOUS | NEXT — drop in from the top, moving down */}
      <div className="cell-prevnext">
        <div className="prevnext">
          <PushCard
            contentKey={contentKey}
            dir="down"
            reverse={reverse}
            cellId="prevnext"
            className="cell-prev"
            style={palette}
          >
            <button
              type="button"
              className="btn ghost"
              disabled={prevDisabled}
              onClick={onPrev}
            >
              {labels.prev}
            </button>
          </PushCard>
          <PushCard
            contentKey={contentKey}
            dir="down"
            reverse={reverse}
            cellId="prevnext"
            className="cell-next"
            style={palette}
          >
            <button
              type="button"
              className="btn ghost"
              disabled={nextDisabled}
              onClick={onNext}
            >
              {labels.next}
            </button>
          </PushCard>
        </div>
      </div>
    </div>
  );
}
