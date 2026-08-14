"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { MarkGlyph } from "@/components/brand/geometry";
import { useMotionConfig } from "@/components/motion/useMotionConfig";

/**
 * The vertical rule that draws itself down Capabilities as you scroll, with a
 * pentagon riding its tip.
 *
 * WHY THIS EXISTS. Every reveal on the site is a TRIGGER: it fires once when an
 * element enters the viewport and then it is over, so the page only moves in
 * the instants you happen to cross a boundary. In between, scrolling does
 * nothing at all — and that is precisely what "simple" meant. Three bands that
 * each blink into place and then sit there. A SCRUBBED element is the opposite:
 * it is bound to scroll POSITION, so it moves on every frame you do, and the
 * section reads as one continuous drawing being made rather than three
 * independent things arriving.
 *
 * It is one line and one glyph. That is deliberate — this is the connective
 * tissue between the bands, not a fourth thing competing with them.
 *
 * SCROLL RANGE. `["start 85%", "end 55%"]` rather than the full transit: the
 * draw should COMPLETE at the last band instead of still being three-quarters
 * done when the section leaves, and it should not begin before the section is
 * genuinely on screen. A full-transit mapping leaves the pentagon at the
 * halfway mark while the reader is looking at the last band, which reads as a
 * bug rather than as a device.
 *
 * DESKTOP ONLY, and not for the usual reason. On a phone the bands stack into a
 * single full-width column, and a rule running down the outside of stacked
 * full-width cards has nothing to connect — it is a line next to a list. The
 * mobile equivalent of this section's life is the per-band motion (the wipes,
 * the parallax, the ordinals), which is why none of THOSE are width-gated.
 */
export function CapabilitySpine() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduce } = useMotionConfig();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 55%"],
  });

  // Raw scroll progress is exact but jittery on trackpads and stepped on mouse
  // wheels. The spring costs nothing here (one value, no layout work) and is
  // the difference between the pentagon gliding and the pentagon stuttering.
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  const top = useTransform(p, [0, 1], ["0%", "100%"]);
  // A quarter turn on the way down, so it is not a static shape being dragged
  // along a line.
  const rotate = useTransform(p, [0, 1], [0, 90]);
  // Fades up over the first few percent instead of popping in at full strength
  // on the first pixel of scroll.
  const glyphOpacity = useTransform(p, [0, 0.04], [0, 1]);

  if (reduce) {
    // The finished drawing, held still: line complete, pentagon landed at the
    // end of it. Reduced motion means no movement, not no composition.
    return (
      <SpineFrame>
        <div className="absolute inset-0" style={{ background: "var(--color-accent)" }} />
        {/* ⚠ THE TWO OFFSETS ARE DERIVED FROM `size`, so they move with it.
            The glyph is centred on a 1px rule: half its width back along the
            inline axis (28/2 = 14, less the rule's own half-pixel = 13.5) and
            half its height up. It went 18 → 28 with every other bullet-scale
            mark on the site; leaving the offsets at the 18px values would have
            hung it off the side of its own line. */}
        <MarkGlyph
          division="stark"
          size={28}
          color="var(--color-accent)"
          style={{ position: "absolute", bottom: 0, insetInlineStart: "-13.5px" }}
        />
      </SpineFrame>
    );
  }

  return (
    <SpineFrame trackRef={ref}>
      {/* The undrawn remainder. Faint, but present from the start — without it
          the pentagon appears to travel through empty space rather than along
          a path that was always there. */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--color-ink)", opacity: 0.1 }}
      />

      <motion.div
        className="absolute inset-0 origin-top"
        style={{ background: "var(--color-accent)", scaleY: p }}
      />

      <motion.div
        style={{
          position: "absolute",
          top,
          insetInlineStart: "-13.5px",
          opacity: glyphOpacity,
        }}
      >
        <motion.div style={{ rotate, marginTop: "-14px" }}>
          <MarkGlyph division="stark" size={28} color="var(--color-accent)" />
        </motion.div>
      </motion.div>
    </SpineFrame>
  );
}

/**
 * Puts the 1px rule in the gutter, OUTSIDE the content column.
 *
 * The bands each render their own <Container>, so the spine reproduces that
 * container's geometry — same max-width, same fluid padding, same auto margins
 * — and then steps back off the content edge. Written out as a class string
 * rather than by rendering <Container> because the padded box itself needs
 * `relative` to hang the rule off, and Container takes no style.
 *
 * ⚠ IT USED TO SIT EXACTLY ON THE CONTENT EDGE, i.e. flush against the start of
 * every heading, paragraph and ordinal in the section — a zero-pixel gap. The
 * client raised it twice, and both times the words were "the line is too close
 * to the text". A rule that shares an edge with the type does not read as a
 * spine connecting the bands; it reads as a border someone forgot to pad, or
 * as a text cursor.
 *
 * So it now sits `--spine-gap` back from the content edge, in the page margin
 * where the connective tissue belongs. The gap scales with the gutter, so it is
 * ~19px at the `nav:` breakpoint and ~32px on a wide display — always clearly
 * separate from the column, never far enough to look unrelated to it.
 *
 * The gap is subtracted from the padding rather than being a fixed inset, so
 * the rule can never end up off the left of the viewport: at the narrowest
 * width the padding is 43px and the gap 19px, leaving the rule at 24px with the
 * glyph's own -8.5px offset still comfortably on screen.
 *
 * `trackRef` goes on the OUTER box on purpose: it is the element that spans the
 * whole bands stack, so it is the correct thing to measure scroll progress
 * against. The rule inside it is 1px wide and would measure nothing useful.
 */
function SpineFrame({
  children,
  trackRef,
}: {
  children: ReactNode;
  trackRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={trackRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden nav:block"
      style={
        {
          "--spine-pad": "clamp(24px, 5vw, 72px)",
          "--spine-gap": "clamp(19px, 2.2vw, 32px)",
        } as React.CSSProperties
      }
    >
      <div className="relative mx-auto h-full w-full max-w-[1440px] px-[var(--spine-pad)]">
        <div
          className="absolute inset-y-0 w-px"
          style={{ insetInlineStart: "calc(var(--spine-pad) - var(--spine-gap))" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
