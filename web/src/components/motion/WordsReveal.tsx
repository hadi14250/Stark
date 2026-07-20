"use client";

import { motion } from "framer-motion";
import { type CSSProperties, type ReactNode } from "react";
import { ease } from "@/styles/tokens";
import { useMotionConfig } from "./useMotionConfig";
import { useRevealPlay } from "./useRevealPlay";

/**
 * Type that rises out of a mask, word by word.
 *
 * This is the site's default heading entrance, applied inside SectionHeader so
 * EVERY section gets it from one edit rather than nine. The complaint it
 * answers: with only whole-block <Reveal> fades, a long page reads as static —
 * a block that translates 40px and fades is the least legible kind of motion
 * there is, because nothing inside it moves relative to anything else. Words
 * arriving in sequence is motion you can actually SEE, and it costs nothing:
 * same tokens, same easing, no new dependency.
 *
 * WHY A MASK RATHER THAN A FADE: each word sits in an overflow-hidden box and
 * slides up from below its own baseline, so it appears to be revealed by the
 * page rather than to materialise on top of it. That reads as typography; a
 * staggered opacity fade reads as a loading state.
 *
 * ARABIC IS SAFE HERE. Splitting on whitespace never lands inside a word, so
 * no cursive join is broken — the thing that made letter-spacing unusable on
 * Arabic does not apply to word-level splitting. Wrapping is flex-based, so
 * word ORDER mirrors under `dir="rtl"` automatically.
 *
 * ACCESSIBILITY: the words are real text nodes in document order, so the
 * heading is read normally. Under reduced motion this returns a plain element
 * with no wrappers at all.
 */

const STAGGER = 0.055;

type Tag = "h1" | "h2" | "h3" | "p" | "span";

export function WordsReveal({
  text,
  as = "h2",
  className,
  style,
  delay = 0,
  /**
   * Where the wrapped lines align. Defaults to the theme's `--align-axis` so a
   * left-aligned theme cannot accidentally get a centred heading.
   */
  justify = "var(--align-axis)",
}: {
  text: string;
  as?: Tag;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  justify?: string;
}) {
  const { reduce } = useMotionConfig();
  // "show" is a variant label rather than a target object — the stagger is
  // driven by variants, so the parent animates to a NAME and the children
  // inherit it. The fail-safe matters more here than anywhere: this is the
  // site's default heading entrance, so an observer that never fires leaves
  // every heading on the page at opacity 0.
  const { ref, play } = useRevealPlay<HTMLHeadingElement>("show");
  const Element = as;

  if (reduce) {
    return (
      <Element className={className} style={style}>
        {text}
      </Element>
    );
  }

  const words = text.split(/\s+/).filter(Boolean);
  const MotionElement = motion[as];

  return (
    <MotionElement
      ref={ref}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: justify,
        columnGap: "0.26em",
        ...style,
      }}
      initial="hidden"
      {...play}
      viewport={{ once: true, amount: 0.4, margin: "0px 0px -8% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: STAGGER, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: "inline-block",
            overflow: "hidden",
            // Descenders (g, y, p) and Arabic diacritics sit BELOW the line box
            // and an overflow-hidden mask clips them flat. The padding gives
            // them room; the equal negative margin gives the space back so the
            // heading's line rhythm is unchanged.
            paddingBottom: "0.16em",
            marginBottom: "-0.16em",
          }}
        >
          <motion.span
            style={{ display: "inline-block", willChange: "transform" }}
            variants={{
              hidden: { y: "115%", opacity: 0 },
              show: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.8, ease: [...ease.zoom] },
              },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionElement>
  );
}

/**
 * The same entrance for a block that is not a single string — an intro
 * paragraph, a row of pills. One mask, one slide, sequenced AFTER the heading
 * it follows so a section header resolves top-to-bottom instead of at once.
 */
export function LineReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { reduce } = useMotionConfig();
  const { ref, play } = useRevealPlay({ y: 0, opacity: 1 });

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ y: 22, opacity: 0 }}
      {...play}
      viewport={{ once: true, amount: 0.4, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease: [...ease.zoom], delay }}
    >
      {children}
    </motion.div>
  );
}
