"use client";

import type { Slide } from "@/lib/gallery/types";
import { themeVars } from "@/lib/gallery/theme";
import PushCard from "./PushCard";

/**
 * The three control buttons. The bar is a 2-column grid (CTA on the left,
 * PREVIOUS|NEXT on the right). Each half is its OWN PushCard so they can
 * transition from different directions (the original's declared map — the
 * fallback dirs below; the editor's live direction map overrides via cellId).
 *
 * The slide's palette is stamped onto each PushCard's MOVING LAYER (the
 * `style` prop), NOT onto the shared .controls-wrap — per-layer palettes are
 * what keep the exiting buttons in the OLD slide's colors while they leave.
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
  onCta,
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
  onCta: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const palette = themeVars(slide.theme);
  return (
    <div className="controls-wrap">
      {/* CTA — slides in from the left, moving right */}
      <PushCard
        contentKey={contentKey}
        dir="right"
        reverse={reverse}
        cellId="cta"
        className="cell-cta"
        style={palette}
      >
        <button className="btn cta" onClick={onCta}>
          <span className="cta-label">{slide.ctaLabel}</span>
        </button>
      </PushCard>

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
            <button className="btn ghost" disabled={prevDisabled} onClick={onPrev}>
              Previous
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
            <button className="btn ghost" disabled={nextDisabled} onClick={onNext}>
              Next
            </button>
          </PushCard>
        </div>
      </div>
    </div>
  );
}
