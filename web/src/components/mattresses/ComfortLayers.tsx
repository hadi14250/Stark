"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useMotionConfig } from "@/components/motion/useMotionConfig";

export type Layer = { title: string; body: string };

/**
 * THE PAGE'S SET-PIECE — a mattress cross-section that comes apart as you
 * scroll, and puts itself back together as you scroll back.
 *
 * The page needed one thing that is only on this page, the way Home has the
 * Process stage and Woodworks has the chapter index. This is it: four bands
 * stacked into a mattress, which separate on scroll so each layer can be
 * labelled and read, then close again.
 *
 * DRAWN IN CSS, NOT PHOTOGRAPHED. A real cut-through of a STARK mattress is a
 * photograph nobody has taken, and a stock one would be a different company's
 * product presented as ours — the one thing this project must never do. A
 * diagram states the construction without claiming to BE a specific product,
 * cannot go stale when the range changes, and needs no licence. The bands carry
 * no dimensions and no material names beyond the copy, which is qualitative.
 *
 * THE RESTING STATE IS THE ASSEMBLED MATTRESS, AND THE SCRUB ONLY PUSHES APART.
 * That direction is not an aesthetic preference. A scrub is bound to scroll
 * POSITION, so unlike every reveal on this site it has no fail-safe and cannot
 * be given one — if progress is stuck at 0 forever, whatever 0 looks like is
 * what ships. At 0 this is a mattress with four labelled layers beside it,
 * which is the section working. Had the exploded view been the resting state, a
 * stalled scrub would ship a pile of loose rectangles. This codebase has
 * shipped a section that was present in the DOM and wrong on screen; the rule
 * taken from it is that nothing may depend on an animation running in order to
 * be right.
 *
 * REDUCED MOTION GETS THE EXPLODED VIEW, STATICALLY. Someone who has asked for
 * less movement should not lose the information the movement was carrying —
 * they get the separated diagram with every label legible, just without the
 * travel.
 */
export function ComfortLayers({ layers }: { layers: Layer[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduce } = useMotionConfig();

  /**
   * Measured across the section's own transit rather than the viewport's, and
   * ending at "center center" so the stack is fully open while the section is
   * the thing being looked at, instead of finishing after it has left.
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "center center"],
  });

  // A spring so the bands settle rather than tracking the wheel exactly —
  // a 1:1 scrub on a soft object reads mechanical.
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <div
      ref={ref}
      className="mt-[clamp(36px,5vw,72px)] grid items-center gap-[clamp(32px,5vw,72px)] nav:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
    >
      {/* ---- the diagram ---- */}
      <div className="mt-stack" aria-hidden>
        {layers.map((l, i) => (
          <Band key={l.title} index={i} count={layers.length} progress={progress} reduce={reduce} />
        ))}
      </div>

      {/* ---- the labels ----
          A real list, in the same order as the bands, carrying all of the
          section's information. The diagram is aria-hidden precisely because
          this exists: a screen reader gets the content once, in prose, rather
          than four unlabelled boxes. */}
      <ol className="flex flex-col">
        {layers.map((l, i) => (
          <li
            key={l.title}
            className="border-t py-[clamp(14px,1.8vw,22px)]"
            style={{ borderColor: "var(--color-line)" }}
          >
            <h3 className="flex items-baseline gap-3 font-display text-h4 font-semibold text-[color:var(--color-ink)]">
              <span
                className="font-mono text-[11px] tabular-nums"
                style={{ color: "var(--color-accent)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.title}
            </h3>
            <p className="mt-2 max-w-[46ch] text-body-sm leading-body text-[color:var(--color-ink-body)]">
              {l.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * One band.
 *
 * Height and tint vary by index so the stack reads as a real construction —
 * a thin quilted top, a deeper comfort layer, the spring core, then the base —
 * rather than four identical bars. The top band is lightest and they deepen
 * downward, which is how a section drawing of anything layered reads.
 */
function Band({
  index,
  count,
  progress,
  reduce,
}: {
  index: number;
  count: number;
  progress: ReturnType<typeof useSpring>;
  reduce: boolean;
}) {
  /**
   * Travel is symmetric around the stack's middle: the top bands rise, the
   * bottom bands fall, and the whole thing opens from its centre rather than
   * sliding downward as a group.
   */
  const centre = (count - 1) / 2;
  const offset = (index - centre) * 34;
  const y = useTransform(progress, [0, 1], [0, offset]);

  /**
   * Heights and tints are the drawing. A thin quilted top, a deeper comfort
   * layer, the spring core as the thickest band, then the base.
   *
   * The tints deepen downward toward the brand green, which is how a section
   * drawing of anything layered reads — light at the surface you touch, solid
   * at the structure underneath. The first version stepped from 92% white to
   * 88% white across the top two bands, which at this page's luminance was no
   * step at all: the diagram came out as four white pills with hairlines.
   */
  const HEIGHTS = ["13%", "21%", "40%", "26%"];
  const TINTS = [
    "color-mix(in srgb, var(--color-accent) 34%, var(--color-surface))",
    "color-mix(in srgb, var(--color-accent) 72%, var(--color-surface))",
    "color-mix(in srgb, var(--color-ink) 24%, var(--color-accent))",
    "color-mix(in srgb, var(--color-ink) 62%, var(--color-accent))",
  ];

  const style = {
    height: HEIGHTS[index % HEIGHTS.length],
    minHeight: 34,
    background: TINTS[index % TINTS.length],
  };

  if (reduce) {
    // Static exploded view — the information without the travel.
    return (
      <div
        className="mt-band"
        style={{ ...style, transform: `translateY(${offset}px)` }}
      />
    );
  }

  return <motion.div className="mt-band" style={{ ...style, y }} />;
}
