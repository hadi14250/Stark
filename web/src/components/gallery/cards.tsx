"use client";

import { motion } from "framer-motion";
import type { Slide } from "@/lib/gallery/types";
import { useTextEnter } from "./textMotion";

/**
 * Every animated line sits inside its own .tmask (overflow:hidden) — the
 * original gives each text layer its OWN mask, so copy emerges from its own
 * edge (a mini-push inside the card) instead of appearing mid-air or riding
 * in from the card's far edge. The mask div is a plain block, so it becomes
 * the flex/grid item in the text elements' place; the text keeps its class,
 * and since every line's spacing is a margin-top contained by the mask's BFC,
 * the layout is exactly what it was.
 *
 * See useTextEnter: enter from ±100% of the line's own box at a flat 250ms
 * delay, exit ±100% the other way — both clipped by the mask.
 */

/** Large hero image card with city title + subtitle overlaid bottom-left. */
export function HeroCard({ slide }: { slide: Slide }) {
  const title = useTextEnter(0);
  const sub = useTextEnter(1);

  return (
    <div className="card image hoverable hero">
      <img draggable={false} className="photo" src={slide.heroImage} alt={slide.city} />
      <div className="scrim" />
      <div className="hero-copy">
        <div className="tmask">
          <motion.h1 className="hero-title" {...title}>
            {slide.city}
          </motion.h1>
        </div>
        <div className="tmask">
          <motion.p className="hero-sub" {...sub}>
            {slide.subtitle}
          </motion.p>
        </div>
      </div>
    </div>
  );
}

/** Plain image card (fills its grid slot). No text — nothing to mask. */
export function ImageCard({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  return (
    <div className={`card image hoverable ${className}`}>
      <img draggable={false} className="photo" src={src} alt={alt} />
    </div>
  );
}

/** Colored text card: an optional label + heading + body/line. */
export function TextCard({
  className,
  label,
  headline,
  body,
  line,
}: {
  className: string;
  label?: string;
  headline?: string;
  body?: string;
  line?: string;
}) {
  // Not every card has every line (Explore has a label + line; the intro card
  // has a headline + body). Order by POSITION AMONG THE LINES ACTUALLY PRESENT,
  // so the first visible line always leads on the cold-load fade — during a
  // push the order doesn't matter (all lines start together).
  const present = [!!label, !!headline, !!body, !!line];
  const orderOf = (i: number) => present.slice(0, i).filter(Boolean).length;

  const mLabel = useTextEnter(orderOf(0));
  const mHeadline = useTextEnter(orderOf(1));
  const mBody = useTextEnter(orderOf(2));
  const mLine = useTextEnter(orderOf(3));

  return (
    <div className={`card textcard ${className}`}>
      {label && (
        <div className="tmask">
          <motion.div className="card-label" {...mLabel}>
            {label}
          </motion.div>
        </div>
      )}
      {headline && (
        <div className="tmask">
          <motion.h2 className="card-headline" {...mHeadline}>
            {headline}
          </motion.h2>
        </div>
      )}
      {body && (
        <div className="tmask">
          <motion.p className="card-body" {...mBody}>
            {body}
          </motion.p>
        </div>
      )}
      {line && (
        <div className="tmask">
          <motion.p className="card-line" {...mLine}>
            {line}
          </motion.p>
        </div>
      )}
    </div>
  );
}

/** Cuisine card: colored text on top, photo pinned to the bottom. */
export function CuisineCard({ slide }: { slide: Slide }) {
  const mLabel = useTextEnter(0);
  const mLine = useTextEnter(1);

  return (
    <div className="card cuisine">
      <div className="cuisine-text">
        <div className="tmask">
          <motion.div className="card-label" {...mLabel}>
            Cuisine
          </motion.div>
        </div>
        <div className="tmask">
          <motion.p className="card-line" {...mLine}>
            {slide.cuisineLine}
          </motion.p>
        </div>
      </div>
      <div className="cuisine-photo hoverable">
        <img draggable={false} className="photo" src={slide.cuisineImage} alt="Cuisine" />
      </div>
    </div>
  );
}
