"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Photo } from "@/components/ui/Photo";
import { PentagonClip } from "@/components/brand/geometry";
import { useMotionConfig } from "@/components/motion/useMotionConfig";

/**
 * The About photo cluster: a pentagon, and a rectangular card that travels
 * across it as the section scrolls.
 *
 * WHAT THIS REPLACES. The card used to be a static square tucked behind the
 * pentagon's bottom corner, desktop-only, at -z-1. It read as a mistake —
 * a second photo that had failed to line up rather than a composition — and
 * on a phone it did not exist at all, which left the whole right-hand column
 * as one still image.
 *
 * WHAT IT DOES NOW. The card is scrubbed to the cluster's pass through the
 * viewport: it swings from -8° to +5°, travels across and up, and — the part
 * that makes it read as deliberate — its z-index FLIPS at 55% of the transit,
 * so it visibly passes IN FRONT of the pentagon partway through and settles
 * overlapping it. The pentagon drifts gently the other way, so the two move
 * against each other instead of together.
 *
 * The z-flip is a step, not a tween, and it has to be: z-index is not
 * interpolable in a way that means anything, and the moment of passing in
 * front should be a moment rather than a fade. 0.55 puts it just past the
 * middle of the transit — late enough to be a change rather than the opening
 * state, early enough that the settled overlap is what you are left looking at.
 *
 * IT EXISTS ON MOBILE NOW, smaller. On a phone there is no hover anywhere on
 * this page, so scroll-linked motion is the only thing that can make a section
 * feel alive — dropping it at the breakpoint would remove the animation from
 * the only context that has nothing else.
 *
 * Reduced motion gets the END pose, static: card in front, +5°, overlapping.
 * That is a composition someone chose, which is the point — not the start of
 * an animation that never plays.
 */
export function AboutCluster({
  pentagon,
  card,
}: {
  pentagon: { src: string; alt: string };
  card: { src: string; alt: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { dir, reduce } = useMotionConfig();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // `dir` mirrors the horizontal travel so the card crosses the pentagon in
  // the reading direction under RTL rather than retreating out of the frame.
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-10 * dir}%`, `${16 * dir}%`],
  );
  const y = useTransform(scrollYProgress, [0, 1], ["12%", "-22%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 5]);
  const zIndex = useTransform(scrollYProgress, (p) => (p > 0.55 ? 2 : 0));
  // The card's lift grows as it comes forward — a shadow that never changes
  // while the thing casting it visibly moves in front is the tell.
  const boxShadow = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    [
      "0 8px 20px rgb(12 26 19 / 0.10)",
      "0 18px 40px rgb(12 26 19 / 0.20)",
      "0 26px 60px rgb(12 26 19 / 0.26)",
    ],
  );
  const pentagonY = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);

  const cardFrame = {
    // A 6px flat frame — the card reads as a print laid on the page rather
    // than a second window cut into it, which is what makes the overlap look
    // intentional instead of like two photos colliding.
    padding: 6,
    background: "var(--white-500)",
    borderRadius: "var(--radius-image)",
  } as const;

  const cardBox =
    "absolute w-[36%] nav:w-[42%] bottom-[-10%] [inset-inline-end:-8%]";

  if (reduce) {
    return (
      <div className="relative">
        <div className="relative z-[1]">
          <PentagonClip
            variant="photo"
            ringColor="var(--color-surface-2)"
            style={{ boxShadow: "var(--shadow-pentagon)" }}
          >
            <Photo src={pentagon.src} alt={pentagon.alt} ratio="pentagon" />
          </PentagonClip>
        </div>
        <div
          className={cardBox}
          style={{
            ...cardFrame,
            zIndex: 2,
            rotate: "5deg",
            boxShadow: "0 26px 60px rgb(12 26 19 / 0.26)",
          }}
        >
          <Photo src={card.src} alt={card.alt} ratio="square" />
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <motion.div className="relative z-[1]" style={{ y: pentagonY }}>
        <PentagonClip
          variant="photo"
          ringColor="var(--color-surface-2)"
          style={{ boxShadow: "var(--shadow-pentagon)" }}
        >
          <Photo src={pentagon.src} alt={pentagon.alt} ratio="pentagon" />
        </PentagonClip>
      </motion.div>

      <motion.div
        className={cardBox}
        style={{ ...cardFrame, x, y, rotate, zIndex, boxShadow }}
      >
        <Photo src={card.src} alt={card.alt} ratio="square" />
      </motion.div>
    </div>
  );
}
