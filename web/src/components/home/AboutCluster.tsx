"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Photo } from "@/components/ui/Photo";
import { PentagonClip } from "@/components/brand/geometry";
import { useMotionConfig } from "@/components/motion/useMotionConfig";

/**
 * The About photo cluster: a pentagon and a rectangular card, orbiting each
 * other as the section scrolls.
 *
 * WHAT THIS REPLACED, TWICE. First a static square tucked behind the pentagon's
 * bottom corner, desktop-only — it read as a mistake rather than a composition.
 * Then a card that travelled across the pentagon on a straight diagonal, which
 * was better but still one object moving past another stationary one.
 *
 * THE CLIENT ASKED FOR AN ORBIT: "make them rotate around each other while
 * scrolling." So both elements are now on a shared circular path, 180° apart —
 * the card sweeps around one side while the pentagon drifts the other way, and
 * because they are always opposite each other the composition stays balanced at
 * every scroll position rather than bunching up at one end.
 *
 * HOW IT IS BUILT. `angle` runs from -0.55π to 0.75π over the section's transit
 * — about three quarters of a turn, not a full one. A full revolution would
 * return both elements to exactly where they started, so the whole effect would
 * cancel out for anyone who scrolled past and looked at the end state; three
 * quarters means the cluster arrives somewhere it did not begin.
 *
 * The two radii differ (the pentagon travels a third as far as the card),
 * which is what stops it reading as a fairground ride: the big shape holds the
 * composition while the small one does most of the moving. Same reason the
 * card counter-rotates against its own orbit rather than staying axis-aligned.
 *
 * `useSpring` smooths the whole thing. A raw scroll value on a circular path
 * is where wheel-notch stepping becomes obvious, because the eye tracks a
 * curve far better than it tracks a straight line.
 *
 * THE Z-FLIP STAYS, and it is a step rather than a tween on purpose: z-index
 * does not interpolate into anything meaningful, and the moment of passing in
 * front should be a moment. It now fires at the point in the orbit where the
 * card is crossing the pentagon's face, which is what makes the two read as
 * occupying the same space rather than as two layers.
 *
 * `dir` mirrors the orbit's direction so it sweeps the reading way under RTL.
 *
 * REDUCED MOTION gets the end pose, static: card in front, overlapping, tilted.
 * That is a composition someone chose — not the first frame of an animation
 * that never plays.
 */

/** Where the orbit starts and ends, in radians. Just under one turn. */
const ANGLE_FROM = -0.55 * Math.PI;
const ANGLE_TO = 0.75 * Math.PI;

/** Card orbit radius, in % of the cluster box. The pentagon uses a third. */
const CARD_R = 13;
const PENTAGON_R = CARD_R / 3;

export function AboutCluster({
  pentagon,
  card,
}: {
  pentagon: { src: string; alt: string };
  card: { src: string; alt: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { dir, reduce } = useMotionConfig();

  /**
   * `start 82%` rather than `start end`.
   *
   * The client's note was that "the pentagon picture should slide in when we
   * reach that section, not before". With the scrub anchored at `start end` it
   * begins the instant the cluster's top edge touches the bottom of the
   * viewport — so by the time the section is actually being looked at, the
   * orbit is already a third of the way through and the reader only ever sees
   * the tail of it. Starting at 82% of the viewport height holds the opening
   * pose until the cluster is properly on screen.
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 82%", "end start"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.001,
  });

  const angle = useTransform(progress, [0, 1], [ANGLE_FROM, ANGLE_TO]);

  // Opposite ends of the same diameter: cos/sin for the card, negated for the
  // pentagon. One `angle` drives both, so they cannot drift out of phase.
  const cardX = useTransform(angle, (a) => `${Math.cos(a) * CARD_R * dir}%`);
  const cardY = useTransform(angle, (a) => `${Math.sin(a) * CARD_R}%`);
  const pentagonX = useTransform(angle, (a) => `${-Math.cos(a) * PENTAGON_R * dir}%`);
  const pentagonY = useTransform(angle, (a) => `${-Math.sin(a) * PENTAGON_R}%`);

  // Counter-rotation: the card leans against its own travel instead of riding
  // the circle like a carriage, which is what keeps it reading as a print
  // being moved rather than as an object on a track.
  const cardRotate = useTransform(progress, [0, 1], [-9 * dir, 6 * dir]);

  // In front once it has swung across the pentagon's face.
  const zIndex = useTransform(progress, (p) => (p > 0.5 ? 2 : 0));
  const boxShadow = useTransform(
    progress,
    [0, 0.5, 1],
    [
      "0 8px 20px rgb(12 26 19 / 0.10)",
      "0 18px 40px rgb(12 26 19 / 0.20)",
      "0 26px 60px rgb(12 26 19 / 0.26)",
    ],
  );

  const cardFrame = {
    // A 6px flat frame — the card reads as a print laid on the page rather
    // than a second window cut into it, which is what makes the overlap look
    // intentional instead of like two photos colliding.
    padding: 6,
    background: "var(--white-500)",
    borderRadius: "var(--radius-image)",
  } as const;

  const cardBox =
    "absolute w-[36%] nav:w-[42%] bottom-[-6%] [inset-inline-end:-6%]";

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
            rotate: `${6 * dir}deg`,
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
      <motion.div className="relative z-[1]" style={{ x: pentagonX, y: pentagonY }}>
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
        style={{
          ...cardFrame,
          x: cardX,
          y: cardY,
          rotate: cardRotate,
          zIndex,
          boxShadow,
        }}
      >
        <Photo src={card.src} alt={card.alt} ratio="square" />
      </motion.div>
    </div>
  );
}
